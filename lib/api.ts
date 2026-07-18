export interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export class APIClient {
  private baseUrl: string;
  private static requestCount: number = 0;
  private static resetTime: number = 0;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: FetchOptions = {}): Promise<T> {
    // Simple client-side rate limiting / request flood prevention
    const now = Date.now();
    if (now > APIClient.resetTime) {
      APIClient.requestCount = 0;
      APIClient.resetTime = now + 60000;
    }
    APIClient.requestCount++;
    if (APIClient.requestCount > 150) {
      throw new Error("API Error [429]: Too many requests. Client rate limit exceeded.");
    }

    const { params, headers, ...rest } = options;
    
    // Construct query parameters
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // Default headers
    const reqHeaders = new Headers(headers);
    if (!reqHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
      reqHeaders.set("Content-Type", "application/json");
    }

    // Add authorization header if session exists
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("stadium_session");
      if (session) {
        try {
          const user = JSON.parse(session);
          if (user.id) {
            reqHeaders.set("Authorization", `Bearer ${user.id}`);
          }
        } catch {
          // Ignore invalid session
        }
      }
    }

    const response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
    }

    // Return empty object on 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  public get<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  public put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public delete<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new APIClient("/api");
