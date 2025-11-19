// src/services/auth.ts
export type Role = "member" | "admin";  // กำหนดชนิด Role ให้มีแค่ "member" หรือ "admin"
export type User = { name: string; password: string; role: Role }; // กำหนดโครงสร้าง User ที่ใช้เก็บใน local (มี name/password/role)
export type SessionUser = { name: string; role: Role } | null; // ชนิดของผู้ใช้ที่เก็บใน session (ไม่มี password และอาจเป็น null ได้)

// ✅ บัญชีตั้งต้นจากไฟล์ (admin เก็บรหัสไว้ที่นี่)
import baseUsers from "../data/user.json"; // นำเข้าบัญชีเริ่มต้น (เช่น admin) จากไฟล์ JSON (ต้องตั้ง resolveJsonModule:true)

/* ---------- safe localStorage ---------- */
function hasStorage(): boolean {  // ฟังก์ชันเช็คว่าสามารถใช้ localStorage ได้แบบปลอดภัยหรือไม่
  try { // ใช้ try/catch กัน error จาก browser แปลก ๆ หรือโหมด private
    if (typeof window === "undefined") return false; // ถ้าไม่มี window (เช่นตอน SSR) ให้บอกว่าใช้ storage ไม่ได้
    const k = "__ls_test__";  // key ทดสอบ
    window.localStorage.setItem(k, "1"); // ทดลองเขียนค่า
    window.localStorage.removeItem(k);  // ทดลองลบค่า
    return true; // ถ้าไม่ error แสดงว่าใช้ localStorage ได้
  } catch { return false; } // ถ้ามี error แสดงว่าใช้ไม่ได้
}
function readJSON<T>(key: string, fallback: T): T { // ฟังก์ชันอ่าน JSON จาก localStorage พร้อมค่า fallback
  if (!hasStorage()) return fallback; // ถ้าใช้ storage ไม่ได้ให้คืนค่า fallback ทันที
  try { // พยายามอ่านค่า
    const raw = window.localStorage.getItem(key); // ดึง string จาก localStorage ตาม key
    if (!raw) return fallback; // ถ้าไม่มีค่าให้คืน fallback
    return JSON.parse(raw) as T; // แปลง string เป็น JSON แล้ว cast เป็นชนิด T
  } catch { return fallback; } // ถ้า parse พลาดให้คืน fallback
}
function writeJSON<T>(key: string, val: T) { // ฟังก์ชันเขียนค่าเป็น JSON ลง localStorage
  if (!hasStorage()) return; // ถ้าใช้ storage ไม่ได้ให้หยุด
  try { window.localStorage.setItem(key, JSON.stringify(val)); } // แปลง object เป็น JSON แล้วเขียนตาม key
  catch {} // ถ้า error ก็เงียบไว้ไม่ให้แอปพัง
}

/* Users (local) */
function getLocalUsers(): User[] {  // ฟังก์ชันอ่าน users ที่สมัครผ่านเว็บจาก localStorage
  const arr = readJSON<User[]>("users", []); // ใช้ readJSON อ่าน key "users" ถ้าไม่มีให้ []
  return Array.isArray(arr) ? arr : []; // ถ้าผลลัพธ์ไม่ใช่ array ให้คืน []
}
function saveLocalUsers(users: User[]) { // ฟังก์ชันบันทึก users กลับไป localStorage
  writeJSON("users", users); // เขียน users (array) ไปยัง key "users"
}

/* Session */
export function getSessionUser(): SessionUser { // ฟังก์ชันอ่านผู้ใช้ที่ล็อกอินปัจจุบันจาก localStorage
  const u = readJSON<SessionUser>("user", null); // ใช้ readJSON อ่าน key "user" ถ้าไม่มีให้ null
  if (!u || typeof u !== "object") return null; // ถ้าไม่ใช่ object ให้ถือว่าไม่มี session
  const name = (u as any).name; // ดึงชื่อจาก object (ใช้ any ป้องกัน type แข็งเกิน)
  const role = (u as any).role;  // ดึง role จาก object
  if (!name || (role !== "admin" && role !== "member")) return null; // ถ้าไม่มี name หรือ role ไม่ตรง "admin"/"member" ให้ถือว่า session ไม่ valid
  return { name, role }; // คืน session ที่เช็คแล้วในรูปแบบ SessionUser
}
export function setSessionUser(u: Exclude<SessionUser, null>) {  // ฟังก์ชันเซ็ต session user (ต้องไม่เป็น null)
  writeJSON("user", { name: u.name, role: u.role }); // เขียนชื่อและ role ลง key "user" เพื่อใช้เป็น session
}
export function logout() { // ฟังก์ชัน logout
  if (!hasStorage()) return; // ถ้าใช้ storage ไม่ได้ก็ไม่ต้องทำอะไร
  try { window.localStorage.removeItem("user"); } catch {} // ลบ key "user" ออกจาก localStorage (ตัด session)
}

