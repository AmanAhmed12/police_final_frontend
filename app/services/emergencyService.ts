const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// --- Types ---
export interface EmergencyContact {
    id: number;
    name: string;
    number: string;
    type: string;
    description?: string;
    priority?: number;
    adminId?: number;
}

// --- Professional API Helper ---
async function apiRequest<T>(
    endpoint: string,
    method: string,
    token?: string,
    body?: any
): Promise<T> {
    // 1. Silent Guard: If logging out, GET requests should just return empty data
    if (!token) {
        if (method === "GET") return [] as unknown as T; // Return empty array for contacts
        throw new Error("AUTH_REQUIRED"); // Keep error for POST/PUT/DELETE
    }

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
            throw new Error("SESSION_EXPIRED");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
    }

    if (response.status === 204) return {} as T;

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
}

// --- Exported Services ---

export const getEmergencyContacts = async (token?: string) =>
    apiRequest<EmergencyContact[]>("/api/emergency-contacts", "GET", token);

export const createEmergencyContact = async (data: Omit<EmergencyContact, 'id'>, token?: string) =>
    apiRequest<EmergencyContact>("/api/emergency-contacts", "POST", token, data);

export const updateEmergencyContact = async (id: number, data: Partial<EmergencyContact>, token?: string) =>
    apiRequest<EmergencyContact>(`/api/emergency-contacts/${id}`, "PUT", token, data);

export const deleteEmergencyContact = async (id: number, token?: string) =>
    apiRequest<void>(`/api/emergency-contacts/${id}`, "DELETE", token);