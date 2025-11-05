// src/components/CategoryImageGrid.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import seedCats from "../data/categorys.json";

type Category = { id: string; name?: string; image?: string; description?: string };

type Props = {
  categories?: Category[]; // ถ้ามี → ใช้เฉพาะ ids ในนี้
  className?: string;
  limit?: number;
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

const CategoryImageGrid: React.FC<Props> = ({ categories, className = "", limit }) => {
  const items = useMemo(() => {
    const seedArr = (seedCats as Array<{ id?: string; name?: string; image?: string }>) || [];
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

    // ถ้ามี props → สร้างรายการ "เฉพาะ ids ที่อยู่ใน props"
    const useProps = Array.isArray(categories) && categories.length > 0;
    const src: Category[] = useProps
      ? categories!
      : seedArr.map((s) => ({ id: String(s?.id || "").trim(), name: s.name || undefined, image: s.image || undefined }));

    const map = new Map<string, Category>();
    for (const c of src) {
      const idRaw = String(c?.id || "").trim();
      if (!idRaw) continue;
      const key = norm(idRaw);
      const seed = seedMap.get(key);
      const name = (c.name || seed?.name || idRaw).toString();
      const image = (c.image || seed?.image)?.toString().trim();
      if (!map.has(key)) map.set(key, { id: idRaw, name, image });
    }

    const arr = Array.from(map.values()).filter((c) => !!(c.image && c.image.trim()));
    return typeof limit === "number" ? arr.slice(0, limit) : arr;
  }, [categories, limit]);

  return (
    <div className={`grid grid-cols-2 gap-6 ${className}`}>
      {items.map((c) => {
        const idNorm = norm(c.id);
        return (
          <Link
            key={idNorm}
            to={`/products/${encodeURIComponent(idNorm)}`}
            title={c.name || c.id}
            className="group rounded-xl overflow-hidden bg-white/10 backdrop-blur shadow-lg block"
          >
            {c.image ? (
              <div className="relative">
                <img
                  src={c.image}
                  alt={c.name || c.id}
                  className="w-full h-44 md:h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-black/0 p-3">
                  <span className="rounded-md bg-white/85 px-2 py-0.5 text-xs font-semibold text-black shadow">
                    {c.name || c.id}
                  </span>
                </div>
                <div className="w-full h-44 md:h-48 hidden items-center justify-center text-white/70 bg-black/20">
                  ไม่มีรูป
                </div>
              </div>
            ) : (
              <div className="w-full h-44 md:h-48 flex items-center justify-center text-white/70 bg-black/20">
                ไม่มีรูป
              </div>
            )}
          </Link>
        );
      })}

      {items.length === 0 && (
        <div className="col-span-2 text-center text-sm text-white/80">ยังไม่มีหมวดหมู่ที่มีรูป</div>
      )}
    </div>
  );
};

export default CategoryImageGrid;
