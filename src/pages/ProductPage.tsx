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
  products?: Product[];
  categories?: Category[];
};

/** normalize ไทย + ลบวรรณยุกต์/อักขระล่องหน/วรรคตอน แล้ว trim */
const stripMarks = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "");
const stripInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, "");
const stripPunct = (s: string) => s.replace(/[^\p{L}\p{N}\s]/gu, "");
const sNorm = (s?: string) =>
  stripPunct(stripInvisible(stripMarks((s ?? "").toLowerCase()))).replace(/\s+/g, " ").trim();

const ProductPage: React.FC<Props> = ({ products, categories }) => {
  const { id: selectedKeyRaw } = useParams<{ id?: string }>();
  const selectedKey = sNorm(selectedKeyRaw);

  // ---------- หมวดหมู่: props > LS > JSON ----------
  const catObjects: Array<{ id: string; name?: string }> = useMemo(() => {
    const buildMap = (arr: Array<{ id?: string; name?: string }>) => {
      const map = new Map<string, { id: string; name?: string }>();
      for (const c of arr || []) {
        const id = sNorm(String(c?.id || ""));
        if (!id) continue;
        const name = (c?.name || "").trim() || c?.id || id;
        if (!map.has(id)) map.set(id, { id, name });
      }
      return Array.from(map.values());
    };

    if (Array.isArray(categories) && categories.length > 0) {
      return buildMap(categories as any);
    }

    const ls = loadCategories(
      (categoriesSeed as any[]).map((c) => ({
        id: String(c?.id || "").trim(),
        name: String(c?.name || "").trim() || undefined,
      }))
    );
    if (ls.length > 0) return buildMap(ls as any);

    return buildMap(categoriesSeed as any[]);
  }, [categories]);

  // ---------- สินค้า: props > LS > JSON ----------
  const allProducts: ProductCardProps[] = useMemo(() => {
    const toCard = (arr: any[]): ProductCardProps[] =>
      arr
        .filter(Boolean)
        .map((p: any) => ({
          id: Number(p.id),
          name: String(p.name ?? ""),
          price: Number(p.price ?? 0),
          category: sNorm(String(p.category || "")),
          images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
          storeLink: p.storeLink || "",
          description: p.description || "",
          authentic: !!p.authentic,
        }))
        .filter((p) => !!p.id);

    if (Array.isArray(products) && products.length > 0) {
      return toCard(products as any[]);
    }

    const ls = loadProducts(
      (productsSeed as any[]).map((p) => ({
        id: Number(p.id),
        name: String(p.name ?? ""),
        price: Number(p.price ?? 0),
        category: String(p.category || ""),
        storeLink: p.storeLink || "",
        description: p.description || "",
        authentic: !!p.authentic,
        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
        isFavorite: !!p.isFavorite,
      }))
    );
    if (ls.length > 0) return toCard(ls as any[]);

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

  // ---------- ค้นหาเฉพาะ "ชื่อสินค้า" ----------
  const [q, setQ] = useState("");

  // ---------- กรองตามหมวด + ค้นหาเฉพาะชื่อ ----------
  const list = useMemo(() => {
    const base = !selectedKey
      ? allProducts
      : allProducts.filter((p) => p.category === selectedKey);

    const qq = sNorm(q);
    if (!qq) return base;

    const tokens = qq.split(/\s+/).filter(Boolean); // AND search
    return base.filter((p) => {
      const nameNorm = sNorm(p.name);
      return tokens.every((tk) => nameNorm.includes(tk));
    });
  }, [allProducts, selectedKey, q]);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]">
        {/* Sidebar หมวดหมู่ */}
        <CategorySidebar categories={catObjects} selectedKey={selectedKeyRaw} />

        <div className="flex flex-col gap-4">
          {/* ช่องค้นหาแบบ “ยาวเต็มแถว” */}
          <div className="rounded-xl bg-white/90 p-3 shadow ring-1 ring-black/10">
            <input
              aria-label="ค้นหาชื่อสินค้า"
              placeholder="ค้นหาชื่อสินค้า (เช่น รองเท้า, bag, watch...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          {/* สินค้า */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                isFav={favIds.includes(p.id)}
                onToggleFav={() => {
                  if (!favKey) {
                    window.location.href = "/login";
                    return;
                  }
                  setFavIds((prev) => {
                    const next = prev.includes(p.id)
                      ? prev.filter((x) => x !== p.id)
                      : [...prev, p.id];
                    localStorage.setItem(favKey, JSON.stringify(next));
                    return next;
                  });
                }}
              />
            ))}

            {list.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white/70 p-8 text-center text-black/70 shadow">
                ไม่พบ “{q.trim()}” ในชื่อสินค้า
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage;