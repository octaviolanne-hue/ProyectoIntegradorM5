import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { octokit } from "../config/github";
import { listRepositoriesSchema } from "../schemas/github.schemas";
import type { RepoDTO } from "../types/github.types";
import { ok, fail } from "../utils/response";
import { getErrorStatus } from "../utils/githubError";

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
        const { data: repos } =
            await octokit.rest.repos.listForAuthenticatedUser(result.data);

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
        const status = getErrorStatus(error);

        if (status === 401) {
            return fail(
                "UNAUTHORIZED",
                "El token de GitHub es inválido o expiró"
            );
        }

        if (status === 403) {
            return fail(
                "FORBIDDEN",
                "No tenés permisos para consultar los repositorios"
            );
        }

        console.error("[mcp] Error consultando GitHub:", error);

        return fail(
            "GITHUB_API_ERROR",
            "No se pudieron obtener los repositorios"
        );
    }
}