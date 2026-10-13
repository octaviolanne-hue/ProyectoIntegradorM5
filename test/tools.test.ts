import { describe, it, expect } from "vitest";
import {
    createCommitSchema,
    listIssuesSchema,
    createRepositorySchema
} from "../src/schemas/github.schemas";

describe("createCommitSchema", () => {

    it("debe aceptar argumentos válidos", () => {

        const result = createCommitSchema.safeParse({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            path: "README.md",
            content: "Hola desde Vitest",
            message: "Agregar README"
        });

        expect(result.success).toBe(true);

    });

    it("debe rechazar una ruta de archivo inválida", () => {

        const result = createCommitSchema.safeParse({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            path: "../archivo.txt",
            content: "Contenido de prueba",
            message: "Agregar archivo"
        });

        expect(result.success).toBe(false);

    });
    it("debe rechazar un mensaje de commit vacío", () => {

        const result = createCommitSchema.safeParse({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            path: "README.md",
            content: "Contenido de prueba",
            message: ""
        });

        expect(result.success).toBe(false);

    });
});
describe("listIssuesSchema", () => {

    it("debe utilizar open como estado predeterminado", () => {

        const result = listIssuesSchema.safeParse({
            owner: "octaviolanne-hue",
            repo: "Prueba"
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.state).toBe("open");
        }

    });
    it("debe rechazar un estado de issue inválido", () => {

        const result = listIssuesSchema.safeParse({
            owner: "octaviolanne-hue",
            repo: "Prueba",
            state: "pending"
        });

        expect(result.success).toBe(false);

    });
});
describe("createRepositorySchema", () => {

    it("debe rechazar nombres de repositorios menores a 3 caracteres", () => {

        const result = createRepositorySchema.safeParse({
            name: "ab"
        });

        expect(result.success).toBe(false);

    });
    it("debe rechazar nombres de repositorios con caracteres especiales", () => {

        const result = createRepositorySchema.safeParse({
            name: "mi repo!"
        });

        expect(result.success).toBe(false);

    });
    it("debe aceptar un nombre de repositorio válido", () => {

        const result = createRepositorySchema.safeParse({
            name: "ProyectoIntegradorM5"
        });

        expect(result.success).toBe(true);

    });
});