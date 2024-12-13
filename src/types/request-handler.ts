export interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    path?: string;
    body?: Record<string, string>;
    headers?: Record<string, string>;
}
