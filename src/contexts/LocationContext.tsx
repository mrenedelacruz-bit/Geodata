import { createContext, useContext } from 'react';

interface LocationContextType {
  location: string;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children, location }: { children: React.ReactNode; location: string }) {
  return <LocationContext.Provider value={{ location }}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context.location;
}
