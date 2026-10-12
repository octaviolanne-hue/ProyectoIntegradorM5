import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { octokit } from "../config/github";
import { createCommitSchema } from "../schemas/github.schemas";
import { ok, fail } from "../utils/response";
import { getErrorStatus } from "../utils/githubError";

export async function createCommit(
    args: unknown
): Promise<CallToolResult> {

    console.error("[mcp] create_commit - Request recibida");

    const result = createCommitSchema.safeParse(args ?? {});

    if (!result.success) {
        return fail(
            "VALIDATION_ERROR",
            "Los parámetros enviados no son válidos"
        );
    }

    try {
        const { owner, repo, path, content, message } = result.data;

        // Obtener información del repositorio
        const { data: repository } = await octokit.rest.repos.get({
            owner,
            repo
        });

        // Identificar la rama predeterminada
        const branch = repository.default_branch;

        console.error("[mcp] create_commit - Rama:", branch);

        // Obtener la referencia de la rama
        const { data: reference } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${branch}`
        });

        // SHA del último commit de la rama
        const latestCommitSha = reference.object.sha;

        console.error("[mcp] create_commit - Referencia obtenida");

        // Obtener los datos del último commit
        const { data: currentCommit } = await octokit.rest.git.getCommit({
            owner,
            repo,
            commit_sha: latestCommitSha
        });

        // SHA del árbol de archivos actual
        const baseTreeSha = currentCommit.tree.sha;

        console.error("[mcp] create_commit - Commit actual obtenido");

        // Crear un blob con el contenido del archivo
        const { data: blob } = await octokit.rest.git.createBlob({
            owner,
            repo,
            content,
            encoding: "utf-8"
        });

        // Obtener el SHA del blob creado
        const blobSha = blob.sha;

        console.error("[mcp] create_commit - Blob creado");

        // Crear un nuevo tree a partir del árbol actual
        const { data: newTree } = await octokit.rest.git.createTree({
            owner,
            repo,
            base_tree: baseTreeSha,
            tree: [
                {
                    path,
                    mode: "100644",
                    type: "blob",
                    sha: blobSha
                }
            ]
        });

        // SHA del nuevo árbol
        const newTreeSha = newTree.sha;

        console.error("[mcp] create_commit - Tree creado");

        // Crear el commit con el nuevo árbol
        const { data: newCommit } = await octokit.rest.git.createCommit({
            owner,
            repo,
            message,
            tree: newTreeSha,
            parents: [latestCommitSha]
        });

        // Obtener el SHA del nuevo commit
        const newCommitSha = newCommit.sha;

        console.error("[mcp] create_commit - Commit creado");

        // Actualizar la rama para que apunte al nuevo commit
        await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${branch}`,
            sha: newCommitSha,
            force: false
        });

        console.error("[mcp] create_commit - Rama actualizada");

        return ok({
            owner,
            repo,
            branch,
            path,
            commit_sha: newCommitSha,
            message,
            html_url: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`
        });

    } catch (error: unknown) {
        console.error("[mcp] Error creando commit:", error);

        return fail(
            "GITHUB_API_ERROR",
            "No se pudo crear el commit"
        );
    }
}