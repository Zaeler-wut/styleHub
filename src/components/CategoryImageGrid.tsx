// src/components/CategoryImageGrid.tsx
import React, { useMemo } from "react"; // นำเข้า React และ useMemo เพื่อคำนวณรายการหมวดหมู่แบบ memoized
import { Link } from "react-router-dom"; // ใช้ Link สำหรับลิงก์ไปยังหน้าสินค้าตามหมวดหมู่
import seedCats from "../data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON

type Category = { id: string; name?: string; image?: string; description?: string }; // รูปแบบข้อมูลหมวดหมู่ที่ใช้ในคอมโพเนนต์นี้

type Props = {
  categories?: Category[]; // ถ้าส่งมาจะใช้เฉพาะรายการ/ids ที่ส่งมา ไม่ใช้ seed ทั้งหมด
  className?: string; // คลาส Tailwind เพิ่มเติมสำหรับ container
  limit?: number; // จำกัดจำนวนหมวดหมู่ที่จะแสดง
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase(); // ฟังก์ชัน normalize string: ถ้า null/undefined ให้เป็น "", ตัดช่องว่าง, แปลงเป็นตัวพิมพ์เล็ก

const CategoryImageGrid: React.FC<Props> = ({ categories, className = "", limit }) => { // คอมโพเนนต์หลักแสดงกริดหมวดหมู่แบบมีรูป
  const items = useMemo(() => { // ใช้ useMemo เพื่อไม่ให้คำนวณรายการใหม่ทุก render ถ้า categories / limit ไม่เปลี่ยน
    const seedArr = (seedCats as Array<{ id?: string; name?: string; image?: string }>) || []; // แปลงข้อมูลจาก JSON ให้เป็น array ที่แน่ใจว่าไม่เป็น null

    const seedMap = new Map<string, Category>(); // สร้าง Map ไว้เก็บข้อมูล seed ตาม id ที่ normalize แล้ว
    for (const s of seedArr) { // วนรอบหมวดหมู่จากไฟล์ JSON
      const idRaw = String(s?.id || "").trim(); // ดึง id ออกมาเป็น string และตัดช่องว่าง
      if (!idRaw) continue; // ถ้าไม่มี id ให้ข้าม
      seedMap.set(norm(idRaw), { // ใช้ id ที่ normalize เป็น key
        id: idRaw, // เก็บ id ดิบไว้ (ยังไม่ toLowerCase)
        name: s.name?.trim() || undefined, // name จาก seed ถ้ามี และตัดช่องว่าง
        image: s.image?.trim() || undefined, // image URL จาก seed ถ้ามี และตัดช่องว่าง
      });
    }

    // ถ้ามี props → สร้างรายการ "เฉพาะ ids ที่อยู่ใน props"
    const useProps = Array.isArray(categories) && categories.length > 0; // true ถ้ามี categories จาก props และไม่ว่าง
    const src: Category[] = useProps
      ? categories! // ถ้ามี categories จาก props ให้ใช้เป็น source หลัก
      : seedArr.map((s) => ({ // ถ้าไม่มี ให้สร้าง source จาก seedArr
          id: String(s?.id || "").trim(), // id จาก seed (ตัดช่องว่าง)
          name: s.name || undefined, // name จาก seed
          image: s.image || undefined, // image จาก seed
        }));

    const map = new Map<string, Category>(); // map สุดท้ายเพื่อกัน id ซ้ำ และรวมข้อมูล name/image จาก props + seed
    for (const c of src) { // วนทุกหมวดใน source
      const idRaw = String(c?.id || "").trim(); // อ่าน id ดิบและตัดช่องว่าง
      if (!idRaw) continue; // ถ้าไม่มี id ข้าม
      const key = norm(idRaw); // ทำ key แบบ normalize
      const seed = seedMap.get(key); // หา seed เดิมของหมวดนี้ (ถ้ามี)
      const name = (c.name || seed?.name || idRaw).toString(); // name: ใช้จาก props ก่อน, ไม่มีก็ใช้จาก seed, ถ้าไม่มีอีกใช้ id แทน
      const image = (c.image || seed?.image)?.toString().trim(); // image: ใช้จาก props ก่อน, ไม่มีก็ใช้จาก seed, แล้วตัดช่องว่าง
      if (!map.has(key)) map.set(key, { id: idRaw, name, image }); // ถ้า key นี้ยังไม่เคยใส่ ให้เพิ่มเข้า map
    }

    const arr = Array.from(map.values()).filter((c) => !!(c.image && c.image.trim())); // แปลง map → array แล้วกรองเอาเฉพาะรายการที่มีรูปภาพจริง
    return typeof limit === "number" ? arr.slice(0, limit) : arr; // ถ้ามี limit ให้ตัดจำนวนตาม limit ไม่งั้นส่งกลับทั้งหมด
  }, [categories, limit]); // คำนวณใหม่เมื่อ categories หรือ limit เปลี่ยน

  return (
    <div className={`grid grid-cols-2 gap-6 ${className}`}> {/* กริด 2 คอลัมน์ เว้นช่องห่างระหว่างการ์ดหมวดหมู่ */}
      {items.map((c) => {
        const idNorm = norm(c.id); // normalize id สำหรับใช้ใน key และ URL
        return (
          <Link
            key={idNorm} // key ของ React list
            to={`/products/${encodeURIComponent(idNorm)}`} // ลิงก์ไปหน้าสินค้าตามหมวดหมู่
            title={c.name || c.id} // tooltip แสดงชื่อหมวด หรือ id ถ้าไม่มีชื่อ
            className="group rounded-xl overflow-hidden bg-white/10 backdrop-blur shadow-lg block" // สไตล์การ์ดหมวดหมู่
          >
            {c.image ? ( // ถ้ามีรูปภาพ
              <div className="relative">
                <img
                  src={c.image} // URL รูปภาพหมวดหมู่
                  alt={c.name || c.id} // alt text เพื่อ accessibility
                  className="w-full h-44 md:h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]" // รูปเต็มความกว้าง การครอปแบบ cover และ zoom เบา ๆ ตอน hover
                  loading="lazy" // ช่วยให้โหลดรูปแบบ lazy ตามที่เลื่อนมาเห็น
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none"; // ถ้าโหลดรูปไม่สำเร็จ ซ่อนรูป (ให้พื้นหลัง 'ไม่มีรูป' โชว์แทน)
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-black/0 p-3">
                  <span className="rounded-md bg-white/85 px-2 py-0.5 text-xs font-semibold text-black shadow">
                    {c.name || c.id} {/* ป้ายชื่อหมวดซ้อนทับด้านล่างของรูป */}
                  </span>
                </div>
                <div className="w-full h-44 md:h-48 hidden items-center justify-center text-white/70 bg-black/20">
                  ไม่มีรูป {/* fallback ซ่อนไว้ (จะใช้ถ้าปรับ logic บัง error image) */}
                </div>
              </div>
            ) : (
              <div className="w-full h-44 md:h-48 flex items-center justify-center text-white/70 bg-black/20">
                ไม่มีรูป {/* แสดงข้อความเมื่อหมวดหมู่ไม่มีรูปภาพเลย */}
              </div>
            )}
          </Link>
        );
      })}

      {items.length === 0 && (
        <div className="col-span-2 text-center text-sm text-white/80">ยังไม่มีหมวดหมู่ที่มีรูป</div> // ข้อความกรณีไม่พบหมวดหมู่ที่มีรูปภาพ
      )}
    </div>
  );
};

export default CategoryImageGrid; // ส่งออกคอมโพเนนต์ให้ไฟล์อื่นนำไปใช้
