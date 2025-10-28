import { Link } from "react-router-dom";

type Props = {
  categories: string[];          // ["bags","accessories","clothesWomen","shoesWomen","clothesMen"]
  selectedKey?: string;          // "bags" | "all" | undefined (ถ้าอยู่ /product)
  className?: string;
};

const labelTH = (id: string) =>
  id === "bags" ? "กระเป๋า" :
  id === "accessories" ? "เครื่องประดับ" :
  id === "clothesWomen" ? "เสื้อผ้าผู้หญิง" :
  id === "shoesWomen" ? "รองเท้าผู้หญิง" :
  id === "clothesMen" ? "เสื้อผ้าผู้ชาย" : id;

export default function CategorySidebar({ categories, selectedKey, className = "" }: Props) {
  const current = selectedKey ?? "all";
  const ids = Array.from(new Set(categories.filter(Boolean))); // กันซ้ำ/ค่าว่าง

  return (
    <aside className={`w-full sm:w-56 rounded-[1.5rem] bg-white/85 px-5 py-6 shadow-md ring-1 ring-black/5 ${className}`}>

      <ul className="space-y-5 text-center">
        {/* ทั้งหมด = /product (ไม่มีพารามิเตอร์) */}
        <li>
          <Link
            to="/products"
            className={`inline-block text-base font-semibold ${current === "all" ? "text-rose-400" : "text-black"}`}
          >
            หมวดหมู่ทั้งหมด
          </Link>
        </li>

        {ids.map((id) => {
          const active = current === id;
          return (
            <li key={id}>
              <Link
                to={`/products/${id}`}  // ← ใช้ path param ตามที่คุณใช้จริง
                className={`inline-block text-base font-semibold ${active ? "text-rose-400" : "text-black"}`}
              >
                {labelTH(id)}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
