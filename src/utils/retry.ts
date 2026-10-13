import { isRateLimitError } from "./githubError";

export function getRetryDelay(
    error: unknown,
    attempt: number
): number {
    const defaultDelay = 1000 * attempt;

    if (
        typeof error !== "object" ||
        error === null ||
        !("response" in error)
    ) {
        return defaultDelay;
    }

    const response = error.response;

    if (
        typeof response !== "object" ||
        response === null ||
        !("headers" in response)
    ) {
        return defaultDelay;
    }

    const headers = response.headers;

    if (
        typeof headers !== "object" ||
        headers === null
    ) {
        return defaultDelay;
    }

    // 1. Priorizar Retry-After
    if ("retry-after" in headers) {
        const seconds = Number(headers["retry-after"]);

        if (Number.isFinite(seconds) && seconds >= 0) {
            return seconds * 1000;
        }
    }

    // 2. Consultar cuándo se restablece el límite
    if ("x-ratelimit-reset" in headers) {
        const resetTimestamp = Number(
            headers["x-ratelimit-reset"]
        );

        if (Number.isFinite(resetTimestamp) && resetTimestamp > 0) {
            const resetTime = resetTimestamp * 1000;

            // Agregamos un segundo de margen
            const delay = resetTime - Date.now() + 1000;

            return Math.max(1000, delay);
        }
    }

    // 3. Usar espera predeterminada
    return defaultDelay;
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts = 3
): Promise<T> {

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();

        } catch (error: unknown) {

            // Si no es rate limit, no reintentamos
            if (!isRateLimitError(error)) {
                throw error;
            }

            // Si agotamos los intentos, devolvemos el error
            if (attempt === maxAttempts) {
                throw error;
            }

            // Esperamos progresivamente antes de reintentar
            const delay = getRetryDelay(error, attempt);
            console.error(
                `[mcp] Rate limit detectado. Reintento ${attempt}/${maxAttempts - 1}`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );
        }
    }

    throw new Error("No se pudo completar la operación");
}