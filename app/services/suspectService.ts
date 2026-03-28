const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Suspect {
    id: number;
    name: string;
    nic: string;
    age: number | "";
    gender: string;
    lastSeenLocation: string;
    latitude?: number;
    longitude?: number;
    description: string;
    signs: string[];
    image: string;
    crime: string;
    adminId?: number;
}

export interface SuspectMatchRequest {
    gender: string;
    age: number;
    lastSeenLocation: string;
    latitude?: number;
    longitude?: number;
    description: string;
    signs: string[];
    crime: string;
}

export interface SuspectMatchResponse extends Suspect {
    matchPercentage: number;
}

export const suspectService = {
    getAllSuspects: async (token?: string): Promise<Suspect[]> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch suspects");
        return await response.json();
    },

    getSuspectById: async (id: number, token?: string): Promise<Suspect> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch suspect details");
        return await response.json();
    },

    createSuspect: async (data: any, token?: string): Promise<Suspect> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create suspect");
        return await response.json();
    },

    updateSuspect: async (id: number, data: any, token?: string): Promise<Suspect> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update suspect");
        return await response.json();
    },

    deleteSuspect: async (id: number, token?: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to delete suspect");
    },

    matchSuspects: async (data: SuspectMatchRequest, token?: string): Promise<SuspectMatchResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/api/suspects/match`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to match suspects");
        return await response.json();
    }
};

// Fallback exports for backward compatibility if needed by other components
export const matchSuspects = suspectService.matchSuspects;