import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { octokit } from "../config/github";
import { createIssueSchema } from "../schemas/github.schemas";
import { ok, fail } from "../utils/response";
import {
    getErrorStatus,
    translateGitHubError
} from "../utils/githubError";
import { withRetry } from "../utils/retry";

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
        await withRetry(() =>
            octokit.rest.repos.get({ owner, repo })
        );
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

        // Mantener un error específico para repositorios inexistentes
        if (status === 404) {
            return fail(
                "REPOSITORY_NOT_FOUND",
                "Repositorio no encontrado o sin permisos de acceso"
            );
        }

        // Traducir los demás errores de GitHub
        const translatedError = translateGitHubError(error);

        console.error(
            "[mcp] create_issue - Error:",
            translatedError.code
        );

        return fail(
            translatedError.code,
            translatedError.message
        );
    }
}