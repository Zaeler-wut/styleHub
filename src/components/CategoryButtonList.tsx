// src/components/CategoryButtonList.tsx
// คอมโพเนนต์แสดง “ปุ่มหมวดหมู่สินค้า” เป็นลิสต์ของปุ่มที่กดแล้วพาไปหน้าสินค้าตามหมวดนั้น ๆ

import { Link } from "react-router-dom"; // ใช้ Link ของ react-router-dom สำหรับลิงก์ไปยังหน้าสินค้าแต่ละหมวด
import Button from "./Button"; // ปุ่ม Button แบบ reusable ที่เราสร้างเอง
import seedCats from "../data/categorys.json"; // ข้อมูลหมวดหมู่ตั้งต้นที่เก็บไว้ในไฟล์ JSON
import { type Category as Cat } from "../types/category"; // ใช้ type Category (เปลี่ยนชื่อเป็น Cat เพื่ออ่านง่ายในไฟล์นี้)

// รูปแบบของ props ที่ CategoryButtonList รองรับ
// - limit      : จำกัดจำนวนหมวดหมู่ที่จะแสดง (ไม่กำหนด = แสดงทั้งหมด)
// - className  : เพิ่มคลาส Tailwind ภายนอกให้กล่องครอบปุ่มทั้งหมด
// - categories : ถ้ามี จะใช้รายการหมวดหมู่นี้แทน seedCats (เช่น ข้อมูลจากฐานข้อมูลจริง)
type Props = {
  limit?: number;
  className?: string;
  categories?: Cat[];
};

