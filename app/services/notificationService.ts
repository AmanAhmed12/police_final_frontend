const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Notification {
    id: number;
    sender: {
        id: number;
        fullName: string;
        role: string;
    };
    receiver: {
        id: number;
        fullName: string;
        role: string;
    };
    message: string;
    createdAt: string;
    read: boolean;
}

const getAuthHeader = (token?: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});

export const sendNotification = async (receiverId: number, message: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
        method: "POST",
        headers: getAuthHeader(token),
        body: JSON.stringify({ receiverId, message }),
    });

    if (!response.ok) {
        throw new Error("Failed to send notification");
    }
    return await response.json();
};

export const getMyNotifications = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/my`, {
        headers: getAuthHeader(token),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }
    return await response.json();
};

export const getUnreadNotifications = async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
        headers: getAuthHeader(token),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch unread notifications");
    }
    return await response.json();
};

export const markAsRead = async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeader(token),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        throw new Error("Failed to mark as read");
    }
};

export const getChatHistory = async (otherUserId: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/chat/${otherUserId}`, {
        headers: getAuthHeader(token),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch chat history");
    }
    return await response.json();
};
