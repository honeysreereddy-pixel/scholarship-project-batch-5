import { useState, useEffect, useCallback, useRef } from "react";
import { Scholarship } from "@/lib/types";
import {
  mockNationalScholarships,
  mockInternationalScholarships,
  generateRandomScholarship,
} from "@/lib/mockLiveScholarships";

export const useLiveScholarships = (
  intervalMs: number = 8000, 
  initialCount: number = 5
) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const initial: Scholarship[] = [];
    const pool = [...mockNationalScholarships, ...mockInternationalScholarships];
    for (let i = 0; i < initialCount; i++) {
      initial.push(generateRandomScholarship(pool));
    }
    // Sort by recent created_at
    setScholarships(initial);
  }, [initialCount]);

  // Live stream generator
  const simulateLiveEvent = useCallback(() => {
    const isNational = Math.random() > 0.5;
    const pool = isNational ? mockNationalScholarships : mockInternationalScholarships;
    const newScholarship = generateRandomScholarship(pool);
    
    setScholarships((prev) => [newScholarship, ...prev.slice(0, 49)]); // Keep last 50
    setJustAddedId(newScholarship.id);

    // clear the highlight after 3 seconds
    setTimeout(() => {
      setJustAddedId((current) => current === newScholarship.id ? null : current);
    }, 3000);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLive) {
      // Simulate socket events randomly between intervalMs/2 and intervalMs*1.5
      const scheduleNext = () => {
        const nextDelay = intervalMs * (0.5 + Math.random());
        timerRef.current = setTimeout(() => {
          simulateLiveEvent();
          scheduleNext();
        }, nextDelay);
      };
      
      scheduleNext();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLive, intervalMs, simulateLiveEvent]);

  const toggleLive = () => setIsLive(!isLive);

  return {
    scholarships,
    isLive,
    toggleLive,
    justAddedId
  };
};
