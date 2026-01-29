# CLI Design

Rules for project CLIs that expose the API for local development and coding agent use.

## Philosophy

- MUST: Every project with an API ships a companion CLI.
- MUST: Dual-mode — scripted (with args) and interactive (no args).
- MUST: Use Ink (React TUI) for interactive mode in React projects.
- MUST: Use Commander for argument parsing in scripted mode.

Rationale: CLIs make APIs accessible to coding agents, shell scripts, and local workflows without needing a running browser or HTTP client. The dual-mode pattern serves both power users (scripted) and discovery (interactive).

## Scripted Mode

Activated when arguments are provided: `tool <command> [options]`.

- MUST: Commander for argument parsing with typed options.
- MUST: `--json` flag for machine-readable JSON output on stdout.
- MUST: Non-interactive when args are provided — never prompt for input.
- MUST: Exit codes: `0` success, `1` error, `2` usage/validation.
- SHOULD: `--quiet` flag to suppress non-essential output.
- SHOULD: Short aliases for common flags (`-m` for `--model`, `-o` for `--output`).

```ts
// Entry point routing
const args = process.argv.slice(2);
if (args.length > 0) {
  await runCli(args);   // Commander handles it
} else {
  await launchStudio(); // Ink interactive mode
}
```

## Interactive Mode

Activated with no arguments: `tool`.

- MUST: Ink + React for the TUI framework.
- MUST: Screen-based navigation (Home screen routes to feature screens).
- MUST: Keyboard shortcuts documented in the UI (footer or header hints).
- SHOULD: `useInput()` for keyboard handling with arrow keys, Enter, Escape.
- SHOULD: State machine pattern for multi-step flows.
- SHOULD: Escape to go back, `q` to quit.

### Screen Pattern

```tsx
type Screen = "home" | "generate" | "settings";

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  useInput((input, key) => {
    if (input === "q") exit();
    if (key.escape) setScreen("home");
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      {screen === "home" && <HomeScreen onNavigate={setScreen} />}
      {screen === "generate" && <GenerateScreen />}
      {screen === "settings" && <SettingsScreen />}
      <Footer />
    </Box>
  );
}
```

### Multi-Step Flow Pattern

```tsx
type Step = "input" | "configure" | "confirm" | "processing" | "done";

function GenerateScreen() {
  const [step, setStep] = useState<Step>("input");

  useInput((input, key) => {
    if (key.escape && step !== "processing") goBack();
    if (input === "y" && step === "confirm") execute();
    if (input === "n" && step === "confirm") goBack();
  });
  // ...
}
```

## Architecture

```
tool/
├── bin/tool              # Entry point
├── src/
│   ├── index.ts          # Routes CLI vs Studio
│   ├── cli.ts            # Commander argument parsing
│   ├── api/              # API client (shared between CLI and web)
│   │   ├── client.ts
│   │   └── types.ts
│   ├── studio/           # Ink interactive TUI
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── screens/
│   └── utils/
│       └── config.ts     # Config management
```

- MUST: API client shared between CLI and web app — same types, same logic.
- MUST: Separate `cli.ts` (parsing) from `studio/` (interactive) from `api/` (business logic).
- SHOULD: Config hierarchy: env vars > global (`~/.tool/config.json`) > local (`.toolrc`).
- SHOULD: Atomic writes for config persistence.

## Agent Friendliness

CLIs are a primary interface for coding agents. Design for them:

- MUST: `--json` outputs structured data, not decorated text.
- MUST: Errors in JSON mode are also structured: `{ "error": { "code": "...", "message": "..." } }`.
- MUST: No color codes or spinners when stdout is not a TTY.
- SHOULD: `--help` output is complete and shows all options with examples.
- SHOULD: Support stdin piping for batch operations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `commander` | Argument parsing (scripted mode) |
| `ink` | React-based TUI framework (interactive mode) |
| `ink-text-input` | Text input component |
| `react` | Shared with web app |
| `chalk` | Terminal colors (scripted mode output) |

See [api.md](api.md) for API design conventions the CLI exposes.
