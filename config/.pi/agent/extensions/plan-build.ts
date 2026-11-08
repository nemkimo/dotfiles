/**
 * Plan/Build Mode Extension
 *
 * Starts in build mode. Shift+Tab switches to plan mode, which exposes only
 * read-only tools: read, grep, find, ls, and git_read (provided by git-read.ts).
 * edit, write, and bash are removed from the active set, so plan mode has no
 * tool that can modify the workspace.
 *
 * Shift+Tab is bound to app.thinking.cycle by default and reserved actions
 * cannot be overridden by extension shortcuts. Free it in keybindings.json:
 *   { "app.thinking.cycle": [] }
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const PLAN_TOOLS = ["read", "grep", "find", "ls", "git_read"];
const BUILD_EXTRA_TOOLS = ["grep"];
const WIDGET_KEY = "plan-build";

export default function (pi: ExtensionAPI): void {
	let planMode = false;
	let buildTools: string[] = [];

	const render = (ctx: ExtensionContext): void => {
		const theme = ctx.ui.theme;
		const label = planMode ? theme.fg("warning", "[plan]") : theme.fg("accent", "[build]");
		ctx.ui.setWidget(WIDGET_KEY, [label], { placement: "belowEditor" });
	};

	const apply = (ctx: ExtensionContext): void => {
		pi.setActiveTools(planMode ? PLAN_TOOLS : buildTools);
		render(ctx);
	};

	const toggle = (ctx: ExtensionContext): void => {
		planMode = !planMode;
		apply(ctx);
		ctx.ui.notify(
			planMode
				? "Plan mode: read-only tools (read, grep, find, ls, git_read). Shift+Tab for build."
				: "Build mode: full tool set.",
			"info",
		);
	};

	pi.registerShortcut("shift+tab", {
		description: "Toggle plan/build mode",
		handler: async (ctx) => toggle(ctx),
	});

	pi.on("session_start", (_event, ctx) => {
		planMode = false;
		buildTools = [...new Set([...pi.getActiveTools(), ...BUILD_EXTRA_TOOLS])];
		apply(ctx);
	});

	pi.on("before_agent_start", (event) => {
		const sections = event.systemPromptOptions.sections;
		if (!planMode) {
			delete sections.plan_mode;
			return;
		}
		sections.plan_mode = [
			"Plan mode is active. Only read-only tools are available: read, grep, find, ls, and git_read.",
			"edit, write, and bash are disabled, so you cannot modify files or run commands.",
			"",
			"Investigate the codebase with those tools and reply with a concrete plan:",
			"which files to change, what to change, and why. Do not claim to have made changes.",
			"The user switches back to build mode with Shift+Tab.",
		].join("\n");
	});
}
