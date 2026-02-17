"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ParticipantContext = createContext<any>(null);

// Consistent key for storage
const STORAGE_KEY = "activeParticipant";

export const ParticipantProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  // Load from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectedParticipant(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const switchParticipant = useCallback((participant: any) => {
    if (!participant) {
      setSelectedParticipant(null);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setSelectedParticipant(participant);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(participant));
    }
  }, []);

  // IMPORTANT: Create a clear function specifically for logout
  const clearParticipant = useCallback(() => {
    setSelectedParticipant(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ParticipantContext.Provider 
      value={{ 
        selectedParticipant, 
        switchParticipant, 
        setSelectedParticipant: switchParticipant,
        clearParticipant // Expose this
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = () => useContext(ParticipantContext);