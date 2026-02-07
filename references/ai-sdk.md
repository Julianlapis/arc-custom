# AI SDK 6 Patterns Reference

Comprehensive patterns for Vercel AI SDK 6. Load this when building AI features.

## Mental Model

Everything goes through `generateText` now. There is no `generateObject` — use `Output` helpers to get structured data back from `generateText`. The `streamText` function still exists for streaming.

```typescript
import { generateText, Output } from 'ai';
```

## Structured Output

### Output.object — Single typed object

```typescript
import { generateText, Output } from 'ai';
import { z } from 'zod';

const { output } = await generateText({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  prompt: 'Analyze this code for issues',
  output: Output.object({
    schema: z.object({
      issues: z.array(z.object({
        severity: z.enum(['critical', 'warning', 'info']),
        message: z.string(),
        line: z.number().optional(),
      })),
      summary: z.string(),
    }),
  }),
});

// output is fully typed — no JSON.parse needed
console.log(output.issues);
```

### Output.array — Array of typed elements

```typescript
const { output } = await generateText({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  prompt: 'List the top 5 actions to take',
  output: Output.array({
    element: z.object({
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    }),
  }),
});

// output is typed as the array
for (const item of output) {
  console.log(item.action, item.priority);
}
```

### Output.choice — Classification

```typescript
const { output } = await generateText({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  prompt: `Classify this support ticket: "${ticket.text}"`,
  output: Output.choice({
    options: {
      bug: z.object({ component: z.string(), severity: z.enum(['p0', 'p1', 'p2']) }),
      feature: z.object({ description: z.string() }),
      question: z.object({ topic: z.string() }),
    },
  }),
});

// output is a discriminated union
if (output.type === 'bug') {
  console.log(output.value.component, output.value.severity);
}
```

## useChat v6 Setup

`useChat` no longer manages input state or provides `handleSubmit`. You manage input with `useState` and call `sendMessage`.

```typescript
'use client';

import { useChat, DefaultChatTransport } from '@ai-sdk/react';
import { useState } from 'react';

export function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.parts.map(p => p.type === 'text' ? p.text : null)}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

## Tool Definitions

Tools use `inputSchema` (not `parameters`) and parts use `input`/`output` (not `args`/`result`).

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get current weather for a location',
  inputSchema: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({ city, units }) => {
    const data = await fetchWeather(city, units);
    return { temperature: data.temp, conditions: data.conditions };
  },
});
```

## Building Agents

Use `ToolLoopAgent` for agents that call tools in a loop. Use `stopWhen: stepCountIs(n)` instead of the removed `maxSteps`.

```typescript
import { generateText, ToolLoopAgent, stepCountIs } from 'ai';

const agent = new ToolLoopAgent({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  system: 'You are a helpful research assistant.',
  tools: { search: searchTool, analyze: analyzeTool },
  stopWhen: stepCountIs(10),
});

const { output } = await agent.run('Research the latest trends in AI');
```

## Type-Safe Agent UI

Use `InferAgentUIMessage` to get typed message parts for rendering tool invocations in the UI.

```typescript
import type { InferAgentUIMessage, UIToolInvocation } from 'ai';

// Infer message type from your agent
type AgentMessage = InferAgentUIMessage<typeof agent>;

// Type-safe tool part rendering
function ToolPart({ part }: { part: UIToolInvocation<typeof weatherTool> }) {
  // part.input is typed (not part.args)
  // part.output is typed (not part.result)

  switch (part.state) {
    case 'partial-call':
      return <div>Calling weather for {part.input?.city}...</div>;
    case 'call':
      return <div>Getting weather for {part.input.city}...</div>;
    case 'result':
      return <div>Weather in {part.input.city}: {part.output.temperature}°</div>;
  }
}
```

Use typed `tool-{toolName}` parts instead of the removed `tool-invocation` part type:

