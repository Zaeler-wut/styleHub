// src/pages/FavoritesPage.tsx
import React, { useEffect, useState } from "react";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";

export default function FavoritesPage() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);

  // โหลดสินค้า (mock data จาก public/data)
  useEffect(() => {
    fetch("/data/products.json")
      .then((r) => r.json())
      .then((rows: any[]) => {
        const list: ProductCardProps[] = rows.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
          storeLink: p.storeLink,
          description: p.description,
          authentic: p.authentic,
        }));
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, []);

  // โหลด favIds จาก localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favIds") || "[]");
      setFavIds(Array.isArray(saved) ? saved : []);
    } catch {
      setFavIds([]);
    }
  }, []);

  // บันทึก favIds เมื่อมีการเปลี่ยน
  useEffect(() => {
    localStorage.setItem("favIds", JSON.stringify(favIds));
  }, [favIds]);

  // toggle จากการ์ด
  const toggleFavorite = (id: number) => {
    setFavIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // เฉพาะที่อยู่ในรายการโปรด
  const favProducts = products.filter((p) => favIds.includes(p.id));

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
        <h1 className="mb-6 text-2xl font-extrabold text-white drop-shadow">
          รายการโปรด
        </h1>

        {favProducts.length === 0 ? (
          <div className="rounded-2xl bg-white/80 p-8 text-center text-black/70 shadow">
            ยังไม่มีสินค้าในรายการโปรด
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {favProducts.map((p) => (
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
}
