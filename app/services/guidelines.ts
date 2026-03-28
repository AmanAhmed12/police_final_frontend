const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Guideline {
    id: number;
    category: string;
    title: string;
    content: string;
    priority: 'High' | 'Medium' | 'Low';
    createdByName: string; // From our DTO
    createdAt: string;
}

export type GuidelineInput = Omit<Guideline, 'id' | 'createdByName' | 'createdAt'>;

async function apiRequest<T>(endpoint: string, method: string, token?: string, body?: any): Promise<T> {
    if (!token) {
        if (method === "GET") return [] as unknown as T;
        throw new Error("AUTH_REQUIRED");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 401) throw new Error("SESSION_EXPIRED");
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.status === 204 ? ({} as T) : response.json();
}

export const getGuidelines = (token?: string) =>
    apiRequest<Guideline[]>("/api/guidelines", "GET", token);

export const createGuideline = (data: GuidelineInput, token?: string) =>
    apiRequest<Guideline>("/api/guidelines", "POST", token, data);

export const updateGuideline = (id: number, data: Partial<GuidelineInput>, token?: string) =>
    apiRequest<Guideline>(`/api/guidelines/${id}`, "PUT", token, data);

export const deleteGuideline = (id: number, token?: string) =>
    apiRequest<void>(`/api/guidelines/${id}`, "DELETE", token);