// คอมโพเนนต์แสดง “หมวดหมู่สินค้าแบบมีรูปภาพ” ในรูปแบบกริด
// แต่ละการ์ดกดแล้วจะลิงก์ไปหน้ารายการสินค้าตามหมวดหมู่

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import seedCats from "../data/categorys.json";

// โครงสร้างข้อมูลหมวดหมู่ที่ใช้ภายในคอมโพเนนต์นี้
// id : รหัสหมวด
// name : ชื่อหมวดหมู่ที่เอาไว้แสดงผล
// image : URL รูปภาพประจำหมวด
type Category = {
  id: string;
  name?: string;
  image?: string;
};

// รูปแบบ props ของ CategoryImageGrid
// categories : ถ้ามี จะใช้ข้อมูลชุดนี้เป็นหลัก (เช่นจากฐานข้อมูลจริง)
// className : เพิ่มคลาส Tailwind สำหรับ container ภายนอก
type Props = {
  categories?: Category[];
  className?: string;
  limit?: number;
};

// ฟังก์ชัน normalize string
// ใช้เพื่อให้การเปรียบเทียบ id มั่นคงขึ้น (ไม่สนช่องว่างและตัวพิมพ์เล็ก/ใหญ่)
const norm = (s?: string) => (s ?? "").trim().toLowerCase();

// คอมโพเนนต์หลักแสดงกริดรูปหมวดหมู่
const CategoryImageGrid: React.FC<Props> = ({
  categories,
  className = "",
  limit,
}) => {
  // ใช้ useMemo เพื่อคำนวณรายการหมวดหมู่เฉพาะตอนที่ categories หรือ limit เปลี่ยน
  // ช่วยลดการทำงานซ้ำ ๆ เวลา component re-render
  const items = useMemo(() => {
    // แปลงข้อมูลจากไฟล์ JSON ให้แน่ใจว่าได้ array
    const seedArr =
      (seedCats as Array<{ id?: string; name?: string; image?: string }>) ||
      [];

    // สร้าง seedMap เก็บข้อมูลหมวดจากไฟล์ JSON โดยใช้ id ที่ normalize แล้วเป็น key
    const seedMap = new Map<string, Category>();
    for (const s of seedArr) {
      const idRaw = String(s?.id || "").trim();
      if (!idRaw) continue;

      seedMap.set(norm(idRaw), {
        id: idRaw,
        name: s.name?.trim() || undefined,
        image: s.image?.trim() || undefined,
      });
    }

    // ถ้า props.categories มีค่าและไม่ว่าง ใช้เป็น source หลัก
    // ถ้าไม่ ใช้ข้อมูลจาก seedArr แทน
    const useProps = Array.isArray(categories) && categories.length > 0;
    const src: Category[] = useProps
      ? categories!
      : seedArr.map((s) => ({
          id: String(s?.id || "").trim(),
          name: s.name || undefined,
          image: s.image || undefined,
        }));

    // map สุดท้ายเก็บหมวดหมู่ที่รวมข้อมูลจาก props + seed แล้ว
    // และป้องกันไม่ให้ id ซ้ำ (ใช้ key ที่ normalize แล้ว)
    const map = new Map<string, Category>();

    for (const c of src) {
      const idRaw = String(c?.id || "").trim();
      if (!idRaw) continue;

      const key = norm(idRaw);
      const seed = seedMap.get(key);

      // ลำดับการเลือกค่า name:
      // ใช้จาก props.categories ก่อน
      // ถ้าไม่มีใช้จาก seedCats
      // ถ้ายังไม่มีเลย ใช้ id แทน
      const name = (c.name || seed?.name || idRaw).toString();

      // ลำดับการเลือกค่า image:
      // ใช้รูปจาก props ก่อน
      // ถ้าไม่มีใช้จาก seedCats
      const image = (c.image || seed?.image)?.toString().trim();

      if (!map.has(key)) {
        map.set(key, { id: idRaw, name, image });
      }
    }

    // แปลง map array แล้วกรองเอาเฉพาะหมวดที่มีรูปภาพจริง
    const arr = Array.from(map.values()).filter(
      (c) => !!(c.image && c.image.trim())
    );

    // ถ้ามี limit ให้ตัดจำนวนรายการตาม limit, ถ้าไม่มีก็ส่งทั้งหมด
    return typeof limit === "number" ? arr.slice(0, limit) : arr;
  }, [categories, limit]);

  return (
    // กริดแสดงการ์ดหมวดหมู่:
    // grid-cols-2 : แบ่งเป็น 2 คอลัมน์
    // gap-6 : เว้นช่องไฟระหว่างการ์ด
    <div className={`grid grid-cols-2 gap-6 ${className}`}>
      {items.map((c) => {
        const idNorm = norm(c.id);

        return (
          // การ์ดของแต่ละหมวดหมู่
          // ใช้ Link เพื่อให้คลิกแล้วไปที่ /products/<id>
          <Link
            key={idNorm}
            to={`/products/${encodeURIComponent(idNorm)}`}
            title={c.name || c.id}
            className="group block overflow-hidden rounded-xl bg-white/10 backdrop-blur shadow-lg"
          >
            {c.image ? (
              // ถ้ามีรูปภาพ ให้แสดงรูปเต็มการ์ด
              <div className="relative">
                <img
                  src={c.image}
                  alt={c.name || c.id}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  // ถ้าโหลดรูปไม่สำเร็จให้ซ่อนรูป
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                {/* แถบไล่สีด้านล่างรูป ใช้รองป้ายชื่อหมวดหมู่ */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-black/0 p-3">
                  <span className="rounded-md bg-white/85 px-2 py-0.5 text-xs font-semibold text-black shadow">
                    {c.name || c.id}
                  </span>
                </div>
              </div>
            ) : (
              // กรณีหมวดหมู่ไม่มีรูปภาพเลย
              <div className="flex h-44 w-full items-center justify-center bg-black/20 text-white/70">
                ไม่มีรูป
              </div>
            )}
          </Link>
        );
      })}

      {/* ถ้าไม่มีหมวดหมู่ที่มีรูปเลย ให้แสดงข้อความแจ้งผู้ใช้ */}
      {items.length === 0 && (
        <div className="col-span-2 text-center text-sm text-white/80">
          ยังไม่มีหมวดหมู่ที่มีรูป
        </div>
      )}
    </div>
  );
};

export default CategoryImageGrid;