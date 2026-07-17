export type Span = { name: string; startedAt: string; durationMs: number; status: "ok" | "error"; attributes: Record<string, string | number | boolean> };

export function safeSpan(span: Span): Span {
  const attributes = Object.fromEntries(Object.entries(span.attributes).filter(([key]) => !/[Pp]rompt|content|secret|token/.test(key)));
  return { ...span, attributes };
}
