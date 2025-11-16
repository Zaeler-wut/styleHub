// src/components/CategoryButtonList.tsx
import { Link } from "react-router-dom"; // ใช้ Link สำหรับลิงก์ไปยังหน้าสินค้าแต่ละหมวด
import Button from "./Button"; // ปุ่ม UI ที่เราสร้างเอง
import seedCats from "../data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON
import { type Category as Cat } from "../types/category"; // type ของ Category (เปลี่ยนชื่อเป็น Cat เพื่อใช้ในไฟล์นี้)

type Props = {
  limit?: number; // จำกัดจำนวนหมวดหมู่ที่จะแสดง (ถ้าไม่ส่ง จะโชว์ทั้งหมด)
  className?: string; // คลาส Tailwind เพิ่มเติมสำหรับ div ครอบทั้งหมด
  categories?: Cat[]; // ถ้ามี → ใช้เฉพาะรายการ/ids ที่ส่งมาแทนที่จะใช้ seedCats ทั้งหมด
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase(); // ฟังก์ชัน normalize string: ตัดช่องว่าง และแปลงเป็นตัวพิมพ์เล็ก

export default function CategoryButtonList({ categories, limit, className = "" }: Props) { // คอมโพเนนต์แสดงปุ่มหมวดหมู่สินค้า
  // สร้าง seed map เพื่อ "เติม" name ถ้าขาด (อย่าเพิ่ม id ใหม่)
  const seedMap = new Map<string, { id: string; name?: string }>(); // map สำหรับเก็บหมวดหมู่จาก seed ตาม key ปรับรูปแบบแล้ว
  (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => { // วนดูหมวดหมู่จากไฟล์ JSON
    const idRaw = String(c?.id ?? "").trim(); // แปลง id เป็น string และตัดช่องว่าง
    if (!idRaw) return; // ถ้าไม่มี id ให้ข้าม
    const key = norm(idRaw); // สร้าง key แบบ normalize
    seedMap.set(key, { id: idRaw, name: (c?.name || "").trim() || undefined }); // เก็บ id และชื่อ (ถ้ามี) ลงใน seedMap
  });

  const useProps = Array.isArray(categories) && categories.length > 0; // true ถ้ามี categories ที่ส่งผ่าน props และไม่ว่าง

  const src: Array<{ id?: string; name?: string }> = useProps
    ? categories! // ✅ ถ้ามี categories จาก props → ใช้รายการนี้เป็น source
    : ((seedCats as Array<{ id?: string; name?: string }>) || []); // ถ้าไม่มีก็ fallback ไปใช้ seedCats จาก JSON

  const map = new Map<string, { id: string; name: string }>(); // map ใหม่สำหรับผลลัพธ์สุดท้าย (id + name ที่เติมให้ครบแล้ว)
  for (const item of src) { // วนดูทุก item ใน source
    const idRaw = String(item?.id ?? "").trim(); // แปลง id เป็น string และตัดช่องว่าง
    if (!idRaw) continue; // ถ้าไม่มี id ให้ข้าม
    const key = norm(idRaw); // ทำ key แบบ normalize
    const seeded = seedMap.get(key); // ดึงข้อมูล seed (ถ้ามี) จาก seedMap
    const name =
      (item?.name || "").trim() || // ใช้ชื่อจาก props ก่อน (ถ้ามี)
      (seeded?.name || "").trim() || // ถ้าไม่มี ให้ลองใช้ชื่อจาก seed
      idRaw; // ถ้ายังไม่มีชื่อเลย ใช้ id เป็นชื่อ
    if (!map.has(key)) map.set(key, { id: idRaw, name }); // ถ้า key นี้ยังไม่ถูกใช้ ให้เพิ่มเข้า map
  }

  const cats = Array.from(map.values()); // แปลง map เป็น array ของหมวดหมู่
  const list = typeof limit === "number" ? cats.slice(0, limit) : cats; // ถ้ามี limit ให้ slice list ตาม limit ไม่งั้นใช้ทั้งหมด

  return (
    <div className={`mt-6 flex flex-wrap gap-4 ${className}`}> {/* กล่องรวมปุ่มหมวดหมู่ จัดเป็นแถวหลายบรรทัดได้ และเว้นช่องว่างระหว่างปุ่ม */}
      {list.map((c) => (
        <Link to={`/products/${encodeURIComponent(norm(c.id))}`} key={norm(c.id)}> {/* ลิงก์ไปหน้าสินค้าตามหมวดนั้น ๆ โดยใช้ id (normalize แล้ว) */}
          <Button
            label={c.name} // แสดงชื่อหมวดหมู่บนปุ่ม
            variant="outline" // ใช้ปุ่มแบบขอบ (outline)
            size="lg" // ใช้ขนาดใหญ่เพื่อให้กดง่าย
            className="rounded-full border-0 bg-white shadow hover:translate-y-[1px]" // ปรับสไตล์ให้ปุ่มโค้งมน เหมือนแคปซูล และมีเงา
          />
        </Link>
      ))}

      {list.length === 0 && <div className="text-sm text-black/70">ไม่พบหมวดหมู่</div>} {/* ถ้าไม่มีหมวดหมู่เลย แสดงข้อความแจ้งผู้ใช้ */}
    </div>
  );
}
