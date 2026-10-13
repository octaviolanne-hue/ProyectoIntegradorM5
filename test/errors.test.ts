import { describe, it, expect } from "vitest";
import {
    translateGitHubError,
    isRateLimitError
} from "../src/utils/githubError";

describe("translateGitHubError", () => {

    it("debe transformar un error 401 en un error de autenticación", () => {

        // Simulamos un error de GitHub
        const error = {
            status: 401,
            message: "Bad credentials"
        };

        // Traducimos el error
        const result = translateGitHubError(error);

        // Comprobamos el código de error
        expect(result.code).toBe("AUTHENTICATION_ERROR");

        // Comprobamos el mensaje en lenguaje natural
        expect(result.message).toBe(
            "Las credenciales de GitHub no son válidas. Verificá tu token de acceso."
        );

    });
    it("debe transformar un error 404 en un mensaje comprensible", () => {

        const error = {
            status: 404,
            message: "Not Found"
        };

        const result = translateGitHubError(error);

        expect(result.code).toBe("GITHUB_API_ERROR");

        expect(result.message).toBe(
            "No se encontró el recurso solicitado en GitHub o no tenés acceso."
        );

    });
    it("debe transformar un error 403 en un mensaje comprensible", () => {

        const error = {
            status: 403,
            message: "Forbidden"
        };

        const result = translateGitHubError(error);

        expect(result.code).toBe("GITHUB_API_ERROR");

        expect(result.message).toBe(
            "GitHub rechazó la operación por falta de permisos o por un límite de uso."
        );

    });
});
describe("isRateLimitError", () => {

    it("debe detectar un rate limit con error 403", () => {
        const error = {
            status: 403,
            message: "API rate limit exceeded"
        };

        expect(isRateLimitError(error)).toBe(true);
    });

    it("debe detectar un rate limit con error 429", () => {
        const error = {
            status: 429,
            message: "Too Many Requests"
        };

        expect(isRateLimitError(error)).toBe(true);
    });

    it("no debe confundir falta de permisos con rate limit", () => {
        const error = {
            status: 403,
            message: "Resource not accessible by integration"
        };

        expect(isRateLimitError(error)).toBe(false);
    });
    it("debe detectar rate limit cuando GitHub informa que quedan 0 solicitudes", () => {

        const error = {
            status: 403,
            message: "Forbidden",
            response: {
                headers: {
                    "x-ratelimit-remaining": "0"
                }
            }
        };

        expect(isRateLimitError(error)).toBe(true);
    });
});