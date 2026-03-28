const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const loginUser = async (credentials: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "*/*"
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(errorDetails || "Login failed");
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};


export const registerUser = async (userData: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Registration failed");
        }
        return true; // Or return response data if needed
    } catch (error) {
        throw error;
    }
};
const getAuthHeader = (token?: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});

// Fetch users
export const getUsers = async (token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: getAuthHeader(token),
        });
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

// Update user
export const updateUser = async (id: number, userData: any, token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: "PUT",
            headers: getAuthHeader(token),
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Update failed");
        }

        return true;
    } catch (error) {
        throw error;
    }
};

// Delete user
export const deleteUser = async (id: number, token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete user");
        }
        return true;
    } catch (error) {
        throw error;
    }
};
export const logoutUser = async (token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        let data: any = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            try {
                data = await response.json();
            } catch (e) {
                console.warn("Failed to parse JSON response during logout");
            }
        } else {
            const text = await response.text();
            if (text) data = { message: text };
        }

        if (!response.ok) {
            console.warn("Logout failed:", data);
        }
        // Clear local storage regardless of backend response
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return data;
    } catch (error) {
        console.error("Logout error:", error);
        // Even if backend logout fails, clear frontend state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
    }
};

// Update user profile (supports profile picture upload)
export const updateProfile = async (formData: FormData, token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                // Don't set Content-Type for FormData - browser will set it with boundary
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Profile update failed");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Get user profile
export const getProfile = async (token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to fetch profile");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Change password
export const changePassword = async (passwordData: { currentPassword: string; newPassword: string }, token?: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
            method: "POST",
            headers: getAuthHeader(token),
            body: JSON.stringify(passwordData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Password change failed");
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        throw error;
    }
};
