/** @module RESTManager */
import { RequestOptions } from "../types/request-handler";

export class RestManager {
    private readonly baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async sendRequest<T>(options: RequestOptions): Promise<{cookies: string[], data: T}> {
        const { method, path, body, headers } = options;
        const url = `${this.baseURL}/${path}`;

        const response = await fetch(url, {
            method,
            body: body ? new URLSearchParams(body).toString() : undefined,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                ...headers,
                "User-Agent": "@raphckrman/alise-api"
            },
            redirect: "manual"
        });

        const responseData = await response.text();
        return {cookies: response.headers.get("Set-Cookie")?.split(";") ?? [], data: responseData as T};
    }

    async get<T>(
        path: string,
        headers?: Record<string, string>
    ): Promise<{cookies: string[], data: T}> {
        return this.sendRequest<T>({
            method: "GET",
            path: path,
            headers: headers
        });
    }

    async post<T>(
        path: string,
        body: any,
        options?: RequestOptions
    ): Promise<{cookies: string[], data: T}> {
        return this.sendRequest<T>({
            method: "POST",
            path,
            body,
            headers: options?.headers
        });
    }

    async put<T>(
        path: string,
        body: any,
        options?: RequestOptions
    ): Promise<{cookies: string[], data: T}> {
        return this.sendRequest<T>({
            method: "PUT",
            path,
            body,
            headers: options?.headers
        });
    }

    async delete<T>(
        path: string,
        params?: Record<string, any>,
        options?: RequestOptions
    ): Promise<{cookies: string[], data: T}> {
        const urlParams = new URLSearchParams(params).toString();
        const urlPath = urlParams ? `${path}?${urlParams}` : path;
        return this.sendRequest<T>({
            method: "DELETE",
            path: urlPath,
            headers: options?.headers
        });
    }
}
