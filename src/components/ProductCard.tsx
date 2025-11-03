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

  // ✅ ถ้ายังไม่ได้ล็อกอิน → เด้งไป /login, ถ้าล็อกอินแล้วค่อย toggle
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
    <div className="relative rounded-[2.5rem] bg-white/85 p-6 shadow-md ring-1 ring-black/5 h-full flex flex-col">
      {/* รูปสินค้า: อัตราส่วน 4:3 + ปุ่มลูกศรซ้อนทับ */}
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

        {/* คำอธิบาย */}
        {description && (
          <p className="mt-1 text-xs text-black/60 line-clamp-2 min-h-[32px]">
            {description}
          </p>
        )}
      </div>

      {/* ปุ่มล่าง (ตรึงชิดล่าง) */}
      <div className="mt-auto pt-4 flex items-center justify-center gap-3">
        {/* ❤ Favorite — หัวใจกลวง/ทึบ + ตรวจล็อกอินก่อน */}
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

        {/* ป้าย “แท้” (แสดงเมื่อ authentic=true) */}
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
