# AI SDK Rules

Scope: Projects using Vercel AI SDK 6+ (`ai` package).

## Deprecated APIs (NEVER use)

- NEVER: `maxTokens` — renamed to `maxOutputTokens`.
- NEVER: `parameters` in tool definitions — renamed to `inputSchema`.
- NEVER: `generateObject()` — removed. Use `generateText()` with `Output.object({ schema })`.
- NEVER: `maxSteps` — removed. Use `stopWhen: stepCountIs(n)` (import `stepCountIs` from `ai`).
- NEVER: `toDataStreamResponse()` — renamed to `toUIMessageStreamResponse()` when using `useChat`.
- NEVER: `tool-invocation` as a part type — use typed `tool-{toolName}` parts.
- NEVER: `part.args` / `part.result` — renamed to `part.input` / `part.output`.
- NEVER: `addToolResult()` — renamed to `addToolOutput()` (with `output` not `result`).
- NEVER: `messages` in `createAgentUIStreamResponse()` — renamed to `uiMessages`.

## useChat (v6 Breaking Changes)

- MUST: Manage input state yourself with `useState`. `useChat` no longer provides `input`, `handleInputChange`, or `handleSubmit`.
- MUST: Use `transport: new DefaultChatTransport({ api: '/api/chat' })` instead of `api` prop.
- MUST: Use `sendMessage({ text })` instead of `handleSubmit`.

## Structured Output

- MUST: Always use structured output when you need typed data back. Never parse JSON from `result.text` manually.
- MUST: Use `Output.object({ schema })`, `Output.array({ element })`, or `Output.choice({ options })` with `generateText`.
- MUST: Access results via `result.output`, not `result.text`.
- SHOULD: Use `Output.choice({ options })` for classification tasks instead of asking the model to return a string and comparing it.

## Providers

- SHOULD: Use OpenRouter as the default provider via `@openrouter/ai-sdk-provider`. Model IDs use `provider/model` format (e.g., `openrouter('anthropic/claude-sonnet-4.5')`).
- MUST: Set `OPENROUTER_API_KEY` in `.env.local`. The provider reads it automatically.
- SHOULD: Use `createOpenRouter()` when you need custom config (headers, extraBody, prompt caching). Use the default `openrouter` import for simple cases.
- MUST: When requests hang silently, check prompt size first. OpenRouter has provider-specific context limits that may be smaller than the model's advertised limit.

## Agents

- SHOULD: Use `ToolLoopAgent` for agents with tool loops.
- SHOULD: Use `InferAgentUIMessage<typeof agent>` for type-safe tool rendering in `useChat`.

## Prompt Engineering

- MUST: Keep prompts under 100K tokens. Large payloads cause requests to hang silently on OpenRouter and other providers. If the input is large, chunk it or use tool calling to let the model request what it needs.
- SHOULD: Prefer tool calling over prompt stuffing. Instead of pasting an entire codebase/document into the prompt, give the model a tool to search/retrieve relevant sections. This is cheaper, faster, and more reliable.
- SHOULD: Set `maxOutputTokens` explicitly when you know the expected output size. Prevents runaway generation and reduces cost.

## Verification

- MUST: When unsure about an API, check `node_modules/ai/docs/` and `node_modules/ai/src/` before using it. Do not trust memorized APIs.

## Further Reading

For complete migration patterns and code examples, reference the `use-ai-sdk` skill or invoke `/arc:ai`.
