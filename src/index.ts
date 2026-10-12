import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server";

async function main() {
    const transport = new StdioServerTransport();

    await server.connect(transport);

    console.error("[mcp] server up");
}

main().catch((error) => {
    console.error("[mcp] fatal:", error);
    process.exit(1);
});