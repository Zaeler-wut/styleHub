// การ์ดแสดงสินค้า 1 ชิ้นในหน้าเว็บ แสดงรูป, ชื่อ, ราคา, สถานะ “ของแท้”,
// ปุ่มเพิ่ม/ลบรายการโปรด (Favorite) และปุ่มไปยังหน้าร้าน (VIEW STORE)

import { useMemo, useState } from "react"; // useMemo ใช้จัดการรูปภาพ, useState ใช้เก็บ index รูปปัจจุบัน
import { FiHeart } from "react-icons/fi"; // ไอคอนหัวใจแบบโปร่ง (ยังไม่ได้กดถูกใจ)
import { AiFillHeart } from "react-icons/ai"; // ไอคอนหัวใจแบบทึบ (กดถูกใจแล้ว)

// ข้อมูลพื้นฐานของสินค้า 1 ชิ้น
export interface ProductCardProps {
  id: number; // รหัสสินค้า (เช่น 1, 2, 3)
  name: string; // ชื่อสินค้า
  price: number; // ราคาสินค้า (ตัวเลข)
  category: string; // หมวดหมู่สินค้า (เช่น clothes, bags)
  images: string[]; // รายการ URL ของรูปภาพสินค้า
  storeLink?: string; // ลิงก์ไปหน้าร้านภายนอก (เช่น Shopee, Lazada)
  description?: string; // คำอธิบายสินค้าแบบสั้น ๆ
  authentic?: boolean; // ถ้า true หมายถึงสินค้า “ของแท้”
}

// เพิ่ม prop ฝั่ง UI: สถานะ Favorite + ฟังก์ชันสลับ Favorite
type CardProps = ProductCardProps & {
  isFav?: boolean; // เป็นสินค้าที่อยู่ในรายการโปรดแล้วหรือยัง
  onToggleFav?: () => void; // ฟังก์ชันเรียกตอนผู้ใช้กดปุ่มหัวใจ
};

