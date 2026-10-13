import { describe, it, expect, vi } from "vitest";
import { listIssues } from "../src/handlers/listIssues";
import { listRepositories } from "../src/handlers/listRepositories";

const { mockListForRepo, mockListRepositories } = vi.hoisted(() => ({
    mockListForRepo: vi.fn(),
    mockListRepositories: vi.fn()
}));

vi.mock("../src/config/github", () => ({
    octokit: {
        rest: {
            issues: {
                listForRepo: mockListForRepo
            },
            repos: {
                listForAuthenticatedUser: mockListRepositories
            }
        }
    }
}));

describe("listIssues", () => {

    it("debe devolver los issues obtenidos desde GitHub", async () => {

        // Simulamos la respuesta de GitHub
        mockListForRepo.mockResolvedValue({
            data: [
                {
                    number: 1,
                    title: "Issue de prueba",
                    state: "open",
                    user: { login: "octaviolanne-hue" },
                    body: "Descripción de prueba",
                    html_url: "https://github.com/test/repo/issues/1",
                    created_at: "2026-10-12T12:00:00Z"
                }
            ]
        });

        // Ejecutamos nuestro handler
        const result = await listIssues({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            state: "open"
        });

        // Comprobamos que Octokit fue llamado
        expect(mockListForRepo).toHaveBeenCalledWith({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            state: "open",
            per_page: 100
        });

        // Comprobamos la respuesta del handler
        const content = result.content[0];

        expect(content.type).toBe("text");

        if (content.type !== "text") {
            throw new Error("Se esperaba una respuesta de texto");
        }

        const response = JSON.parse(content.text);

        expect(response).toEqual({
            ok: true,
            data: [
                {
                    number: 1,
                    title: "Issue de prueba",
                    state: "open",
                    author: "octaviolanne-hue",
                    body: "Descripción de prueba",
                    html_url: "https://github.com/test/repo/issues/1",
                    created_at: "2026-10-12T12:00:00Z"
                }
            ]
        });
    });
    it("debe manejar un repositorio inexistente (404)", async () => {

        // Simulamos que GitHub responde con un error 404
        mockListForRepo.mockRejectedValue({
            status: 404,
            message: "Not Found"
        });

        // Ejecutamos el handler
        const result = await listIssues({
            owner: "octaviolanne-hue",
            repo: "repositorio-inexistente",
            state: "open"
        });

        // Convertimos la respuesta MCP a un objeto
        const content = result.content[0];

        expect(content.type).toBe("text");

        if (content.type !== "text") {
            throw new Error("Se esperaba una respuesta de texto");
        }

        const response = JSON.parse(content.text);

        // Comprobamos que el handler devuelve un error
        expect(response.ok).toBe(false);
        expect(response.error.code).toBe("GITHUB_API_ERROR");

    });
    it("debe manejar credenciales inválidas (401)", async () => {

        // Simulamos que GitHub rechaza la autenticación
        mockListForRepo.mockRejectedValue({
            status: 401,
            message: "Bad credentials"
        });

        const result = await listIssues({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            state: "open"
        });

        // Extraemos la respuesta MCP
        const content = result.content[0];

        expect(content.type).toBe("text");

        if (content.type !== "text") {
            throw new Error("Se esperaba una respuesta de texto");
        }

        const response = JSON.parse(content.text);

        expect(response.ok).toBe(false);
        expect(response.error.code).toBe("AUTHENTICATION_ERROR");
        expect(response.error.message).toBe(
            "Las credenciales de GitHub no son válidas. Verificá tu token de acceso."
        );
    });
});
describe("listRepositories", () => {

    it("debe manejar credenciales inválidas (401)", async () => {

        // Simulamos que GitHub rechaza el token
        mockListRepositories.mockRejectedValue({
            status: 401,
            message: "Bad credentials"
        });

        // Ejecutamos el handler
        const result = await listRepositories({});

        // Extraemos la respuesta MCP
        const content = result.content[0];

        expect(content.type).toBe("text");

        if (content.type !== "text") {
            throw new Error("Se esperaba una respuesta de texto");
        }

        const response = JSON.parse(content.text);

        // Verificamos que el error se tradujo correctamente
        expect(response.ok).toBe(false);
        expect(response.error.code).toBe("AUTHENTICATION_ERROR");
    });
    it("debe devolver los repositorios obtenidos desde GitHub", async () => {

        // Simulamos una respuesta exitosa de GitHub
        mockListRepositories.mockResolvedValue({
            data: [
                {
                    full_name: "octaviolanne-hue/ProyectoIntegradorM5",
                    html_url: "https://github.com/octaviolanne-hue/ProyectoIntegradorM5",
                    private: false,
                    description: "Proyecto integrador del módulo 5",
                    owner: {
                        login: "octaviolanne-hue"
                    }
                }
            ]
        });

        // Ejecutamos nuestro handler
        const result = await listRepositories({});

        // Extraemos la respuesta MCP
        const content = result.content[0];

        expect(content.type).toBe("text");

        if (content.type !== "text") {
            throw new Error("Se esperaba una respuesta de texto");
        }

        const response = JSON.parse(content.text);

        // Comprobamos que devuelve los datos esperados
        expect(response).toEqual({
            ok: true,
            data: [
                {
                    full_name: "octaviolanne-hue/ProyectoIntegradorM5",
                    html_url: "https://github.com/octaviolanne-hue/ProyectoIntegradorM5",
                    private: false,
                    description: "Proyecto integrador del módulo 5",
                    owner: {
                        login: "octaviolanne-hue"
                    }
                }
            ]
        });
    });
});