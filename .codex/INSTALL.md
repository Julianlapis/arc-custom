# Installing Arc for Codex

Enable Arc skills in Codex with native skill discovery.

Codex best-practice path is `~/.agents/skills` (legacy `~/.codex/skills` still works).

## Prerequisites

- Git
- Codex (CLI, IDE, or app)
- macOS/Linux for the one-command installer below

## Quick Install (Recommended)

Install Arc and link it into Codex skills:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh)
```

Install with scheduled auto-updates every 6 hours:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/howells/arc/main/.codex/install.sh) --auto-update --interval-hours 6
```

What this does:

1. Clones Arc to `~/.codex/arc` (or fast-forwards if already installed).
2. Symlinks `~/.agents/skills/arc` to `~/.codex/arc/skills`.
3. Optionally configures scheduled updates using launchd (macOS) or cron (Linux).

Restart Codex if skills do not appear immediately.

## Manual Install

```bash
git clone https://github.com/howells/arc.git ~/.codex/arc
mkdir -p ~/.agents/skills
ln -s ~/.codex/arc/skills ~/.agents/skills/arc
```

## Windows Manual Install (PowerShell)

Use a junction instead of a symlink (works without Developer Mode):

```powershell
git clone https://github.com/howells/arc.git "$env:USERPROFILE\.codex\arc"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\arc" "$env:USERPROFILE\.codex\arc\skills"
```

## Verify

```bash
ls -la ~/.agents/skills/arc
```

You should see a symlink/junction pointing to Arc `skills/`.

## Usage

Skills are discovered automatically. You can:

- Explicit invocation (recommended): `$start`, `$ideate`, `$implement`, etc.
- Implicit invocation: ask for a task that matches a skill description.

## Updating

Manual update:

```bash
~/.codex/arc/.codex/update.sh
```

Enable or change auto-update later:

```bash
~/.codex/arc/.codex/enable-auto-update.sh --interval-hours 6
```

## Uninstalling

```bash
rm ~/.agents/skills/arc
rm -rf ~/.codex/arc
```
