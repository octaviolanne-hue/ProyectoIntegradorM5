import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
    listRepositoriesSchema,
    createRepositorySchema,
    createIssueSchema,
    createCommitSchema,
    listIssuesSchema
} from "../schemas/github.schemas";

export const tools: Tool[] = [
    {
        name: "list_repositories",
        description: "Lista los repositorios del usuario autenticado en GitHub",
        // list_repositories
        inputSchema: z.toJSONSchema(listRepositoriesSchema, {
            target: "draft-7"
        }) as Tool["inputSchema"]
    },
    {
        name: "create_repository",
        description: "Crea un repositorio en GitHub",
        inputSchema: z.toJSONSchema(createRepositorySchema, {
            target: "draft-7"
        }) as Tool["inputSchema"]
    },
    {
        name: "create_issue",
        description: "Crea un issue en un repositorio de GitHub",
        // create_issue
        inputSchema: z.toJSONSchema(createIssueSchema, {
            target: "draft-7"
        }) as Tool["inputSchema"]
    },
    {
        name: "create_commit",
        description: "Crea o modifica un archivo en un repositorio de GitHub y registra los cambios mediante un commit. Utilizar cuando el usuario solicite agregar, guardar o actualizar archivos.",
        inputSchema: z.toJSONSchema(createCommitSchema, {
            target: "draft-7"
        }) as Tool["inputSchema"]
    },
    {
        name: "list_issues",
        description: "Lista los issues de un repositorio de GitHub. Permite filtrar por estado: open, closed o all.",
        inputSchema: z.toJSONSchema(listIssuesSchema, {
            target: "draft-7"
        }) as Tool["inputSchema"]
    }
];
