// src/components/ProductCard.tsx
import React, { useMemo, useState } from "react"; // ใช้ useMemo จัดรูปภาพ, useState จัด index รูป
import { FiHeart } from "react-icons/fi"; // ไอคอนหัวใจแบบกรอบ (ยังไม่ถูกใจ)
import { AiFillHeart } from "react-icons/ai"; // ไอคอนหัวใจแบบเต็ม (ถูกใจแล้ว)

export interface ProductCardProps {
  id: number; // รหัสสินค้า
  name: string; // ชื่อสินค้า
  price: number; // ราคาสินค้า
  category: string; // หมวดหมู่สินค้า
  images: string[]; // รายการ URL รูปภาพ
  storeLink?: string; // ลิงก์ไปหน้าร้าน (ภายนอก)
  description?: string; // รายละเอียดสินค้า (ข้อความสั้น ๆ)
  authentic?: boolean; // true = ของแท้
}
type CardProps = ProductCardProps & {
  isFav?: boolean; // อยู่ในรายการโปรดแล้วหรือยัง
  onToggleFav?: () => void; // ฟังก์ชันสลับสถานะ favorite
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
  // กันค่าว่าง/ซ้ำ
  const pics = useMemo( // เตรียม array รูป: เอาเฉพาะ URL ที่ไม่เป็นค่าว่าง
    () => (Array.isArray(images) ? images.filter(Boolean) : []), // ถ้าไม่ใช่ array ให้คืน []
    [images] // คำนวณใหม่เมื่อ images เปลี่ยน
  );

  const [idx, setIdx] = useState(0); // index รูปปัจจุบันที่กำลังแสดง
  const total = pics.length; // จำนวนรูปทั้งหมด
  const current = total > 0 ? pics[(idx % total + total) % total] : ""; // URL รูปปัจจุบัน (รองรับการวน loop ซ้าย/ขวา)
  const hasMany = total > 1; // มีรูปมากกว่า 1 รูปไหม

  const goPrev = () => hasMany && setIdx((i) => (i - 1 + total) % total); // ย้อนกลับรูปก่อนหน้า (ถ้ามีหลายรูป)
  const goNext = () => hasMany && setIdx((i) => (i + 1) % total); // ไปยังรูปถัดไป (ถ้ามีหลายรูป)

  // เช็คล็อกอินก่อน แล้วค่อย toggle
  const handleFavClick = () => { // เมื่อกดปุ่มหัวใจ
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null"); // ลองอ่าน user จาก localStorage
      if (!user) { // ถ้าไม่มีผู้ใช้ (ยังไม่ล็อกอิน)
        window.location.href = "/login"; // ส่งไปหน้า login ก่อน
        return;
      }
    } catch {
      window.location.href = "/login"; // ถ้า parse พลาดก็ให้ไปหน้า login เช่นกัน
      return;
    }
    onToggleFav && onToggleFav(); // ถ้าล็อกอินแล้ว และมี callback ให้เรียก toggle favorite
  };

  return (
    <div className="relative flex h-full flex-col rounded-[2.5rem] bg-white/85 p-6 shadow-md ring-1 ring-black/5">
      {/* รูปสินค้า */}
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
          <div className="absolute inset-0 grid place-items-center bg-black/5 text-xs text-black/50">
            ไม่มีรูปภาพ
          </div>
        )}

        {/* ปุ่มเลื่อนรูป (แสดงเมื่อมีหลายรูป) */}
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

            {/* dots แสดงตำแหน่งรูป */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
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

      {/* รายละเอียด */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-extrabold tracking-wide">{name}</h3> {/* ชื่อสินค้า */}
        <p className="text-xs">Price {price.toLocaleString()}</p> {/* ราคา แสดงพร้อมคอมมาแยกหลัก */}
        <div className="mt-1 h-5">
          {authentic ? (
            <span className="text-[10px] font-semibold text-emerald-600">ของแท้</span> // แสดง badge ของแท้ ถ้า authentic = true
          ) : (
            <span className="invisible text-[10px] font-semibold">ของแท้</span> // จองพื้นที่ไว้ให้ layout ไม่กระโดด
          )}
        </div>
        {description && (
          <p className="mt-1 min-h-[32px] text-xs text-black/60 line-clamp-2">
            {description} {/* คำอธิบายสินค้า ตัดให้ไม่เกิน 2 บรรทัด */}
          </p>
        )}
      </div>

      {/* ปุ่มล่าง */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        {/* ❤ ใช้ react-icons */}
        <button
          onClick={handleFavClick}
          aria-pressed={isFav}
          aria-label={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
          className={[
            "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
            isFav ? "bg-rose-50 ring-rose-300" : "bg-white ring-rose-300 hover:bg-rose-50",
          ].join(" ")}
          title={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          {isFav ? (
            <AiFillHeart className="h-5 w-5 text-rose-600" /> // แสดงหัวใจทึบเมื่ออยู่ในรายการโปรด
          ) : (
            <FiHeart className="h-5 w-5 text-rose-600" /> // แสดงหัวใจโปร่งเมื่อยังไม่ถูกใจ
          )}
        </button>

        {authentic && (
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            แท้ {/* badge เพิ่มย้ำว่าเป็นของแท้ */}
          </span>
        )}

        {storeLink ? (
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-red-600 px-4 py-1 text-xs font-semibold text-white shadow hover:bg-red-700"
          >
            VIEW STORE {/* ปุ่มเปิดลิงก์หน้าร้านในแท็บใหม่ */}
          </a>
        ) : (
          <button
            disabled
            className="rounded-full bg-red-600/50 px-4 py-1 text-xs font-semibold text-white/80"
            title="ไม่มีลิงก์ร้าน"
          >
            VIEW STORE {/* ปุ่มปิดการใช้งานเมื่อไม่มีลิงก์ร้าน */}
          </button>
        )}
      </div>
    </div>
  );
}