```typescript
function MessagePart({ part }: { part: AgentMessage['parts'][number] }) {
  switch (part.type) {
    case 'text':
      return <span>{part.text}</span>;
    case 'tool-weather':
      return <ToolPart part={part} />;
    case 'tool-search':
      return <SearchPart part={part} />;
  }
}
```

## Streaming to UI

### streamText + toUIMessageStreamResponse

For basic streaming with `useChat`:

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4.5'),
    messages,
  });

  return result.toUIMessageStreamResponse();
}
```

### createAgentUIStreamResponse

For agents with tool loops. Note: use `uiMessages` not `messages`.

```typescript
// app/api/chat/route.ts
import { createAgentUIStreamResponse } from 'ai';

export async function POST(req: Request) {
  const { uiMessages } = await req.json();

  return createAgentUIStreamResponse({
    agent,
    uiMessages,
  });
}
```

## OpenRouter Provider

### Basic setup

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';

const result = await generateText({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  prompt: 'Hello',
});
```

### Custom configuration

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const or = createOpenRouter({
  headers: { 'HTTP-Referer': 'https://yourapp.com' },
  extraBody: {
    providers: { anthropic: { cacheControl: true } },  // prompt caching
  },
});

const result = await generateText({
  model: or('anthropic/claude-sonnet-4.5'),
  prompt: 'Hello',
});
```

### Embedding models

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { embed } from 'ai';

const { embedding } = await embed({
  model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
  value: 'text to embed',
});
```

## Tool Output Handling

When the user needs to provide tool output (e.g., human-in-the-loop), use `addToolOutput`:

```typescript
const { addToolOutput } = useChat({ /* ... */ });

// When user provides tool result
addToolOutput({
  tool: 'confirmAction',
  toolCallId: part.toolCallId,
  output: { confirmed: true },
});
```

## Prompt Size & Tool Use

### When to chunk inputs

If your prompt payload exceeds ~50K tokens, chunk the input and process in batches:

```typescript
const chunks = splitIntoChunks(largeDocument, 30000);
const results = await Promise.all(
  chunks.map(chunk =>
    generateText({
      model: openrouter('anthropic/claude-sonnet-4.5'),
      prompt: `Analyze this section: ${chunk}`,
      output: Output.object({ schema: analysisSchema }),
    })
  )
);
```

### When to use tool calling instead

For very large inputs, give the model tools to retrieve what it needs:

```typescript
const tools = {
  searchDocs: tool({
    description: 'Search documentation by query',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => searchIndex(query),
  }),
  readSection: tool({
    description: 'Read a specific section by ID',
    inputSchema: z.object({ sectionId: z.string() }),
    execute: async ({ sectionId }) => getSection(sectionId),
  }),
};
```

### Setting maxOutputTokens

Always set `maxOutputTokens` when you know the expected output size:

```typescript
const { output } = await generateText({
  model: openrouter('anthropic/claude-sonnet-4.5'),
  prompt: 'Classify this text',
  output: Output.choice({ options: { ... } }),
  maxOutputTokens: 256,  // classification doesn't need many tokens
});
```

## Quick Migration Table

| Old (v5 and earlier) | New (v6) |
|---|---|
| `generateObject()` | `generateText()` with `Output.object()` |
| `maxTokens` | `maxOutputTokens` |
| `maxSteps` | `stopWhen: stepCountIs(n)` |
| `parameters` (in tools) | `inputSchema` |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| `part.type === 'tool-invocation'` | `part.type === 'tool-{toolName}'` |
| `part.args` | `part.input` |
| `part.result` | `part.output` |
| `addToolResult()` | `addToolOutput()` |
| `messages` (in createAgentUIStreamResponse) | `uiMessages` |
| `useChat({ api: '/api/chat' })` | `useChat({ transport: new DefaultChatTransport({ api: '/api/chat' }) })` |
| `input` / `handleInputChange` / `handleSubmit` from useChat | `useState` + `sendMessage({ text })` |
