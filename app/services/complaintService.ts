const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Complaint {
    id: number;
    title: string;
    category: string;
    description: string;
    incidentDate: string;
    location: string;
    latitude?: number;
    longitude?: number;
    status: string;
    citizenId?: number;
    citizenName?: string;
    assignedOfficerId?: number;
    assignedOfficerName?: string;
    evidenceFiles?: string[];
    suspectIds?: number[];
    fir?: number;
    createdAt: string;
    updatedAt?: string;
    updatedById?: number;
    updatedByName?: string;
    remarks?: string;
}

const getAuthHeader = (token?: string) => ({
    Authorization: `Bearer ${token}`,
});

export const createComplaint = async (data: any, images: File[] = [], token?: string) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (Array.isArray(images)) {
        images.forEach((image) => {
            formData.append("images", image);
        });
    }

    const response = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to create complaint");
    }
    return await response.json();
};

export const getMyComplaints = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/my`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch my complaints");
    }
    return await response.json();
};

export const getMyAssignedComplaints = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/my-assigned`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch assigned complaints");
    }
    return await response.json();
};

export const updateComplaintStatus = async (id: number, status: string, token?: string, remarks?: string) => {
    let url = `${API_BASE_URL}/api/complaints/${id}/status?status=${status}`;
    if (remarks) {
        url += `&remarks=${encodeURIComponent(remarks)}`;
    }
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to update status");
    }
    return await response.json();
};

export const updateComplaintFir = async (id: number, fir: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/fir?fir=${fir}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to update FIR status");
    }
    return await response.json();
};

export const addSuspectsToComplaint = async (id: number, suspectIds: number[], token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/suspects`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(suspectIds)
    });

    if (!response.ok) {
        throw new Error("Failed to add suspects");
    }
    return await response.json();
};

export const getAllComplaints = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/all`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch all complaints");
    }
    return await response.json();
};

export const assignOfficerToComplaint = async (complaintId: number, officerId: number, token?: string) => {
   
    const response = await fetch(`${API_BASE_URL}/api/complaints/${complaintId}/assign?officerId=${officerId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error("Failed to assign officer");
    }
    return await response.json();
};

export const deleteComplaint = async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete complaint");
    }
};
