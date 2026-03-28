// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './features/auth/authSlice';

// export const makeStore = () => {
//     return configureStore({
//         reducer: {
//             auth: authReducer,
//         },
//     });
// };

// // Infer the type of makeStore
// export type AppStore = ReturnType<typeof makeStore>;
// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import notificationReducer from './features/notifications/notificationSlice';

import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    notifications: notificationReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
