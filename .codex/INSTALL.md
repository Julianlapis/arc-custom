# Installing Arc for Codex

Enable Arc skills in Codex via native skill discovery. Clone once and symlink.

## Prerequisites

- Git
- Codex (CLI, IDE, or app)

## Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/howells/arc.git ~/.codex/arc
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/arc/skills ~/.agents/skills/arc
   ```

   **Windows (PowerShell):**
   Use a junction instead of a symlink (works without Developer Mode):
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\arc" "$env:USERPROFILE\.codex\arc\skills"
   ```

3. **Restart Codex** to discover the skills.

## Verify

```bash
ls -la ~/.agents/skills/arc
```

You should see a symlink (or junction on Windows) pointing to the Arc `skills/` directory.

## Usage

Skills are discovered automatically. You can:

- **Explicit invocation (recommended):** use `$start`, `$ideate`, `$implement`, etc.
- **Implicit invocation:** ask for a task that matches a skill description and Codex may select it automatically.

## Updating

```bash
cd ~/.codex/arc && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.agents/skills/arc
```

Optionally delete the clone: `rm -rf ~/.codex/arc`.

