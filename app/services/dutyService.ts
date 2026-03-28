export interface Duty {
    id: number;
    title: string;
    description: string;
    officerId: number;
    officerName?: string;
    officerNic?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate: string;
    createdAt?: string;
    statusUpdatedAt?: string;
}

const API_URL = 'http://localhost:8080/api/duties';

export const dutyService = {
    getAllDuties: async (token: string): Promise<Duty[]> => {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch duties');
        return response.json();
    },

    getDutiesByOfficer: async (officerId: number, token: string): Promise<Duty[]> => {
        const response = await fetch(`${API_URL}/officer/${officerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch officer duties');
        return response.json();
    },

    createDuty: async (duty: Partial<Duty>, token: string): Promise<Duty> => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(duty)
        });
        if (!response.ok) throw new Error('Failed to create duty');
        return response.json();
    },

    updateDuty: async (id: number, duty: Partial<Duty>, token: string): Promise<Duty> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(duty)
        });
        if (!response.ok) throw new Error('Failed to update duty');
        return response.json();
    },

    deleteDuty: async (id: number, token: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete duty');
    },

    updateDutyStatus: async (id: number, status: string, token: string): Promise<Duty> => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update duty status');
        return response.json();
    }
};
