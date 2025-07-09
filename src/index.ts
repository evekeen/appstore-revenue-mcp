import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAppStoreRevenueTools } from "./appstore-revenue.js";

const server = new McpServer({
  name: "appstore-revenue",
  version: "1.0.0",
  description: "MCP server for fetching Apple App Store revenue data using Sensor Tower API",
  capabilities: {
    resources: {},
    tools: {},
  },
});

async function main() {
  await registerAppStoreRevenueTools(server);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Don't output anything to stdout as it interferes with MCP protocol
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});