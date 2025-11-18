import { type Product } from "../types/product"; // นำเข้า type Product เพื่อให้ฟังก์ชันรู้โครงสร้างข้อมูลสินค้า

const KEY = "products_v1"; // กำหนดชื่อ key สำหรับเก็บ/อ่านข้อมูลสินค้าใน localStorage

export function loadProducts(fallback: Product[] = []): Product[] { // ฟังก์ชันโหลดสินค้าจาก localStorage ถ้าไม่มีให้ใช้ fallback
  try { // ใช้ try/catch กัน error เวลาเข้าถึงหรือ parse localStorage
    const raw = localStorage.getItem(KEY); // อ่านค่า string จาก localStorage ตาม KEY
    if (!raw) return fallback; // ถ้าอ่านไม่ได้หรือยังไม่เคยมีข้อมูล ให้คืน fallback ทันที
    const arr = JSON.parse(raw); // แปลง string JSON ให้เป็นตัวแปร JavaScript
    return Array.isArray(arr) ? arr : fallback; // ถ้าเป็น array จริงให้ใช้เลย ไม่งั้นกลับไปใช้ fallback
  } catch { // ถ้า parse หรืออ่านแล้ว error
    return fallback; // คืน fallback เพื่อไม่ให้แอปพัง
  }
}

export function saveProducts(items: Product[]) { // ฟังก์ชันบันทึกรายการสินค้า (array ของ Product) ลง localStorage
  localStorage.setItem(KEY, JSON.stringify(items)); // แปลง items เป็น JSON string แล้วเก็บด้วย KEY เดียวกัน
}