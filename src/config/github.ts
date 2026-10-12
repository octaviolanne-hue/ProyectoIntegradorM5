import path from "node:path";
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN no está configurado");
}

export const octokit = new Octokit({
    auth: token
});