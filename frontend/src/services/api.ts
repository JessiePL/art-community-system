const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5107").replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

const buildErrorMessage = (status: number, statusText: string, data: unknown, fallbackText: string | null) => {
  if (typeof (data as { message?: unknown } | null)?.message === "string") {
    return (data as { message: string }).message;
  }

  if (typeof fallbackText === "string" && fallbackText.trim()) {
    return fallbackText.trim();
  }

  return `Request failed (${status} ${statusText}).`;
};

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the API.";
    throw new Error(`Network error: ${message}`);
  }

  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(buildErrorMessage(response.status, response.statusText, data, rawText || null));
  }

  return data as TResponse;
}


export async function apiFormRequest<TResponse>(path: string, formData: FormData, token?: string | null): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the API.";
    throw new Error(`Network error: ${message}`);
  }

  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(buildErrorMessage(response.status, response.statusText, data, rawText || null));
  }

  return data as TResponse;
}
