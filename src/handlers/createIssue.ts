import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { octokit } from "../config/github";
import { createIssueSchema } from "../schemas/github.schemas";
import { ok, fail } from "../utils/response";
import { getErrorStatus } from "../utils/githubError";

export async function createIssue(
    args: unknown
): Promise<CallToolResult> {

    console.error("[mcp] create_issue - Request recibida");
    const result = createIssueSchema.safeParse(args ?? {});

    if (!result.success) {
        return fail("VALIDATION_ERROR", "Parámetros inválidos");
    }

    try {
        const { owner, repo, title, body } = result.data;

        // Preflight: comprobar que el repositorio existe
        await octokit.rest.repos.get({ owner, repo });

        // Crear el issue
        const { data: issue } = await octokit.rest.issues.create({
            owner,
            repo,
            title,
            body
        });

        return ok({
            number: issue.number,
            title: issue.title,
            html_url: issue.html_url,
            state: issue.state
        });

    } catch (error: unknown) {
        const status = getErrorStatus(error);

        if (status === 404) {
            return fail(
                "REPOSITORY_NOT_FOUND",
                "Repositorio no encontrado o sin permisos de acceso"
            );
        }

        if (status === 401) {
            return fail(
                "UNAUTHORIZED",
                "Token inválido o expirado"
            );
        }

        if (status === 403) {
            return fail(
                "FORBIDDEN",
                "No tenés permisos suficientes para realizar esta operación"
            );
        }

        console.error("[mcp] Error creando issue:", error);

        return fail(
            "GITHUB_API_ERROR",
            "No se pudo crear el issue"
        );
    }
}