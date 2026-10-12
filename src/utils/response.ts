import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function ok<T>(data: T): CallToolResult {
    return {
        content: [{
            type: "text",
            text: JSON.stringify({
                ok: true,
                data
            })
        }]
    };
}

export function fail(code: string, message: string): CallToolResult {
    return {
        isError: true,
        content: [{
            type: "text",
            text: JSON.stringify({
                ok: false,
                error: {
                    code,
                    message
                }
            })
        }]
    };
}