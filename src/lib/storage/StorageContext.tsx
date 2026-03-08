import React, { createContext, useContext } from 'react';
import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './local-storage-adapter';

const defaultAdapter = new LocalStorageAdapter();

const StorageContext = createContext<StorageAdapter>(defaultAdapter);

/**
 * Wrap your app in StorageProvider to inject a custom StorageAdapter.
 * If no adapter is provided, localStorage is used by default.
 *
 * Usage for backend migration:
 *   <StorageProvider adapter={new SupabaseStorageAdapter(client)}>
 *     <App />
 *   </StorageProvider>
 */
export function StorageProvider({
  adapter = defaultAdapter,
  children,
}: {
  adapter?: StorageAdapter;
  children: React.ReactNode;
}) {
  return (
    <StorageContext.Provider value={adapter}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
