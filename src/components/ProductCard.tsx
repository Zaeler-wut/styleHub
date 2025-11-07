import React, { useMemo, useState } from "react";

export interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  storeLink?: string;
  description?: string;
  authentic?: boolean;
}
type CardProps = ProductCardProps & {
  isFav?: boolean;
  onToggleFav?: () => void;
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
  // ป้องกันค่าว่าง/ซ้ำ/ช่องว่าง
  const pics = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [idx, setIdx] = useState(0);
  const total = pics.length;
  const current = total > 0 ? pics[(idx % total + total) % total] : "";

  const hasMany = total > 1;
  const goPrev = () => hasMany && setIdx((i) => (i - 1 + total) % total);
  const goNext = () => hasMany && setIdx((i) => (i + 1) % total);

  // เช็คล็อกอินก่อน แล้วค่อย toggle
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

        {/* ปุ่มเลื่อนรูป แสดงต่อเมื่อมีหลายรูป */}
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

            {/* ตัวบอกตำแหน่ง (dots) */}
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
        <h3 className="text-sm font-extrabold tracking-wide">{name}</h3>
        <p className="text-xs">Price {price.toLocaleString()}</p>
        <div className="mt-1 h-5">
          {authentic ? (
            <span className="text-[10px] font-semibold text-emerald-600">ของแท้</span>
          ) : (
            <span className="invisible text-[10px] font-semibold">ของแท้</span>
          )}
        </div>
        {description && (
          <p className="mt-1 min-h-[32px] text-xs text-black/60 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* ปุ่มล่าง */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        <button
          onClick={handleFavClick}
          aria-pressed={isFav}
          className={[
            "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
            isFav ? "bg-rose-50 ring-rose-300" : "bg-white ring-rose-300 hover:bg-rose-50",
          ].join(" ")}
          title={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${
              isFav ? "fill-rose-600 stroke-rose-600" : "fill-none stroke-rose-600"
            }`}
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M12 21s-6.7-4.35-9.33-7.5C.83 11.38 1.26 8.5 3.3 6.9c1.75-1.39 4.34-1.16 5.7.3L12 10.5l3-3.3c1.36-1.46 3.95-1.69 5.7-.3 2.04 1.6 2.47 4.48.63 7.1C18.7 16.65 12 21 12 21z" />
          </svg>
        </button>

        {authentic && (
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            แท้
          </span>
        )}

        {storeLink ? (
          <a
            href={storeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-red-600 px-4 py-1 text-xs font-semibold text-white shadow hover:bg-red-700"
          >
            SEE MORE
          </a>
        ) : (
          <button
            disabled
            className="rounded-full bg-red-600/50 px-4 py-1 text-xs font-semibold text-white/80"
            title="ไม่มีลิงก์ร้าน"
          >
            SEE MORE
          </button>
        )}
      </div>
    </div>
  );
}