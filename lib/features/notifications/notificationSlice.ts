import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.read).length;
            state.loading = false;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            // Check if notification already exists
            if (!state.notifications.find(n => n.id === action.payload.id)) {
                state.notifications = [action.payload, ...state.notifications];
                if (!action.payload.read) {
                    state.unreadCount += 1;
                }
            }
        },
        updateNotificationReadStatus: (state, action: PayloadAction<{ id: number; read: boolean }>) => {
            const notif = state.notifications.find(n => n.id === action.payload.id);
            if (notif && notif.read !== action.payload.read) {
                if (action.payload.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                } else {
                    state.unreadCount += 1;
                }
                notif.read = action.payload.read;
            }
        },
        markAllAsReadSuccess: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
            state.unreadCount = 0;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    updateNotificationReadStatus,
    markAllAsReadSuccess,
    setLoading,
    setError
} = notificationSlice.actions;

export default notificationSlice.reducer;
