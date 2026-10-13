import { listIssuesSchema } from "../schemas/github.schemas";
import { octokit } from "../config/github";
import { ok, fail } from "../utils/response";
import { translateGitHubError } from "../utils/githubError";
import { withRetry } from "../utils/retry";

export async function listIssues(args: unknown) {

    // Validar los argumentos recibidos
    const result = listIssuesSchema.safeParse(args ?? {});

    if (!result.success) {
        return fail(
            "VALIDATION_ERROR",
            "Los argumentos enviados no son válidos"
        );
    }
    // Los argumentos son válidos
    const { owner, repo, state } = result.data;

    try {
        // Consultar los issues del repositorio
        const { data: issues } = await withRetry(() =>
            octokit.rest.issues.listForRepo({
                owner,
                repo,
                state,
                per_page: 100
            })
        );
        // Excluir pull requests y devolver solo información útil
        const filteredIssues = issues
            .filter(issue => !issue.pull_request)
            .map(issue => ({
                number: issue.number,
                title: issue.title,
                state: issue.state,
                author: issue.user?.login ?? null,
                body: issue.body,
                html_url: issue.html_url,
                created_at: issue.created_at
            }));

        console.error("[mcp] list_issues - Issues obtenidos");

        return ok(filteredIssues);

    } catch (error) {
        const translatedError = translateGitHubError(error);

        console.error(
            "[mcp] list_issues - Error:",
            translatedError.code
        );

        return fail(
            translatedError.code,
            translatedError.message
        );
    }

}