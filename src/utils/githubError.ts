export function getErrorStatus(error: unknown): number | undefined {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
    ) {
        return error.status;
    }

    return undefined;
}

export function translateGitHubError(error: unknown) {
    const status = getErrorStatus(error);

    switch (status) {
        case 401:
            return {
                code: "AUTHENTICATION_ERROR",
                message: "Las credenciales de GitHub no son válidas. Verificá tu token de acceso."
            };

        case 403:
            return {
                code: "GITHUB_API_ERROR",
                message: "GitHub rechazó la operación por falta de permisos o por un límite de uso."
            };

        case 404:
            return {
                code: "GITHUB_API_ERROR",
                message: "No se encontró el recurso solicitado en GitHub o no tenés acceso."
            };

        default:
            return {
                code: "GITHUB_API_ERROR",
                message: "Ocurrió un error al comunicarse con GitHub."
            };
    }
}
export function isRateLimitError(error: unknown): boolean {
    const status = getErrorStatus(error);

    // GitHub puede devolver 403 o 429
    if (status !== 403 && status !== 429) {
        return false;
    }

    // Verificamos que el error tenga un mensaje
    if (
        typeof error !== "object" ||
        error === null ||
        !("message" in error) ||
        typeof error.message !== "string"
    ) {
        return status === 429;
    }
    // Detectar si GitHub agotó el límite principal
    if (
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "headers" in error.response
    ) {
        const headers = error.response.headers;

        if (
            typeof headers === "object" &&
            headers !== null &&
            "x-ratelimit-remaining" in headers &&
            String(headers["x-ratelimit-remaining"]) === "0"
        ) {
            return true;
        }
    }
    const message = error.message.toLowerCase();

    return (
        status === 429 ||
        message.includes("rate limit") ||
        message.includes("secondary rate limit")
    );
}