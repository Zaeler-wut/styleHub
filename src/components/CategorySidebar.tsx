// src/components/CategorySidebar.tsx
import React, { useMemo } from "react"; // ใช้ React และ useMemo สำหรับคำนวณรายการหมวดหมู่แบบ cache
import { Link } from "react-router-dom"; // ใช้ Link สำหรับลิงก์ไปยังหน้าสินค้าตามหมวดหมู่
import seedCats from "../data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON

type Cat = { id: string; name?: string }; // โครงสร้างหมวดหมู่ที่ใช้ใน Sidebar

// ✅ รองรับทั้ง string[] และ Cat[]
type Props = {
  categories?: Array<string | Cat>; // ถ้ามี: ใช้รายการหมวดหมู่จาก props แทน seed
  selectedKey?: string; // key ของหมวดหมู่ที่ถูกเลือกอยู่ตอนนี้ (เช่น จาก URL)
  className?: string; // คลาสเสริมสำหรับ aside
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase(); // ปรับสตริงให้เป็นตัวพิมพ์เล็กและตัดช่องว่าง

export default function CategorySidebar({
  categories,
  selectedKey,
  className = "",
}: Props) {
  const current = norm(selectedKey ?? "all"); // หาค่า current key (ถ้าไม่มีให้ใช้ "all" แทน)

  const cats: Cat[] = useMemo(() => { // ใช้ useMemo เพื่อคำนวณรายการหมวดหมู่ครั้งเดียวต่อ dependencies
    const hasProps = Array.isArray(categories) && categories.length > 0; // เช็คว่ามี categories ส่งมาจริงไหม

    // 1) ถ้ามี props → ใช้เฉพาะ props (ไม่ fallback/ไม่ union กับไฟล์)
    if (hasProps) {
      const map = new Map<string, Cat>(); // map ป้องกัน id ซ้ำ
      for (const item of categories!) { // วนทีละ item ใน props
        if (typeof item === "string") { // กรณีส่งมาเป็น string
          const id = norm(item); // normalize id
          if (!id) continue; // ถ้าไม่มี id ให้ข้าม
          if (!map.has(id)) map.set(id, { id }); // ถ้ายังไม่เคยเก็บ id นี้ ให้สร้าง Cat โดยไม่มี name
        } else { // กรณีส่งมาเป็น object { id, name }
          const id = norm(item.id); // normalize id
          if (!id) continue; // ถ้าไม่มี id ให้ข้าม
          const name = (item.name || "").trim(); // name ตัดช่องว่าง ถ้ามี
          if (!map.has(id)) map.set(id, { id, name: name || undefined }); // ถ้า name ว่างให้เก็บเป็น undefined
        }
      }
      return Array.from(map.values()); // แปลง map → array เพื่อใช้ render
    }

    // 2) ถ้าไม่มี props → ค่อย fallback ไฟล์ JSON
    const map = new Map<string, Cat>(); // map สำหรับดึงจาก seedCats
    (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => {
      const id = norm(String(c?.id ?? "")); // normalize id จากไฟล์
      if (!id) return; // ไม่มี id ข้าม
      const name = (c?.name || "").trim(); // ชื่อหมวดหมู่จากไฟล์
      if (!map.has(id)) map.set(id, { id, name: name || undefined }); // เก็บ cat ถ้ายังไม่มี key นี้
    });
    return Array.from(map.values()); // แปลง map → array
  }, [categories]); // ถ้า categories เปลี่ยน ให้คำนวณใหม่

  return (
    <aside
      className={`w-full sm:w-56 rounded-[1.5rem] bg-white/85 px-5 py-6 shadow-md ring-1 ring-black/5 ${className}`} // กล่อง sidebar ด้านซ้าย
    >
      <ul className="space-y-5 text-center"> {/* รายการลิงก์หมวดหมู่ */}
        <li>
          <Link
            to="/products"
            className={`inline-block text-base font-semibold ${
              current === "all" ? "text-rose-400" : "text-black"
            }`} // ไฮไลต์เมื่ออยู่ที่ "หมวดหมู่ทั้งหมด"
          >
            หมวดหมู่ทั้งหมด
          </Link>
        </li>

        {cats.map((c) => {
          const id = norm(c.id); // normalize id ไว้เทียบกับ current และใช้ใน URL
          const active = current === id; // เป็นหมวดที่ถูกเลือกอยู่ไหม
          return (
            <li key={id}>
              <Link
                to={`/products/${encodeURIComponent(id)}`} // ลิงก์ไปหน้าสินค้าของหมวดนี้
                className={`inline-block text-base font-semibold ${
                  active ? "text-rose-400" : "text-black"
                }`} // เปลี่ยนสีตามสถานะ active
                title={c.name || c.id} // tooltip แสดงชื่อหมวด
              >
                {c.name || c.id} {/* แสดงชื่อหมวด ถ้าไม่มีใช้ id แทน */}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