// ฟังก์ชันช่วยปรับรูปแบบ string ให้เป็นมาตรฐานเดียวกัน
// - ถ้าเป็น undefined ให้คืนค่าเป็น "" (สตริงว่าง)
// - trim() เพื่อตัดช่องว่างหัว–ท้าย
// - toLowerCase() เพื่อให้เปรียบเทียบแบบไม่สนตัวพิมพ์ใหญ่/เล็ก
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export default function CategoryButtonList({
  categories,
  limit,
  className = "",
}: Props) {
  // 1) สร้าง seedMap จากหมวดหมู่ในไฟล์ JSON
  //    จุดประสงค์: ใช้เป็น “แหล่งอ้างอิง” สำหรับเติมชื่อหมวดหมู่ให้ครบ
  //    แต่จะไม่สร้าง id ใหม่ เพิ่มเข้าไปเอง
  const seedMap = new Map<string, { id: string; name?: string }>();

  (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => {
    const idRaw = String(c?.id ?? "").trim(); // แปลง id ให้เป็น string และตัดช่องว่าง
    if (!idRaw) return; // ถ้าไม่มี id จริง ๆ ให้ข้ามไม่เอาเข้าระบบ

    const key = norm(idRaw); // ใช้ id ที่ normalize แล้วเป็น key หลัก
    seedMap.set(key, {
      id: idRaw,
      // name อาจไม่มีได้ จึงเก็บเป็น name? และ trim ช่องว่างออก
      name: (c?.name || "").trim() || undefined,
    });
  });

  // 2) เลือก source ข้อมูลหลักที่ใช้สร้างลิสต์หมวดหมู่
  //    - ถ้า props.categories มีค่าจริงและไม่ว่าง → ใช้ข้อมูลจาก props
  //    - ถ้าไม่ → fallback ไปใช้ seedCats จาก JSON
  const useProps = Array.isArray(categories) && categories.length > 0;

  const src: Array<{ id?: string; name?: string }> = useProps
    ? categories!
    : ((seedCats as Array<{ id?: string; name?: string }>) || []);

  // 3) ประมวลผล source ทั้งหมดเข้า map ใหม่
  //    map นี้จะเก็บหมวดหมู่ที่ “เติมชื่อให้ครบแล้ว” และไม่ซ้ำกันตาม key ที่ normalize แล้ว
  const map = new Map<string, { id: string; name: string }>();

  for (const item of src) {
    const idRaw = String(item?.id ?? "").trim(); // ดึง id จาก item ปัจจุบัน
    if (!idRaw) continue; // ถ้าไม่มี id ให้ข้าม

    const key = norm(idRaw); // สร้าง key ที่ normalize แล้วเพื่อใช้ป้องกันการซ้ำ
    const seeded = seedMap.get(key); // ลองดึงข้อมูลอ้างอิง (seed) จาก seedMap

    // ลำดับการเลือกชื่อหมวดหมู่:
    // 1) ใช้ name จาก props.categories ก่อน (กรณีมีข้อมูลสดจากฐานข้อมูล)
    // 2) ถ้าไม่มี ให้ใช้ name จาก seedCats
    // 3) ถ้ายังไม่มีชื่อเลย ให้ fallback เป็น idRaw
    const name =
      (item?.name || "").trim() ||
      (seeded?.name || "").trim() ||
      idRaw;

    // ถ้า key นี้ยังไม่เคยเก็บลง map ให้เพิ่มเข้าไป
    // ป้องกันกรณี id ซ้ำกันไม่ให้สร้างปุ่มซ้ำ
    if (!map.has(key)) {
      map.set(key, { id: idRaw, name });
    }
  }

  // 4) แปลง map → array เพื่อเอาไป render ใน JSX
  const cats = Array.from(map.values());

  // 5) ถ้า props.limit เป็นตัวเลข ให้จำกัดจำนวนหมวดหมู่ตาม limit
  //    ถ้าไม่กำหนด limit ให้ใช้รายการทั้งหมด
  const list = typeof limit === "number" ? cats.slice(0, limit) : cats;

  return (
    // กล่องครอบปุ่มหมวดหมู่ทั้งหมด
    // - mt-6       : เว้นระยะห่างด้านบน
    // - flex-wrap  : ถ้าปุ่มล้นบรรทัดให้ตัดขึ้นบรรทัดใหม่
    // - gap-4      : เว้นช่องไฟระหว่างปุ่ม
    // - className  : รับคลาสเพิ่มเติมจากภายนอกมารวมด้วย
    <div className={`mt-6 flex flex-wrap gap-4 ${className}`}>
      {/* วนสร้างปุ่มหมวดหมู่จาก list ที่เตรียมไว้ */}
      {list.map((c) => (
        // ใช้ Link เพื่อให้เมื่อคลิกแล้วเปลี่ยนไปยังหน้าสินค้าของหมวดนั้น ๆ
        // path: /products/<id แบบ normalize แล้ว>
        <Link
          to={`/products/${encodeURIComponent(norm(c.id))}`}
          key={norm(c.id)}
        >
          <Button
            label={c.name} // แสดงชื่อหมวดหมู่บนปุ่ม
            variant="outline" // ใช้ปุ่มแบบขอบ (outline) ให้ดูเบา เหมาะกับปุ่ม filter
            size="lg" // ใช้ขนาดใหญ่เพื่อให้กดง่ายบนทั้งมือถือและเดสก์ท็อป
            className="rounded-full border-0 bg-white shadow hover:translate-y-[1px]"
            // className เพิ่มเติม:
            // - rounded-full       : ปุ่มเป็นทรงแคปซูล
            // - bg-white           : พื้นหลังขาว ตัดกับพื้นหลังรอบ ๆ
            // - shadow             : มีเงาเล็กน้อยให้ปุ่มลอยขึ้นมา
            // - hover:translate-y  : เวลา hover ขยับลงเล็กน้อยให้รู้สึกว่าปุ่มถูกกด
          />
        </Link>
      ))}

      {/* กรณีไม่มีหมวดหมู่ให้แสดงเลย (list ว่าง) ก็แสดงข้อความแจ้งผู้ใช้แทน */}
      {list.length === 0 && (
        <div className="text-sm text-black/70">ไม่พบหมวดหมู่</div>
      )}
    </div>
  );
}
