import { createContext, useContext, useState, type ReactNode } from 'react';

type TechStack = 'react' | 'nextjs';

interface TechContextType {
  selectedTech: TechStack;
  setSelectedTech: (tech: TechStack) => void;
}

const TechContext = createContext<TechContextType | undefined>(undefined);

export function TechProvider({ children }: { children: ReactNode }) {
  const [selectedTech, setSelectedTech] = useState<TechStack>('react');

  return (
    <TechContext.Provider value={{ selectedTech, setSelectedTech }}>
      {children}
    </TechContext.Provider>
  );
}

export function useTech() {
  const context = useContext(TechContext);
  if (context === undefined) {
    throw new Error('useTech must be used within a TechProvider');
  }
  return context;
}
