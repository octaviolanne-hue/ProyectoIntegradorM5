import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { octokit } from "../config/github";
import { createRepositorySchema } from "../schemas/github.schemas";
import { ok, fail } from "../utils/response";
import {
    getErrorStatus,
    translateGitHubError
} from "../utils/githubError"; export async function createRepository(
    args: unknown
): Promise<CallToolResult> {

    const result = createRepositorySchema.safeParse(args ?? {});

    if (!result.success) {
        return fail("VALIDATION_ERROR", "Parámetros inválidos");
    }

    try {
        const { data: repo } =
            await octokit.rest.repos.createForAuthenticatedUser({
                name: result.data.name,
                description: result.data.description,
                private: result.data.private,
                auto_init: true
            });

        return ok({
            full_name: repo.full_name,
            html_url: repo.html_url,
            private: repo.private,
            description: repo.description
        });

    } catch (error: unknown) {
        const status = getErrorStatus(error);

        // Error de validación de GitHub
        if (status === 422) {
            return fail(
                "REPOSITORY_ALREADY_EXISTS",
                "El nombre ya está en uso o GitHub rechazó los datos. Probá otro nombre."
            );
        }

        // Traducir los demás errores de GitHub
        const translatedError = translateGitHubError(error);

        console.error(
            "[mcp] create_repository - Error:",
            translatedError.code
        );

        return fail(
            translatedError.code,
            translatedError.message
        );
    }
}