/* ---------- Auth ---------- */
export function register(username: string, password: string): // ฟังก์ชันสมัครสมาชิกใหม่
  | { ok: true } // กรณีสำเร็จ คืน {ok:true}
  | { ok: false; message: string } {  // กรณีไม่ผ่าน คืน {ok:false,message:"..."}
  const u = (username ?? "").trim();  // ตัดช่องว่างชื่อผู้ใช้ (กัน null/undefined)
  const p = password ?? "";  // รหัสผ่าน ถ้า null/undefined ให้เป็น ""
  if (!u) return { ok: false, message: "กรุณากรอกชื่อผู้ใช้" }; // ถ้าไม่ได้กรอกชื่อ ให้แจ้ง error
  if (!p) return { ok: false, message: "กรุณากรอกรหัสผ่าน" };  // ถ้าไม่ได้กรอกรหัสผ่าน ให้แจ้ง error

  const locals = getLocalUsers(); // อ่านผู้ใช้ที่ถูกเก็บใน localStorage
  // กันชื่อซ้ำกับ local และกับ base JSON
  const taken =  // เช็คว่ามีชื่อซ้ำแล้วหรือไม่
    locals.some(x => x.name.toLowerCase() === u.toLowerCase()) || // ซ้ำใน localStorage (ไม่สนพิมพ์เล็ก/ใหญ่)
    (baseUsers as User[]).some(x => x.name.toLowerCase() === u.toLowerCase()); // 2) ซ้ำกับรายชื่อเริ่มต้นจากไฟล์ (เช่น admin)
  if (taken) return { ok: false, message: "มีชื่อผู้ใช้นี้แล้ว" }; // ถ้าชื่อถูกใช้แล้ว คืน error ทันที

  locals.push({ name: u, password: p, role: "member" }); // ถ้าผ่านทุกอย่าง เพิ่ม user ใหม่เป็น member ลง array
  saveLocalUsers(locals); // บันทึก array ที่เพิ่มใหม่กลับไป localStorage
  return { ok: true }; // สมัครสำเร็จ คืนค่า ok:true
}

export function login(username: string, password: string): // ฟังก์ชันล็อกอิน
  | { ok: true; user: Exclude<SessionUser, null> } // สำเร็จ: คืน ok:true และ object user (ไม่มี password)
  | { ok: false; message: string } { // ไม่สำเร็จ: คืน ok:false พร้อมข้อความ
  const u = (username ?? "").trim();  // ตัดช่องว่างชื่อผู้ใช้
  const p = password ?? "";  // ถ้า password เป็น null/undefined ให้เป็น ""
  if (!u || !p) return { ok: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }; // ถ้าไม่กรอกครบให้แจ้ง error ทันที

  // 1) เช็คใน localStorage ก่อน (สมาชิกที่สมัคร)
  const locals = getLocalUsers(); // อ่านรายชื่อ user ที่สมัครเก็บไว้ใน localStorage
  const foundLocal = locals.find(x => x.name === u && x.password === p); // หา user ที่ name/password ตรงกันใน local
  if (foundLocal) {  // ถ้าเจอใน local
    const session = { name: foundLocal.name, role: foundLocal.role }; // เตรียม session (ไม่เก็บ password)
    setSessionUser(session); // เขียน session ลง localStorage
    return { ok: true, user: session }; // คืนผลลัพธ์ล็อกอินสำเร็จ พร้อมข้อมูล session
  }

  // ไม่เจอใน local เช็คใน base JSON (admin)
  const foundBase = (baseUsers as User[]).find(x => x.name === u && x.password === p); // หา user ในรายชื่อฐาน (เช่น admin)
  if (foundBase) { // ถ้าพบใน base
    const session = { name: foundBase.name, role: foundBase.role }; // สร้าง session จากผู้ใช้ใน base
    setSessionUser(session); // เซ็ต session ลง localStorage
    return { ok: true, user: session }; // คืนผลลัพธ์ล็อกอินสำเร็จ
  }

  return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }; // ถ้าไม่เจอทั้งใน local และ base ให้แจ้งว่าข้อมูลไม่ถูกต้อง
}
