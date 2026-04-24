'use client';

import { createContext, useContext } from 'react';

import type { InitialAuthData } from '@/lib/auth/types';

const InitialAuthDataContext = createContext<InitialAuthData | undefined>(undefined);

export function InitialAuthDataProvider({
	children,
	initialData
}: {
	children: React.ReactNode;
	initialData?: InitialAuthData;
}) {
	return (
		<InitialAuthDataContext.Provider value={initialData}>
			{children}
		</InitialAuthDataContext.Provider>
	);
}

export function useInitialAuthData() {
	return useContext(InitialAuthDataContext);
}

export function preferInitialData<T>(liveData: T | undefined, initialData: T | undefined) {
	return liveData === undefined ? initialData : liveData;
}
