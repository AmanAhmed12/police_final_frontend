const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Fine {
    id: number;
    violationType: string;
    vehicleNumber: string;
    amount: number;
    location: string;
    latitude?: number;
    longitude?: number;
    status: "PENDING" | "PAID";
    issuedAt: string;
    officer: {
        fullName: string;
        badgeNumber: string;
    };
    citizen: {
        fullName: string;
        nic: string;
    }
    paidAt?: string;
    paymentGatewayId?: string;
}

export const getAllFines = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/all`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch fines");
    }
    return await response.json();
};

export const updateFine = async (id: number, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/${id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Failed to update fine");
    }
    return await response.json();
};

export const deleteFine = async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error("Failed to delete record");
    }
    return response;
};

export const getMyFines = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/my-fines`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch my fines");
    }
    return await response.json();
};

export const getIssuedFines = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/issued-fines`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch issued fines");
    }
    return await response.json();
};

export const verifyFinePayment = async (fineId: number, paymentId: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/${fineId}/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId })
    });

    if (!response.ok) {
        throw new Error("Failed to verify fine payment");
    }
    return await response.json();
};

export const checkUserForFine = async (nic: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/check-user/${nic}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Citizen not found");
    }
    return await response.json();
};

export const issueFine = async (fineData: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/fines/issue`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fineData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to issue fine");
    }
    return await response.json();
};
