import { useState, useCallback } from 'react';
import type { Shot } from '../types/shot';
import { getShots, saveShot, deleteShot as removeShotFromStorage } from '../data/storage';

export function useShots() {
  const [shots, setShots] = useState<Shot[]>(() => getShots());

  const addShot = useCallback((shot: Shot) => {
    saveShot(shot);
    setShots(prev => [...prev, shot]);
  }, []);

  const deleteShot = useCallback((id: string) => {
    removeShotFromStorage(id);
    setShots(prev => prev.filter(s => s.id !== id));
  }, []);

  const reload = useCallback(() => {
    setShots(getShots());
  }, []);

  return { shots, addShot, deleteShot, reload };
}
