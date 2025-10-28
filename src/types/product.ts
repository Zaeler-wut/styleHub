// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  storeLink?: string;          // ลิงก์ไปหน้าร้าน (ถ้ามี)
  description?: string;        // รายละเอียดสั้น
  authentic?: boolean;         // true = ของแท้
  images: string[];            // รูปหลายใบ (อย่างน้อย 1 ใบ)
  isFavorite?: boolean;        // สำหรับปุ่ม ❤
}
