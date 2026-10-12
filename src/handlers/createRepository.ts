import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { octokit } from "../config/github";
import { createRepositorySchema } from "../schemas/github.schemas";
import { ok, fail } from "../utils/response";
import { getErrorStatus } from "../utils/githubError";
export async function createRepository(
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
                private: result.data.private
            });

        return ok({
            full_name: repo.full_name,
            html_url: repo.html_url,
            private: repo.private,
            description: repo.description
        });

    } catch (error: unknown) {
        const status = getErrorStatus(error);

        if (status === 422) {
            return fail(
                "REPOSITORY_ALREADY_EXISTS",
                "El nombre ya está en uso o GitHub rechazó los datos. Probá otro nombre."
            );
        }

        return fail(
            "GITHUB_API_ERROR",
            "No se pudo crear el repositorio."
        );
    }
}