/**
 * Bash Guard Extension
 *
 * Blocks bash tool calls that are considered dangerous.
 * Edit the array below and run /reload to apply changes.
 *
 * Each entry is a command phrase matched as whole words anywhere in the command.
 */

import {
  isToolCallEventType,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";

interface BlockedCommand {
  /** Command words to block, e.g. "sudo" or "git push". */
  command: string;
  /** Optional explanation shown to the user and the model. */
  reason?: string;
}

const BLOCKED_COMMANDS: BlockedCommand[] = [
  // Git
  { command: "git add", reason: "adding files to git is not allowed" },
  { command: "git rm", reason: "removing files from git is not allowed" },
  { command: "git commit", reason: "commit is not allowed" },
  { command: "git push", reason: "pushing to remotes is not allowed" },
  { command: "git reset", reason: "reset is not allowed" },

  // Privilege escalation
  { command: "sudo", reason: "privilege escalation" },
  { command: "su", reason: "privilege escalation" },
  { command: "doas", reason: "privilege escalation" },
  { command: "pkexec", reason: "privilege escalation" },
  { command: "visudo", reason: "changes sudo rules" },
  { command: "passwd", reason: "changes passwords" },
  { command: "useradd", reason: "changes user accounts" },
  { command: "usermod", reason: "changes user accounts" },
  { command: "userdel", reason: "changes user accounts" },
  { command: "chroot", reason: "changes root directory" },

  // Destructive disk and file operations
  { command: "rm -rf", reason: "recursive forced deletion" },
  { command: "rm -fr", reason: "recursive forced deletion" },
  { command: "shred", reason: "irreversible file destruction" },
  { command: "mkfs", reason: "formats filesystems" },
  { command: "wipefs", reason: "destroys filesystem signatures" },
  { command: "fdisk", reason: "changes partitions" },
  { command: "parted", reason: "changes partitions" },
  { command: "dd", reason: "raw disk copy and overwrite" },
  { command: "chmod -R", reason: "recursive permission change" },
  { command: "chown -R", reason: "recursive ownership change" },

  // Mounts and firewall
  { command: "mount", reason: "changes mounted filesystems" },
  { command: "umount", reason: "changes mounted filesystems" },
  { command: "iptables", reason: "changes firewall rules" },
  { command: "ip6tables", reason: "changes firewall rules" },
  { command: "nft", reason: "changes firewall rules" },
  { command: "ufw", reason: "changes firewall rules" },

  // System control
  { command: "shutdown", reason: "stops the system" },
  { command: "reboot", reason: "restarts the system" },
  { command: "halt", reason: "stops the system" },
  { command: "poweroff", reason: "stops the system" },
  { command: "systemctl", reason: "controls system services" },
  { command: "service", reason: "controls system services" },
  { command: "crontab", reason: "changes scheduled jobs" },
  { command: "killall", reason: "kills processes by name" },
  { command: "pkill", reason: "kills processes by name" },
  { command: "kill -9 -1", reason: "kills all processes" },

  // Remote access and network transfer
  { command: "ssh", reason: "remote access" },
  { command: "scp", reason: "remote file transfer" },
  { command: "sftp", reason: "remote file transfer" },
  { command: "rsync", reason: "file transfer that can reach remote hosts" },
  { command: "ftp", reason: "remote file transfer" },
  { command: "telnet", reason: "remote access" },
  { command: "nc", reason: "raw network connections" },
  { command: "ncat", reason: "raw network connections" },
  { command: "netcat", reason: "raw network connections" },
  { command: "socat", reason: "raw network connections" },

  // Decoding hidden payloads
  { command: "base64 -d", reason: "decodes hidden payloads" },

  // Code execution wrappers and eval
  { command: "eval", reason: "executes arbitrary code" },
  { command: "bash -c", reason: "nested shell execution" },
  { command: "sh -c", reason: "nested shell execution" },
  { command: "zsh -c", reason: "nested shell execution" },

  // Credentials and secrets
  { command: "/etc/shadow", reason: "system password hashes" },
  { command: ".ssh/id_", reason: "private SSH keys" },
  { command: ".aws/credentials", reason: "cloud credentials" },

  // Publishing
  { command: "npm publish", reason: "publishes packages" },
  { command: "twine upload", reason: "publishes packages" },
  { command: "cargo publish", reason: "publishes packages" },

  // Fork bomb
  { command: ":(){", reason: "fork bomb" },
];

/** Downloads piped into a shell, e.g. "curl https://x | sh". */
const PIPE_TO_SHELL = /\b(curl|wget)\b[^\n]*\|\s*(sudo\s+)?(ba|z|da)?sh\b/;

const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildPattern(entry: BlockedCommand): RegExp {
  const words = entry.command.trim().split(/\s+/).map(escapeRegex).join("\\s+");
  // Must start at a command boundary and end at a word boundary.
  return new RegExp(`(^|[\\s;&|(\`"'])${words}(?=$|[\\s;&|)\`"'])`);
}

export default function(pi: ExtensionAPI) {
  const rules = BLOCKED_COMMANDS.map((entry) => ({
    entry,
    pattern: buildPattern(entry),
  }));

  pi.on("tool_call", async (event, ctx) => {
    if (!isToolCallEventType("bash", event)) return undefined;

    const command = event.input.command;
    const match = rules.find((rule) => rule.pattern.test(command));
    let problem: string | undefined;
    if (match) {
      problem = `"${match.entry.command}" is blocked${match.entry.reason ? `: ${match.entry.reason}` : ""}`;
    } else if (PIPE_TO_SHELL.test(command)) {
      problem = "downloaded code is piped into a shell";
    }
    if (!problem) return undefined;

    const reason = `Blocked by bash-guard: ${problem}.`;
    if (ctx.hasUI) {
      ctx.ui.notify(reason, "warning");
    }
    return { block: true, reason };
  });
}
