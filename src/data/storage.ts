import type { Shot } from '../types/shot';

const STORAGE_KEY = 'mlc_shots';

export function getShots(): Shot[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Shot[];
}

export function saveShot(shot: Shot): void {
  const shots = getShots();
  shots.push(shot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}

export function deleteShot(id: string): void {
  const shots = getShots().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}

export function updateShot(updated: Shot): void {
  const shots = getShots().map(s => s.id === updated.id ? updated : s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shots));
}
