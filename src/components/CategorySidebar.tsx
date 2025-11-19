// Sidebar สำหรับเลือกหมวดหมู่สินค้าในหน้ารวมสินค้า
// ใช้แสดงลิงก์ “หมวดหมู่ทั้งหมด” และลิงก์ไปแต่ละหมวดตาม id/name

import { useMemo } from "react"; // useMemo ใช้ช่วย cache รายการหมวดหมู่ไม่ให้คำนวณซ้ำเกินจำเป็น
import { Link } from "react-router-dom"; // Link ใช้สำหรับเปลี่ยนหน้า (route) ไปยังสินค้าตามหมวดหมู่
import seedCats from "../data/categorys.json"; // ข้อมูลหมวดหมู่ตั้งต้นจากไฟล์ JSON

// รูปแบบหมวดหมู่ที่ใช้ใน Sidebar
// id : รหัสหมวดหมู่ (ใช้กับ URL และใช้เป็น key)
// name : ชื่อหมวดหมู่ที่แสดงให้ผู้ใช้เห็น (อาจไม่มีได้)
type Cat = { id: string; name?: string };

// Props ของ CategorySidebar
// categories : ถ้ามี ให้ใช้รายการหมวดหมู่ชุดนี้แทน seed จากไฟล์ (รองรับทั้ง string[] และ Cat[])
// selectedKey : key ของหมวดหมู่ที่ถูกเลือกอยู่ตอนนี้ (เช่น มาจาก URL params)
// className : คลาสเสริมสำหรับปรับแต่งสไตล์ตัว aside จากภายนอก
type Props = {
  categories?: Array<string | Cat>;
  selectedKey?: string;
  className?: string;
};

// ฟังก์ชันช่วย normalize string:
// ถ้าเป็น null/undefined ให้เป็น สตริงว่าง
// trim() ตัดช่องว่างหัวท้าย
// toLowerCase() แปลงเป็นตัวพิมพ์เล็กเพื่อใช้เปรียบเทียบได้เสถียร
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export default function CategorySidebar({
  categories,
  selectedKey,
  className = "",
}: Props) {
  // current คือ key ของหมวดหมู่ที่ถือว่า กำลังถูกเลือก
  // ถ้าไม่ส่ง selectedKey มาให้ ถือว่าตอนนี้อยู่ที่ หมวดหมู่ทั้งหมด
  const current = norm(selectedKey ?? "all");

  // เตรียมรายการหมวดหมู่ที่จะแสดงใน Sidebar
  // ดึงมาจาก props.categories ถ้ามีข้อมูล
  // ถ้าไม่มี props เลย ค่อย fallback ไปใช้ seedCats จากไฟล์ JSON
  const cats: Cat[] = useMemo(() => {
    const hasProps = Array.isArray(categories) && categories.length > 0;

    // กรณี1 มี categories ส่งมาจากภายนอก  ใช้เฉพาะข้อมูลจาก props
    if (hasProps) {
      const map = new Map<string, Cat>(); // ใช้ Map เพื่อป้องกัน id ซ้ำ

      for (const item of categories!) {
        if (typeof item === "string") {
          // เคสที่ props ส่งมาเป็น string id ล้วน ๆ
          const id = norm(item);
          if (!id) continue;

          if (!map.has(id)) {
            // ถ้า id นี้ยังไม่เคยถูกเก็บ ให้สร้าง Cat โดยยังไม่รู้ name
            map.set(id, { id });
          }
        } else {
          // เคสที่ props ส่งมาเป็น object { id, name }
          const id = norm(item.id);
          if (!id) continue;

          const name = (item.name || "").trim();
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: name || undefined, // ถ้า name ว่างไม่ใส่จะได้ไม่เก็บสตริงว่าง
            });
          }
        }
      }

      return Array.from(map.values());
    }

    // กรณี 2 ไม่ได้ส่ง categories เข้ามา  ใช้ seedCats จากไฟล์ JSON แทน
    const map = new Map<string, Cat>();

    (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => {
      const id = norm(String(c?.id ?? ""));
      if (!id) return;

      const name = (c?.name || "").trim();
      if (!map.has(id)) {
        map.set(id, { id, name: name || undefined });
      }
    });

    return Array.from(map.values());
  }, [categories]);

  return (
    // กล่อง Sidebar ด้านซ้าย
    // กว้างเต็มจอในมือถือ และกว้างคงที่ (sm:w-56) บนจอใหญ่
    // พื้นหลังขาวโปร่งเล็กน้อย เงา เส้นขอบบาง
    <aside
      className={`w-full sm:w-56 rounded-[1.5rem] bg-white/85 px-5 py-6 shadow-md ring-1 ring-black/5 ${className}`}
    >
      {/* ลิสต์เมนูหมวดหมู่ (เรียงในแนวตั้ง, เว้นระยะห่างแต่ละรายการ) */}
      <ul className="space-y-5 text-center">
        {/* ปุ่ม หมวดหมู่ทั้งหมด */}
        <li>
          <Link
            to="/products"
            className={`inline-block text-base font-semibold ${
              current === "all" ? "text-rose-400" : "text-black"
            }`}
          >
            หมวดหมู่ทั้งหมด
          </Link>
        </li>

        {/* ลิสต์หมวดหมู่ย่อยแต่ละอัน */}
        {cats.map((c) => {
          const id = norm(c.id); // แปลง id เป็นรูปแบบมาตรฐานไว้ใช้เทียบกับ current และใช้ใน URL
          const active = current === id; // หมวดนี้คือหมวดที่ถูกเลือกอยู่หรือไม่

          return (
            <li key={id}>
              <Link
                to={`/products/${encodeURIComponent(id)}`}
                className={`inline-block text-base font-semibold ${
                  active ? "text-rose-400" : "text-black"
                }`}
                title={c.name || c.id} // tooltip เมื่อ hover บนลิงก์
              >
                {/* ถ้ามีชื่อหมวดให้แสดง name, ถ้าไม่มีก็ fallback เป็น id */}
                {c.name || c.id}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
