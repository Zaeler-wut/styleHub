// src/services/auth.ts
export type Role = "member" | "admin";
export type User = { name: string; password: string; role: Role };
export type SessionUser = { name: string; role: Role } | null;

// ✅ บัญชีตั้งต้นจากไฟล์ (admin เก็บรหัสไว้ที่นี่)
import baseUsers from "../data/user.json"; // ต้องมี resolveJsonModule:true

/* ---------- safe localStorage ---------- */
function hasStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const k = "__ls_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch { return false; }
}
function readJSON<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function writeJSON<T>(key: string, val: T) {
  if (!hasStorage()) return;
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ---------- Users (local) ---------- */
function getLocalUsers(): User[] {
  const arr = readJSON<User[]>("users", []);
  return Array.isArray(arr) ? arr : [];
}
function saveLocalUsers(users: User[]) {
  writeJSON("users", users);
}

/* ---------- Session ---------- */
export function getSessionUser(): SessionUser {
  const u = readJSON<SessionUser>("user", null);
  if (!u || typeof u !== "object") return null;
  const name = (u as any).name;
  const role = (u as any).role;
  if (!name || (role !== "admin" && role !== "member")) return null;
  return { name, role };
}
export function setSessionUser(u: Exclude<SessionUser, null>) {
  writeJSON("user", { name: u.name, role: u.role });
}
export function logout() {
  if (!hasStorage()) return;
  try { window.localStorage.removeItem("user"); } catch {}
}

/* ---------- Auth ---------- */
export function register(username: string, password: string):
  | { ok: true }
  | { ok: false; message: string } {
  const u = (username ?? "").trim();
  const p = password ?? "";
  if (!u) return { ok: false, message: "กรุณากรอกชื่อผู้ใช้" };
  if (!p) return { ok: false, message: "กรุณากรอกรหัสผ่าน" };

  const locals = getLocalUsers();
  // กันชื่อซ้ำกับ local และกับ base JSON
  const taken =
    locals.some(x => x.name.toLowerCase() === u.toLowerCase()) ||
    (baseUsers as User[]).some(x => x.name.toLowerCase() === u.toLowerCase());
  if (taken) return { ok: false, message: "มีชื่อผู้ใช้นี้แล้ว" };

  locals.push({ name: u, password: p, role: "member" });
  saveLocalUsers(locals);
  return { ok: true };
}

export function login(username: string, password: string):
  | { ok: true; user: Exclude<SessionUser, null> }
  | { ok: false; message: string } {
  const u = (username ?? "").trim();
  const p = password ?? "";
  if (!u || !p) return { ok: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };

  // 1) เช็คใน localStorage ก่อน (สมาชิกที่สมัคร)
  const locals = getLocalUsers();
  const foundLocal = locals.find(x => x.name === u && x.password === p);
  if (foundLocal) {
    const session = { name: foundLocal.name, role: foundLocal.role };
    setSessionUser(session);
    return { ok: true, user: session };
  }

  // 2) ไม่เจอใน local → เช็คใน base JSON (admin)
  const foundBase = (baseUsers as User[]).find(x => x.name === u && x.password === p);
  if (foundBase) {
    const session = { name: foundBase.name, role: foundBase.role };
    setSessionUser(session);
    return { ok: true, user: session };
  }

  return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
}
