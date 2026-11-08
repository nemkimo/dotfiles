/**
 * Read-Only Git Extension
 *
 * Registers `git_read`, a read-only git inspection tool: status, log, diff,
 * show, branch, blame, ls-files, rev-parse, remote, config.
 *
 * Arguments are built from typed parameters and executed without a shell, so
 * no call can redirect output, run a command from a repo file, or pass a
 * write-capable flag. Git is always invoked with --no-optional-locks,
 * core.fsmonitor=false, and (for diffs) --no-ext-diff --no-textconv.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "typebox";

const MAX_OUTPUT_BYTES = 50 * 1024;
const GIT_TIMEOUT_MS = 30_000;
const GIT_MAX_BUFFER = 8 * 1024 * 1024;

const gitParameters = Type.Object({
	command: Type.Union([
		Type.Literal("status"),
		Type.Literal("log"),
		Type.Literal("diff"),
		Type.Literal("show"),
		Type.Literal("branch"),
		Type.Literal("blame"),
		Type.Literal("ls-files"),
		Type.Literal("rev-parse"),
		Type.Literal("remote"),
		Type.Literal("config"),
	]),
	ref: Type.Optional(Type.String({ description: "Revision, for example HEAD, main, or HEAD~3" })),
	path: Type.Optional(Type.String({ description: "File or directory, relative to the project root" })),
	key: Type.Optional(Type.String({ description: "Config key for command 'config', for example user.email" })),
	staged: Type.Optional(Type.Boolean({ description: "diff: show staged changes" })),
	stat: Type.Optional(Type.Boolean({ description: "diff/show: show a diffstat" })),
	context: Type.Optional(Type.Number({ description: "diff/show: context lines (1-50, default 3)" })),
	maxCount: Type.Optional(Type.Number({ description: "log: commits to show (1-500, default 20)" })),
});

type GitParams = Static<typeof gitParameters>;

function clamp(value: number | undefined, fallback: number, min: number, max: number): number {
	if (value === undefined || !Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, Math.trunc(value)));
}

/** Positional arguments must not be readable as git options. */
function positional(value: string | undefined, label: string): string | undefined {
	const trimmed = value?.trim();
	if (!trimmed) return undefined;
	if (trimmed.startsWith("-") || /[\n\r\u0000]/.test(trimmed)) {
		throw new Error(`${label} must not start with "-" or contain line breaks`);
	}
	return trimmed;
}

function buildGitArgs(params: GitParams): string[] {
	const base = ["--no-pager", "--no-optional-locks", "-c", "core.fsmonitor=false"];
	const ref = positional(params.ref, "ref");
	const file = positional(params.path, "path");
	const tail = file ? ["--", file] : [];

	switch (params.command) {
		case "status":
			return [...base, "status", "--short", "--branch", ...tail];
		case "log":
			return [
				...base,
				"log",
				"--no-decorate",
				`-n${clamp(params.maxCount, 20, 1, 500)}`,
				...(params.stat ? ["--stat"] : []),
				...(ref ? [ref] : []),
				...tail,
			];
		case "diff":
			return [
				...base,
				"diff",
				"--no-ext-diff",
				"--no-textconv",
				`-U${clamp(params.context, 3, 1, 50)}`,
				...(params.staged ? ["--cached"] : []),
				...(params.stat ? ["--stat"] : []),
				...(ref ? [ref] : []),
				...tail,
			];
		case "show":
			return [
				...base,
				"show",
				"--no-ext-diff",
				"--no-textconv",
				`-U${clamp(params.context, 3, 1, 50)}`,
				...(params.stat ? ["--stat"] : []),
				...(ref ? [ref] : []),
				...tail,
			];
		case "branch":
			return [...base, "branch", "--list"];
		case "blame":
			if (!file) throw new Error("blame requires path");
			return [...base, "blame", ...(ref ? [ref] : []), "--", file];
		case "ls-files":
			return [...base, "ls-files", ...tail];
		case "rev-parse":
			return [...base, "rev-parse", ...(ref ? [ref] : ["HEAD"])];
		case "remote":
			return [...base, "remote", "-v"];
		case "config": {
			const key = params.key?.trim();
			if (!key || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(key)) {
				throw new Error("config requires a key such as user.email");
			}
			return [...base, "config", "--get", key];
		}
	}
}

function truncateOutput(text: string): string {
	if (Buffer.byteLength(text, "utf8") <= MAX_OUTPUT_BYTES) return text;
	const cut = Buffer.from(text, "utf8").subarray(0, MAX_OUTPUT_BYTES).toString("utf8");
	const lastNewline = cut.lastIndexOf("\n");
	const body = lastNewline > 0 ? cut.slice(0, lastNewline) : cut;
	return `${body}\n\n[git_read: output truncated to ${MAX_OUTPUT_BYTES / 1024}KB]`;
}

export default function (pi: ExtensionAPI): void {
	pi.registerTool({
		name: "git_read",
		label: "git_read",
		description:
			"Read-only git inspection. Commands: status, log, diff, show, branch, blame, ls-files, rev-parse, remote, config. Never writes to the repository.",
		promptSnippet: "Read-only git inspection (status, log, diff, show, blame, ls-files, rev-parse, remote, config)",
		promptGuidelines: [
			"Use git_read only if you do not have access to git through bash.",
		],
		parameters: gitParameters,
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const args = buildGitArgs(params);
			const result = await pi.exec("git", args, {
				cwd: ctx.cwd,
				signal,
				timeout: GIT_TIMEOUT_MS,
				maxBuffer: GIT_MAX_BUFFER,
			});
			const output = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n") || "(no output)";
			const text = result.code === 0 ? output : `git exited with code ${result.code}\n\n${output}`;
			return {
				content: [{ type: "text", text: truncateOutput(text) }],
				details: { command: params.command, args, exitCode: result.code },
			};
		},
	});
}
