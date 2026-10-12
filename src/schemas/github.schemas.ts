import { z } from "zod";

export const listRepositoriesSchema = z.object({
    type: z.enum(["all", "public", "private"]).default("all"),
    sort: z.enum(["created", "updated", "pushed", "full_name"]).default("updated"),
    per_page: z.number().int().min(1).max(100).default(30),
});

export const createRepositorySchema = z.object({
    name: z.string()
        .min(3)
        .max(100)
        .regex(/^[a-zA-Z0-9_.-]+$/),
    description: z.string().optional(),
    private: z.boolean().default(false)
});

export const createIssueSchema = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    title: z.string().min(3),
    body: z.string().optional()
});

export const createCommitSchema = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),

    path: z.string()
        .min(1, "La ruta del archivo es obligatoria")
        .refine(
            (path) =>
                !path.startsWith("/") &&
                !path.endsWith("/") &&
                !path.includes("\\") &&
                path.split("/").every(
                    (segment) =>
                        segment !== "" &&
                        segment !== "." &&
                        segment !== ".."
                ),
            "La ruta del archivo no es válida"
        ),

    content: z.string(),
    message: z.string()
        .min(1, "El mensaje del commit es obligatorio")
});

export const listIssuesSchema = z.object({
    owner: z.string().min(1, "El propietario es obligatorio"),
    repo: z.string().min(1, "El repositorio es obligatorio"),
    state: z.enum(["open", "closed", "all"]).default("open")
});