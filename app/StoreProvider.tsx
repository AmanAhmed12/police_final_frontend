// 'use client';

// import { useRef } from 'react';
// import { Provider } from 'react-redux';
// import { makeStore, AppStore } from '../lib/store';

// export default function StoreProvider({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const storeRef = useRef<AppStore>(null);
//     if (!storeRef.current) {
//         // Create the store instance the first time this renders
//         storeRef.current = makeStore();
//     }

//     return <Provider store={storeRef.current}>{children}</Provider>;
// }

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
