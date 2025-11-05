// src/pages/ProductPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CategorySidebar from "../components/CategorySidebar";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";

import productsSeed from "../data/products.json";
import categoriesSeed from "../data/categorys.json";

import { type Product } from "../types/product";
import { type Category } from "../types/category";
import { loadProducts } from "../services/storage";
import { loadCategories } from "../services/categoryStorage";

type Props = {
  products?: Product[];     // ถ้า App ส่ง state กลางมาก็ใช้เลย
  categories?: Category[];  // ถ้า App ส่ง state กลางมาก็ใช้เลย
};

const norm = (s?: string) => (s ?? "").trim().toLowerCase();

const ProductPage: React.FC<Props> = ({ products, categories }) => {
  const { id: selectedKeyRaw } = useParams<{ id?: string }>();
  const selectedKey = norm(selectedKeyRaw);

  // ---------- หมวดหมู่: props > LS > JSON (ไม่รวม/ไม่ union) ----------
  const catObjects: Array<{ id: string; name?: string }> = useMemo(() => {
    // 1) props มาก่อน
    if (Array.isArray(categories) && categories.length > 0) {
      const map = new Map<string, { id: string; name?: string }>();
      for (const c of categories) {
        const id = norm(c.id);
        if (!id) continue;
        const name = (c.name || "").trim() || c.id;
        if (!map.has(id)) map.set(id, { id, name });
      }
      return Array.from(map.values());
    }

    // 2) localStorage
    const ls = loadCategories(
      (categoriesSeed as Array<{ id?: string; name?: string }>)
        .filter(Boolean)
        .map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim() || undefined,
        }))
    );
    if (ls.length > 0) {
      const map = new Map<string, { id: string; name?: string }>();
      for (const c of ls) {
        const id = norm(c.id);
        if (!id) continue;
        const name = (c.name || "").trim() || c.id;
        if (!map.has(id)) map.set(id, { id, name });
      }
      return Array.from(map.values());
    }

    // 3) JSON fallback
    const map = new Map<string, { id: string; name?: string }>();
    for (const c of (categoriesSeed as Array<{ id?: string; name?: string }>)) {
      const id = norm(String(c?.id || ""));
      if (!id) continue;
      const name = (c?.name || "").trim() || c.id!;
      if (!map.has(id)) map.set(id, { id, name });
    }
    return Array.from(map.values());
  }, [categories]);

  // ---------- สินค้า: props > LS > JSON (ไม่รวม/ไม่ union) ----------
  const allProducts: ProductCardProps[] = useMemo(() => {
    const toCard = (arr: any[]): ProductCardProps[] =>
      arr
        .filter(Boolean)
        .map((p: any) => ({
          id: Number(p.id),
          name: String(p.name),
          price: Number(p.price),
          category: norm(String(p.category || "")),
          images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
          storeLink: p.storeLink || "",
          description: p.description || "",
          authentic: !!p.authentic,
        }))
        .filter((p) => !!p.id);

    // 1) props มาก่อน
    if (Array.isArray(products) && products.length > 0) {
      return toCard(products as any[]);
    }

    // 2) localStorage
    const ls = loadProducts(
      (productsSeed as any[]).map((p) => ({
        id: Number(p.id),
        name: String(p.name),
        price: Number(p.price),
        category: String(p.category || ""),
        storeLink: p.storeLink || "",
        description: p.description || "",
        authentic: !!p.authentic,
        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
        isFavorite: !!p.isFavorite,
      }))
    );
    if (ls.length > 0) return toCard(ls as any[]);

    // 3) JSON fallback
    return toCard(productsSeed as any[]);
  }, [products]);

  // ---------- ผู้ใช้ & รายการโปรด ----------
  const [username, setUsername] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<number[]>([]);
  const favKey = username ? `fav:${username}` : null;

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("user") || "null");
      setUsername(s?.name ?? null);
    } catch {
      setUsername(null);
    }
  }, []);

  useEffect(() => {
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

  // ---------- กรองตามหมวด ----------
  const list = useMemo(() => {
    if (!selectedKey) return allProducts; // /products => แสดงทั้งหมด
    return allProducts.filter((p) => p.category === selectedKey);
  }, [allProducts, selectedKey]);

  // ---------- toggle favorite ต่อ user ----------
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

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]">
        {/* ส่ง {id,name} จากโซ่ fallback เดียวกัน → ตรงกับ admin เสมอ */}
        <CategorySidebar categories={catObjects} selectedKey={selectedKeyRaw} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              isFav={favIds.includes(p.id)}
              onToggleFav={() => toggleFavorite(p.id)}
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
