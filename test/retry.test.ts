import { describe, it, expect, vi } from "vitest";
import { withRetry, getRetryDelay } from "../src/utils/retry";

describe("withRetry", () => {

    it("debe ejecutar correctamente una operación exitosa", async () => {

        const operation = vi.fn().mockResolvedValue("OK");

        const result = await withRetry(operation);

        expect(result).toBe("OK");
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it("no debe reintentar cuando el error es de permisos", async () => {

        const operation = vi.fn().mockRejectedValue({
            status: 403,
            message: "Resource not accessible by integration"
        });

        await expect(withRetry(operation)).rejects.toMatchObject({
            status: 403
        });

        expect(operation).toHaveBeenCalledTimes(1);
    });

    it("debe reintentar cuando GitHub devuelve rate limit", async () => {

        const operation = vi.fn()
            .mockRejectedValueOnce({
                status: 429,
                message: "Too Many Requests"
            })
            .mockResolvedValueOnce("OK");

        const result = await withRetry(operation);

        expect(result).toBe("OK");
        expect(operation).toHaveBeenCalledTimes(2);
    });
    it("debe detenerse después de 3 intentos fallidos", async () => {

        // Simulamos que GitHub siempre devuelve rate limit
        const operation = vi.fn().mockRejectedValue({
            status: 429,
            message: "Too Many Requests"
        });

        // Comprobamos que finalmente devuelve el error
        await expect(
            withRetry(operation, 3)
        ).rejects.toMatchObject({
            status: 429
        });

        // Verificamos que no haya más de 3 intentos
        expect(operation).toHaveBeenCalledTimes(3);
    });
});
describe("getRetryDelay", () => {

    it("debe respetar el tiempo indicado por GitHub", () => {

        // Simulamos una respuesta HTTP de GitHub
        const error = {
            status: 429,
            message: "Too Many Requests",
            response: {
                headers: {
                    "retry-after": "5"
                }
            }
        };

        // Calculamos el tiempo de espera
        const delay = getRetryDelay(error, 1);

        // 5 segundos equivalen a 5000 milisegundos
        expect(delay).toBe(5000);
    });
    it("debe calcular la espera usando x-ratelimit-reset", () => {

        // Simulamos que el límite se restablece en 30 segundos
        const resetTimestamp = Math.floor(Date.now() / 1000) + 30;

        const error = {
            status: 403,
            message: "API rate limit exceeded",
            response: {
                headers: {
                    "x-ratelimit-reset": String(resetTimestamp)
                }
            }
        };

        const delay = getRetryDelay(error, 1);

        // Debe esperar aproximadamente 30 segundos
        // más el segundo adicional de seguridad
        expect(delay).toBeGreaterThanOrEqual(30000);
        expect(delay).toBeLessThanOrEqual(31000);
    });

});