export default function ProductCard({
  name,
  price,
  images = [],
  storeLink,
  description,
  authentic,
  isFav = false,
  onToggleFav,
}: CardProps) {
  // เตรียมรายการรูปภาพ:
  // รับจาก props.images
  // กรองค่า falsy (เช่น "", null) ทิ้ง
  // ถ้าไม่ได้ส่งมาเป็น array ให้ได้ [] แทน
  const pics = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  // idx คือ index ของรูปที่กำลังแสดงอยู่ในปัจจุบัน
  const [idx, setIdx] = useState(0);
  const total = pics.length;

  // current คือ URL ของรูปปัจจุบันที่ใช้แสดง
  // ใช้สูตร (idx % total + total) % total เพื่อรองรับการวนลูปซ้าย/ขวาโดยไม่หลุดขอบ
  const current = total > 0 ? pics[(idx % total + total) % total] : "";

  // ถ้ามีรูปมากกว่า 1 รูปเราจะให้แสดงปุ่มเลื่อนซ้าย–ขวา
  const hasMany = total > 1;

  // ฟังก์ชันเลื่อนไปยังรูปก่อนหน้า
  const goPrev = () => hasMany && setIdx((i) => (i - 1 + total) % total);

  // ฟังก์ชันเลื่อนไปยังรูปถัดไป
  const goNext = () => hasMany && setIdx((i) => (i + 1) % total);

  // จัดการคลิกหัวใจ:
  // เช็คว่ามี user ใน localStorage หรือไม่ (ต้องล็อกอินก่อน)
  // ถ้ายังไม่ล็อกอิน ส่งไปหน้า /login
  // ถ้าล็อกอินแล้ว เรียก onToggleFav เพื่อสลับสถานะรายการโปรด
  const handleFavClick = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        window.location.href = "/login";
        return;
      }
    } catch {
      window.location.href = "/login";
      return;
    }
    onToggleFav && onToggleFav();
  };

  return (
    // การ์ดหลักของสินค้า:
    // ใช้ flex-col เพื่อจัด layout จากบนลงล่าง รูป  รายละเอียด ปุ่ม
    // rounded, shadow, ring เพื่อให้ดูเป็นการ์ดลอยขึ้นจากพื้นหลัง
    <div className="relative flex h-full flex-col rounded-[2.5rem] bg-white/85 p-6 shadow-md ring-1 ring-black/5">
      {/* ส่วนรูปสินค้า */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        {current ? (
          <img
            src={current}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity"
            loading="lazy"
            draggable={false}
          />
        ) : (
          // กรณีไม่มีรูปเลย จะแสดงข้อความ “ไม่มีรูปภาพ” แทน
          <div className="absolute inset-0 grid place-items-center bg-black/5 text-xs text-black/50">
            ไม่มีรูปภาพ
          </div>
        )}

        {/* ปุ่มเลื่อนรูป (แสดงเฉพาะเมื่อมีรูปหลายรูป) */}
        {hasMany && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="รูปก่อนหน้า"
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-black/70 shadow hover:bg-white"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="รูปถัดไป"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-black/70 shadow hover:bg-white"
            >
              &gt;
            </button>

            {/* จุด dots แสดงตำแหน่งรูปปัจจุบันด้านล่างรูปภาพ */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {pics.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 w-1.5 rounded-full ring-1 ring-black/20",
                    i === idx ? "bg-white" : "bg-black/30",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ส่วนรายละเอียดสินค้า: ชื่อ / ราคา / badge ของแท้ / คำอธิบาย */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-extrabold tracking-wide">{name}</h3>
        <p className="text-xs">
          Price {price.toLocaleString()}
        </p>

        {/* แสดง badge “ของแท้” ถ้า authentic = true
            ถ้าไม่ใช่ของแท้ให้แสดง span แบบ invisible เพื่อไม่ให้ layout สั่น */}
        <div className="mt-1 h-5">
          {authentic ? (
            <span className="text-[10px] font-semibold text-emerald-600">
              ของแท้
            </span>
          ) : (
            <span className="invisible text-[10px] font-semibold">
              ของแท้
            </span>
          )}
        </div>

        {/* แสดงคำอธิบายสินค้า ถ้ามี จำกัดความสูงโดยใช้ line-clamp-2 */}
        {description && (
          <p className="mt-1 min-h-[32px] text-xs text-black/60 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* ส่วนปุ่มด้านล่าง: หัวใจ Favorite badge แท้ ปุ่ม VIEW STORE */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        {/* ปุ่มหัวใจ Favorite */}
        <button
          onClick={handleFavClick}
          aria-pressed={isFav}
          aria-label={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          className={[
            "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
            isFav
              ? "bg-rose-50 ring-rose-300"
              : "bg-white ring-rose-300 hover:bg-rose-50",
          ].join(" ")}
          title={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          {isFav ? (
            <AiFillHeart className="h-5 w-5 text-rose-600" />
          ) : (
            <FiHeart className="h-5 w-5 text-rose-600" />
          )}
        </button>

        {/* badge “แท้” เพิ่มเติม (โชว์เฉพาะสินค้าที่ authentic) */}
        {authentic && (
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            แท้
          </span>
        )}

        {/* ปุ่มไปหน้าร้านภายนอก:
            ถ้ามี storeLink ใช้ <a> เปิดแท็บใหม่
            ถ้าไม่มี แสดงปุ่ม disabled พร้อม tooltip ว่าไม่มีลิงก์ร้าน */}
        {storeLink ? (
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-red-600 px-4 py-1 text-xs font-semibold text-white shadow hover:bg-red-700"
          >
            VIEW STORE
          </a>
        ) : (
          <button
            disabled
            className="rounded-full bg-red-600/50 px-4 py-1 text-xs font-semibold text-white/80"
            title="ไม่มีลิงก์ร้าน"
          >
            VIEW STORE
          </button>
        )}
      </div>
    </div>
  );
}
