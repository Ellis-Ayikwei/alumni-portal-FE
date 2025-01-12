import { combineReducers, configureStore, Store } from '@reduxjs/toolkit';
import insurancePackagesSlice from './insurancePackageSlice';
import themeConfigSlice from './themeConfigSlice';
import usersSlice from './usersSlice';

import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import alumniGroupSlice from './alumnigroupSlice';
import amendmentsSlice from './amendmentsSlice';
import contractsSlice from './contractsSlice';

import authSlice from './authSlice';
import paymentsSlice from './paymentsSlice';
import invoicesSlice from './invoicesSlice';


const authPersistConfig = {
    key: 'auth',
    storage,
};


// const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authSlice,
    usersdata: usersSlice,
    alumnidata: alumniGroupSlice,
    invoices: invoicesSlice,
    insurancePackages: insurancePackagesSlice,
    allContacts: contractsSlice,
    amendments: amendmentsSlice,
    payments: paymentsSlice,
});


const confStore: Store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export default confStore;

const persistor = persistStore(confStore);

export { persistor };


export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof confStore.dispatch;
