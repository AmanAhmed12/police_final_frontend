const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface ReportRequest {
    id: string;
    fullName: string;
    nic: string;
    homeAddress: string;
    fatherName: string;
    motherName: string;
    siblings: number;
    purpose: string;
    status: string;
    pdfUrl?: string; // Cloudinary PDF link
    createdAt: string;
}

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

    if (!response.ok) throw new Error(`Error ${response.status}`);

    if (response.status === 204) return {} as T;
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
}

// REAL API EXPORTS (Professional Format)

// --- Citizen Endpoints ---
export const getReportRequests = (token?: string) => apiRequest<ReportRequest[]>("/api/reports/citizen/my", "GET", token);
export const createReportRequest = (data: Partial<ReportRequest>, token?: string) => apiRequest<ReportRequest>("/api/reports/citizen/apply", "POST", token, data);
export const deleteReportRequest = (id: string, token?: string) => apiRequest<void>(`/api/reports/citizen/${id}`, "DELETE", token);

// --- Officer Endpoints ---
export const getAllReportRequests = (token?: string) => apiRequest<ReportRequest[]>("/api/reports/officer/all", "GET", token);

export const updateReportStatus = (id: string, status: string, token?: string) => {
    return apiRequest<ReportRequest>(`/api/reports/officer/${id}/status?status=${status}`, "PATCH", token);
};

/**
 * Professional Report Finalization
 * This sends the PDF file to the backend in a single request.
 * The backend handles:
 * 1. Uploading the file to Cloudinary.
 * 2. Updating the report status to "Processed".
 * 3. Saving the Cloudinary URL to the database.
 */
export const finalizeReportRequest = async (reportId: string, file: File, token?: string): Promise<ReportRequest> => {
    if (!token) throw new Error("AUTH_REQUIRED");

    // Professional Multipart Upload
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/reports/officer/${reportId}/finalize`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`
            // Note: browser sets boundary automatically for FormData
        },
        body: formData
    });

    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
    return response.json();
};

/**
 * Remove PDF from a processed report
 * This reverts the report status to "In Progress" and removes the PDF URL
 */
export const removePdfFromReport = async (reportId: string, token?: string): Promise<ReportRequest> => {
    return apiRequest<ReportRequest>(`/api/reports/officer/${reportId}/pdf`, "DELETE", token);
};
