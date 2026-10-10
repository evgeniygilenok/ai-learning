import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "practice-read-only-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--experimental-strip-types", fileURLToPath(new URL("./mcp-server.ts", import.meta.url))],
  env: { MCP_TENANT_ID: "demo-bank", MCP_SCOPES: "transfers:read", MCP_WRITE_MODE: "disabled" }
});
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map(tool => tool.name).sort(), ["draftEscalation", "lookupTransfer"]);
  const lookup = await client.callTool({ name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } });
  assert.equal(lookup.isError, undefined);
  assert.equal((lookup.structuredContent as { output: { status: string } }).output.status, "pending");
  const denied = await client.callTool({ name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "another-bank" } });
  assert.equal(denied.isError, true);
  const write = await client.callTool({ name: "draftEscalation", arguments: {
    transferId: "tr_001", tenantId: "demo-bank", reason: "Synthetic policy review", idempotencyKey: "practice-client-check"
  } });
  assert.equal(write.isError, true);
  console.log("MCP client passed: tools discovered, read executed, tenant mismatch and write denied.");
} finally { await client.close(); }
