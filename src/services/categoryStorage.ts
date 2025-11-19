import { type Category } from "../types/category";

const KEY = "categories_v1"; // กำหนดชื่อ key สำหรับเก็บ/อ่านหมวดหมู่จาก localStorage

export function loadCategories(fallback: Category[] = []): Category[] { // ฟังก์ชันโหลดหมวดหมู่จาก localStorage ถ้าไม่มีให้ใช้ fallback แทน
  try { // ใช้ try/catch ป้องกัน error เวลาเข้าถึง localStorage หรือ parse JSON
    const raw = localStorage.getItem(KEY); // อ่านค่า string จาก localStorage ตาม KEY ที่กำหนด
    if (!raw) return fallback; // ถ้าไม่มีข้อมูล (null) ให้คืนค่า fallback ทันที
    const arr = JSON.parse(raw); // แปลง string JSON ให้เป็น object/array
    return Array.isArray(arr) ? arr : fallback; // ถ้าเป็น array จริงให้คืนค่า arr ไม่งั้นคืน fallback
  } catch { // ถ้าเกิด error ระหว่างอ่านหรือ parse
    return fallback; // คืน fallback เพื่อไม่ให้แอปพัง
  }
}

export function saveCategories(items: Category[]) { // ฟังก์ชันบันทึกรายการหมวดหมู่ลง localStorage
  localStorage.setItem(KEY, JSON.stringify(items)); // แปลง array ของหมวดหมู่เป็น JSON string แล้วเก็บลง localStorage
}