# React Correctness Rules

Scope: React and Next.js apps. Pass to `daniel-product-engineer`, `lee-nextjs-engineer`, `security-engineer`, and `senior-engineer` during audits.

## Keys & Rendering

- MUST: Use stable unique IDs as `key`, not array index — index keys cause state bugs on reorder/insert/delete
  - Exception: Static lists generated from `Array.from()` placeholders where items never reorder
- MUST NOT: Use `&&` with numbers for conditional rendering — `{count && <Badge />}` renders `0`
  - FIX: `{count > 0 ? <Badge /> : null}`

## State & Effects

- MUST NOT: Use `useEffect` that only calls `setState` derived from deps — replace with `useMemo`:
  ```ts
  // Wrong — unnecessary effect + re-render
  const [fullName, setFullName] = useState('');
  useEffect(() => setFullName(`${first} ${last}`), [first, last]);

  // Right — derived state
  const fullName = useMemo(() => `${first} ${last}`, [first, last]);
  ```
- SHOULD: Consolidate 3+ related `useState` calls into `useReducer` or a single state object
- SHOULD: Batch multiple `setState` calls in one handler into a single update (React 18+ batches automatically in most cases, but verify in async callbacks)
- MUST NOT: Fetch data in `useEffect` — use React Query, SWR, or server components instead

## Naming & Structure

- SHOULD: Name event handlers by what they do, not what they handle:
  - Wrong: `handleClick`, `handleChange`
  - Right: `handleSubmitOrder`, `handleUpdateQuantity`
- SHOULD: Break components over 250 lines into smaller focused components
- MUST NOT: Use inline render functions in JSX (`{renderItems()}`) — extract to a named component
  - Inline render functions don't get their own reconciliation boundary, causing unnecessary re-renders of siblings

## Security

- MUST NOT: Use `eval()`, `new Function()`, or string-argument `setTimeout`/`setInterval` — code injection risk
- MUST NOT: Hardcode secrets in source — detected by variable name patterns: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`
  - FIX: Use environment variables via `process.env` or `.env` files
- MUST: Flag every `dangerouslySetInnerHTML` usage for security review — ensure input is sanitized (DOMPurify or equivalent)

## Server Components & Actions (Next.js)

- MUST NOT: Make client components async — `"use client"` components cannot be async (they return a Promise, not JSX)
- MUST: Add auth check at the top of every server action — `auth()`, `getSession()`, or equivalent before any data mutation
- SHOULD: Use `next/image` instead of `<img>` — provides automatic optimization, lazy loading, and layout shift prevention
- SHOULD: Use `next/link` instead of `<a>` for internal navigation — enables client-side transitions and prefetching
- SHOULD: Use `next/font` instead of `<link>` Google Font tags — eliminates layout shift from font loading

## Error Handling

- MUST: Wrap async operations in try/catch with meaningful error handling — no empty catch blocks
- SHOULD: Add error boundaries around feature sections that can fail independently
- MUST NOT: Silently swallow errors — at minimum log them; prefer surfacing to the user
