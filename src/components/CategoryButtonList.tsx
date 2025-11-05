// src/components/CategoryButtonList.tsx
import { Link } from "react-router-dom";
import Button from "./Button";
import seedCats from "../data/categorys.json";
import { type Category as Cat } from "../types/category";

type Props = {
  limit?: number;
  className?: string;
  categories?: Cat[]; // ถ้ามี → ใช้เฉพาะ ids ในนี้
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

export default function CategoryButtonList({ categories, limit, className = "" }: Props) {
  // สร้าง seed map เพื่อ "เติม" name ถ้าขาด (อย่าเพิ่ม id ใหม่)
  const seedMap = new Map<string, { id: string; name?: string }>();
  (seedCats as Array<{ id?: string; name?: string }>).forEach((c) => {
    const idRaw = String(c?.id ?? "").trim();
    if (!idRaw) return;
    const key = norm(idRaw);
    seedMap.set(key, { id: idRaw, name: (c?.name || "").trim() || undefined });
  });

  const useProps = Array.isArray(categories) && categories.length > 0;

  const src: Array<{ id?: string; name?: string }> = useProps
    ? categories! // ✅ ใช้เฉพาะ ids จาก props
    : ((seedCats as Array<{ id?: string; name?: string }>) || []); // fallback

  const map = new Map<string, { id: string; name: string }>();
  for (const item of src) {
    const idRaw = String(item?.id ?? "").trim();
    if (!idRaw) continue;
    const key = norm(idRaw);
    const seeded = seedMap.get(key);
    const name = (item?.name || "").trim() || (seeded?.name || "").trim() || idRaw;
    if (!map.has(key)) map.set(key, { id: idRaw, name });
  }

  const cats = Array.from(map.values());
  const list = typeof limit === "number" ? cats.slice(0, limit) : cats;

  return (
    <div className={`mt-6 flex flex-wrap gap-4 ${className}`}>
      {list.map((c) => (
        <Link to={`/products/${encodeURIComponent(norm(c.id))}`} key={norm(c.id)}>
          <Button
            label={c.name}
            variant="outline"
            size="lg"
            className="rounded-full border-0 bg-white shadow hover:translate-y-[1px]"
          />
        </Link>
      ))}

      {list.length === 0 && <div className="text-sm text-black/70">ไม่พบหมวดหมู่</div>}
    </div>
  );
}
