// src/pages/FavoritesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";

import productsSeed from "../data/products.json";
import categoriesSeed from "../data/categorys.json";

import { type Product } from "../types/product";
import { type Category } from "../types/category";

type Props = {
  products?: Product[];     // สดจาก App (ถ้ามี)
  categories?: Category[];  // สดจาก App (ถ้ามี) ใช้ทำ label ภาษาไทย
};

const FavoritesPage: React.FC<Props> = ({ products, categories }) => {
  // ----------- เตรียมสินค้า (ใช้ props ก่อน, ไม่งั้น fallback JSON) -----------
  const allProducts: ProductCardProps[] = useMemo(() => {
    const src = (Array.isArray(products) && products.length > 0
      ? products
      : (productsSeed as any[])).filter(Boolean);

    return src.map((p: any) => ({
      id: Number(p.id),
      name: String(p.name),
      price: Number(p.price),
      category: String(p.category || ""),
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      storeLink: p.storeLink || "",
      description: p.description || "",
      authentic: !!p.authentic,
    }));
  }, [products]);

  // ----------- ทำ label ของหมวดหมู่ (ดึงจาก props.categories ก่อน) -----------
  const catLabel: Record<string, string> = useMemo(() => {
    const src = (Array.isArray(categories) && categories.length > 0
      ? categories
      : (categoriesSeed as Array<{ id?: string; name?: string }>)
    ).filter(Boolean);

    const map: Record<string, string> = {};
    for (const c of src) {
      const id = String((c as any).id ?? "").trim();
      if (!id) continue;
      const name = String((c as any).name ?? "").trim();
      if (name) map[id] = name;
    }
    return map;
  }, [categories]);

  // ----------- ผู้ใช้ & รายการโปรด -----------
  const [username, setUsername] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<number[]>([]);
  const favKey = username ? `fav:${username}` : null;

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

  // toggle favorite
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

  // เฉพาะสินค้าที่กดถูกใจ
  const favProducts = useMemo(
    () => allProducts.filter((p) => favIds.includes(p.id)),
    [allProducts, favIds]
  );

  // หมวดที่มีในรายการโปรด สำหรับ dropdown
  const favCategories = useMemo(
    () => Array.from(new Set(favProducts.map((p) => p.category))),
    [favProducts]
  );

  // เลือกหมวดในหน้า Favorites
  const [selectedCat, setSelectedCat] = useState<string>("all");

  // สินค้าตามหมวดที่เลือก
  const list = useMemo(
    () =>
      selectedCat === "all"
        ? favProducts
        : favProducts.filter((p) => p.category === selectedCat),
    [favProducts, selectedCat]
  );

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
        {/* หัวเรื่อง + Dropdown */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold text-white drop-shadow">
            รายการโปรดของฉัน
          </h1>

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
