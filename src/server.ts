import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { tools } from "./tools/definitions";
import { listRepositories } from "./handlers/listRepositories";
import { createRepository } from "./handlers/createRepository";
import { createIssue } from "./handlers/createIssue";
import { createCommit } from "./handlers/createCommit";
import { listIssues } from "./handlers/listIssues";
import { fail } from "./utils/response";

// Crear el servidor MCP
export const server = new Server(
    { name: "octaviolanne-hue-agent", version: "0.1.0" },
    { capabilities: { tools: {} } }
);

// Registrar la lista de herramientas
server.setRequestHandler(ListToolsRequestSchema, async (_req, extra) => {
    console.error(`[mcp] tools/list id=${extra.requestId}`);
    return { tools };
});
// Registrar la ejecución de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;

    console.error(`[mcp] tools/call id=${extra.requestId} name=${name}`);

    switch (name) {
        case "list_repositories":
            return await listRepositories(args);

        case "create_repository":
            return await createRepository(args);

        case "create_issue":
            return await createIssue(args);

        case "create_commit":
            return await createCommit(args);

        case "list_issues":
            return await listIssues(args);

        default:
            return fail("TOOL_NOT_FOUND", `Tool no encontrada: ${name}`);
    }
});