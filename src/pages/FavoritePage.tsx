import React, { useEffect, useState } from "react";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";
import productsData from "../data/products.json";

const catLabel: Record<string, string> = {
  bags: "กระเป๋า",
  accessories: "เครื่องประดับ",
  clothesWomen: "เสื้อผ้าผู้หญิง",
  shoesWomen: "รองเท้าผู้หญิง",
  clothesMen: "เสื้อผ้าผู้ชาย",
};

const FavoritesPage: React.FC = () => {
  // 1) โหลดสินค้าจาก mock (import JSON)
  const products: ProductCardProps[] = (productsData as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
    storeLink: p.storeLink,
    description: p.description,
    authentic: p.authentic,
  }));

  // 2) ผู้ใช้ปัจจุบัน + รายการโปรดต่อผู้ใช้
  const [username, setUsername] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<number[]>([]);
  const favKey = username ? `fav:${username}` : null;

  // 3) หมวดที่เลือกในหน้า Favorites (ใช้ dropdown เฉพาะภายในหน้านี้)
  const [selectedCat, setSelectedCat] = useState<string>("all");

  // guard login + load username
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || !u.name) {
        window.location.href = "/login";
        return;
      }
      setUsername(u.name);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // load favIds ของ user
  useEffect(() => {
    if (!favKey) return;
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]");
      setFavIds(Array.isArray(raw) ? raw : []);
    } catch {
      setFavIds([]);
    }
  }, [favKey]);

  // toggle รายการโปรด (ต่อ user)
  const toggleFavorite = (id: number) => {
    if (!favKey) {
      window.location.href = "/login";
      return;
    }
    setFavIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(favKey, JSON.stringify(next));
      return next;
    });
  };

  // เฉพาะสินค้าที่ user กดถูกใจ
  const favProducts = products.filter((p) => favIds.includes(p.id));

  // หมวดที่มีอยู่จริงในรายการโปรด → สำหรับ dropdown
  const favCategories = Array.from(new Set(favProducts.map((p) => p.category)));

  // รายการที่ถูกกรองตาม dropdown
  const list =
    selectedCat === "all"
      ? favProducts
      : favProducts.filter((p) => p.category === selectedCat);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
        {/* หัวเรื่อง + Dropdown */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold text-white drop-shadow">
            รายการโปรดของฉัน
          </h1>

          {/* dropdown เลือกหมวด */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-white/90">หมวดหมู่</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow ring-1 ring-black/10 focus:outline-none"
            >
              <option value="all">ทั้งหมด</option>
              {favCategories.map((id) => (
                <option key={id} value={id}>
                  {catLabel[id] || id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid รายการโปรด */}
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white/80 p-8 text-center text-black/70 shadow">
            {favProducts.length === 0
              ? "ยังไม่มีสินค้าในรายการโปรด"
              : "ไม่มีสินค้าในหมวดนี้"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                isFav={true}
                onToggleFav={() => toggleFavorite(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage;
