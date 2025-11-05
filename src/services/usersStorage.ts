// src/services/usersStorage.ts
export type Role = "member" | "admin";
export type User = { name: string; password: string; role: Role };

const KEY = "users";

export function loadUsers(): User[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function countAdmins(users: User[]): number {
  return users.filter((u) => u.role === "admin").length;
}

export function removeUserFavorites(username: string) {
  try {
    localStorage.removeItem(`fav:${username}`);
  } catch {}
}
