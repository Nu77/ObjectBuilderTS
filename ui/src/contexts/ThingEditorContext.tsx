import React, { createContext, useContext, useRef, MutableRefObject } from 'react';

interface ThingEditorContextType {
	registerSaveFunction: (saveFn: () => Promise<boolean>) => void;
	saveThingChanges: () => Promise<boolean>;
}

const ThingEditorContext = createContext<ThingEditorContextType | null>(null);

export const ThingEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const saveFunctionRef = useRef<(() => Promise<boolean>) | null>(null);

	const registerSaveFunction = (saveFn: () => Promise<boolean>) => {
		saveFunctionRef.current = saveFn;
	};

	const saveThingChanges = async (): Promise<boolean> => {
		if (saveFunctionRef.current) {
			return await saveFunctionRef.current();
		}
		return false;
	};

	return (
		<ThingEditorContext.Provider value={{ registerSaveFunction, saveThingChanges }}>
			{children}
		</ThingEditorContext.Provider>
	);
};

export const useThingEditor = (): ThingEditorContextType => {
	const context = useContext(ThingEditorContext);
	if (!context) {
		throw new Error('useThingEditor must be used within ThingEditorProvider');
	}
	return context;
};

