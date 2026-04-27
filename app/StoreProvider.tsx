'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '../lib/store';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </PersistGate>
        </Provider>
    );
}
