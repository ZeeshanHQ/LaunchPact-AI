import React, { createContext, useContext } from 'react';

interface BlueprintContextType {
  onCreateBlueprint: (idea: string) => Promise<void>;
  isLoading: boolean;
}

const BlueprintContext = createContext<BlueprintContextType | undefined>(undefined);

export const BlueprintProvider: React.FC<{
  children: React.ReactNode;
  onCreateBlueprint: (idea: string) => Promise<void>;
  isLoading: boolean;
}> = ({ children, onCreateBlueprint, isLoading }) => {
  return (
    <BlueprintContext.Provider value={{ onCreateBlueprint, isLoading }}>
      {children}
    </BlueprintContext.Provider>
  );
};

export const useBlueprint = () => {
  const context = useContext(BlueprintContext);
  if (!context) {
    throw new Error('useBlueprint must be used within BlueprintProvider');
  }
  return context;
};
