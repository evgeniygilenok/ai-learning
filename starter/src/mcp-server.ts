import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  InMemoryToolExecutionStore,
  executeTool,
  type ToolContext,
  type ToolResult
} from "./tools.ts";

type McpEnvironment = Pick<NodeJS.ProcessEnv, "MCP_ACTOR_ID" | "MCP_TENANT_ID" | "MCP_SCOPES" | "MCP_SESSION_ID" | "MCP_WRITE_MODE">;

export function createMcpToolHandlers(env: McpEnvironment = process.env, store = new InMemoryToolExecutionStore()) {
  const context = contextFromEnv(env);
  return {
    lookupTransfer(args: { transferId: string; tenantId: string }): ToolResult {
      return executeTool({ name: "lookupTransfer", args }, { context, dryRun: false });
    },
    draftEscalation(args: { transferId: string; tenantId: string; reason: string; idempotencyKey: string }): ToolResult {
      const mode = env.MCP_WRITE_MODE ?? "disabled";
      const approved = mode === "approved" || mode === "dry-run-approved";
      return executeTool(
        { name: "draftEscalation", args: { transferId: args.transferId, tenantId: args.tenantId, reason: args.reason } },
        { context, approved, dryRun: mode !== "approved", idempotencyKey: args.idempotencyKey, store }
      );
    }
  };
}

export function createMcpServer(env: McpEnvironment = process.env): McpServer {
  const server = new McpServer({ name: "regulated-support-tools", version: "1.0.0" });
  const handlers = createMcpToolHandlers(env);

  server.registerTool(
    "lookupTransfer",
    {
      title: "Lookup synthetic transfer",
      description: "Read-only lookup constrained to the MCP server's configured tenant and scope.",
      inputSchema: {
        transferId: z.string().min(3),
        tenantId: z.string().min(3)
      }
    },
    async (args) => asMcpResult(() => handlers.lookupTransfer(args))
  );

  server.registerTool(
    "draftEscalation",
    {
      title: "Draft synthetic escalation",
      description: "Approval-gated draft. The client cannot grant itself authority through tool arguments.",
      inputSchema: {
        transferId: z.string().min(3),
        tenantId: z.string().min(3),
        reason: z.string().min(8),
        idempotencyKey: z.string().min(8)
      }
    },
    async (args) => asMcpResult(() => handlers.draftEscalation(args))
  );
  return server;
}

if (process.argv[1]?.endsWith("mcp-server.ts")) {
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
}

function contextFromEnv(env: McpEnvironment): ToolContext {
  return {
    actorId: env.MCP_ACTOR_ID ?? "local-mcp-user",
    tenantId: env.MCP_TENANT_ID ?? "demo-bank",
    scopes: (env.MCP_SCOPES ?? "transfers:read").split(",").map((scope) => scope.trim()).filter(Boolean),
    sessionId: env.MCP_SESSION_ID ?? "local-mcp-session"
  };
}

function asMcpResult(run: () => ToolResult) {
  try {
    const result = run();
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }], structuredContent: result as unknown as Record<string, unknown> };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Tool request failed closed" }]
    };
  }
}
