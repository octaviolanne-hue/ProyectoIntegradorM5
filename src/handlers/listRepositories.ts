import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { octokit } from "../config/github";
import { listRepositoriesSchema } from "../schemas/github.schemas";
import type { RepoDTO } from "../types/github.types";
import { ok, fail } from "../utils/response";
import { translateGitHubError } from "../utils/githubError";
import { withRetry } from "../utils/retry";

export async function listRepositories(
    args: unknown
): Promise<CallToolResult> {

    console.error("[mcp] list_repositories - Request recibida:", args);

    const result = listRepositoriesSchema.safeParse(args ?? {});

    if (!result.success) {
        return fail(
            "VALIDATION_ERROR",
            "Los parámetros enviados no son válidos"
        );
    }

    try {
        const { data: repos } = await withRetry(() =>
            octokit.rest.repos.listForAuthenticatedUser(result.data)
        );

        const reposDTO: RepoDTO[] = repos.map(repo => ({
            full_name: repo.full_name,
            html_url: repo.html_url,
            private: repo.private,
            description: repo.description,
            owner: {
                login: repo.owner.login
            }
        }));

        return ok(reposDTO);

    } catch (error: unknown) {
        const translatedError = translateGitHubError(error);

        console.error(
            "[mcp] list_repositories - Error:",
            translatedError.code
        );

        return fail(
            translatedError.code,
            translatedError.message
        );
    }
}