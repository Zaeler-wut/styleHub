import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategorySidebar from "../components/CategorySidebar";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";
import productsData from "../data/products.json";
import rawCategories from "../data/categorys.json";

const ProductPage: React.FC = () => {
  const { id: selectedKey } = useParams(); // "bags" | "accessories" | ... | undefined

  // 1) สินค้าจาก mock (import JSON)
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

  // 2) หมวดหมู่จากไฟล์ (string[])
  const categories = Array.from(
    new Set((rawCategories as Array<{ id?: string }>).map((r) => r.id).filter(Boolean))
  ) as string[];

  // 3) ผู้ใช้ปัจจุบัน + รายการโปรดต่อผู้ใช้
  const [username, setUsername] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<number[]>([]);
  const favKey = username ? `fav:${username}` : null;

  useEffect(() => {
    // โหลด session user
    try {
      const s = JSON.parse(localStorage.getItem("user") || "null");
      setUsername(s?.name ?? null);
    } catch {
      setUsername(null);
    }
  }, []);

  useEffect(() => {
    // โหลดรายการโปรดของ user นี้
    if (!favKey) {
      setFavIds([]);
      return;
    }
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]");
      setFavIds(Array.isArray(raw) ? raw : []);
    } catch {
      setFavIds([]);
    }
  }, [favKey]);

  // 4) กรองสินค้า: ถ้าไม่มีพารามิเตอร์ (= /product) ให้แสดงทั้งหมด
  const list = !selectedKey ? products : products.filter((p) => p.category === selectedKey);

  // 5) สลับสถานะรายการโปรด (ต่อ user)
  const toggleFavorite = (id: number) => {
    // เผื่อกรณีผู้ใช้ยังไม่ล็อกอินแล้วมาถึงฟังก์ชันนี้ (ปกติการ์ดจะ redirect ให้แล้ว)
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

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]">
        <CategorySidebar categories={categories} selectedKey={selectedKey} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              isFav={favIds.includes(p.id)}            // ← ทำหัวใจทึบ/กลวง
              onToggleFav={() => toggleFavorite(p.id)} // ← อัปเดต fav ต่อ user
            />
          ))}

          {list.length === 0 && (
            <div className="col-span-full rounded-2xl bg-white/70 p-8 text-center text-black/70 shadow">
              ไม่มีสินค้าในหมวดนี้
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
