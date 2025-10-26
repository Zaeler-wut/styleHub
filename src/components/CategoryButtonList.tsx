// src/components/CategoryButtonList.tsx
import { Link } from "react-router-dom";
import Button from "./Button";
import rawCats from "../data/categorys.json"; // ✅ import จาก src

type Category = { id: string; name: string };

interface Props {
  limit?: number;
  className?: string;
}

export default function CategoryButtonList({ limit, className = "" }: Props) {
  const cats = (rawCats as Category[]).filter(Boolean);
  const list = typeof limit === "number" ? cats.slice(0, limit) : cats;

  return (
    <div className={`mt-6 flex flex-wrap gap-4 ${className}`}>
      {list.map((c) => (
        <Link to={`/category/${encodeURIComponent(c.id)}`} key={c.id}>
          <Button
            label={c.name}
            variant="outline"
            size="lg"
            className="rounded-full border-0 bg-white shadow hover:translate-y-[1px]"
          />
        </Link>
      ))}

      {list.length === 0 && (
        <div className="text-sm text-black/70">ไม่พบหมวดหมู่</div>
      )}
    </div>
  );
}
