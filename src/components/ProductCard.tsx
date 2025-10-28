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
  images,
  storeLink,
  description,
  authentic,
  isFav = false,
  onToggleFav,
}: CardProps) {
  const cover = images?.[0] ?? "";

  return (
    <div className="relative rounded-[2.5rem] bg-white/85 p-6 shadow-md ring-1 ring-black/5 h-full flex flex-col">
      {/* รูปสินค้า: อัตราส่วน 16:9 + ปุ่มลูกศรซ้อนทับ */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
        <img
          src={cover}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-black/70 shadow hover:bg-white"
          aria-label="previous"
        >
          &lt;
        </button>
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-black/70 shadow hover:bg-white"
          aria-label="next"
        >
          &gt;
        </button>
      </div>

      {/* รายละเอียด */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-extrabold tracking-wide">{name}</h3>
        <p className="text-xs">Price {price.toLocaleString()}</p>

        {/* จองพื้นที่ป้าย “แท้” ให้คงที่เสมอ */}
        <div className="h-5 mt-1">
          {authentic ? (
            <span className="text-[10px] font-semibold text-emerald-600">ของแท้</span>
          ) : (
            <span className="invisible text-[10px] font-semibold">ของแท้</span>
          )}
        </div>

        {/* คำอธิบาย (คุมความสูงเพื่อไม่ดันปุ่ม) */}
        {description && (
          <p className="mt-1 text-xs text-black/60 line-clamp-2 min-h-[32px]">
            {description}
          </p>
        )}
      </div>

      {/* แถวปุ่ม — ตรึงชิดล่างเสมอด้วย mt-auto */}
      <div className="mt-auto pt-4 flex items-center justify-center gap-3">
        {/* ❤ Favorite */}
        <button
          onClick={onToggleFav}
          aria-pressed={isFav}
          className={[
            "inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ring-1 transition",
            isFav
              ? "bg-rose-600 text-white ring-rose-600"
              : "bg-white text-rose-600 ring-rose-300 hover:bg-rose-50",
          ].join(" ")}
          title={isFav ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          ❤
        </button>

        {/* ปุ่ม/ป้าย “แท้” แสดงเฉพาะเมื่อ authentic === true
            แต่ตำแหน่งปุ่มไม่ขยับเพราะเราใช้ mt-auto ข้างบนแล้ว */}
        {authentic && (
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            แท้
          </span>
        )}

        {/* SEE MORE สีแดง */}
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
