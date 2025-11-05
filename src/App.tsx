// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import FavoritesPage from "./pages/FavoritePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";

import productsSeed from "./data/products.json";
import categoriesSeed from "./data/categorys.json";
import { type Product } from "./types/product";
import { type Category } from "./types/category";
import { loadProducts, saveProducts } from "./services/storage";
import { loadCategories, saveCategories } from "./services/categoryStorage";

import "./App.css";

const FALLBACK_CAT_ID = "uncategorized";
const SEED_FLAG_KEY = "catalog_seeded_v1"; // ธงว่ามีการ seed แล้ว

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // ---------- เตรียม seed จากไฟล์ .json ----------
  const seedCategories: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    (categoriesSeed as Array<{ id?: string; name?: string; image?: string }>).forEach((raw) => {
      const id = (raw.id || "").trim();
      if (!id) return;
      const prev = map.get(id);
      map.set(id, {
        id,
        name: prev?.name || raw.name?.trim() || undefined,
        image: prev?.image || raw.image?.trim() || undefined,
      });
    });
    if (map.size === 0) map.set(FALLBACK_CAT_ID, { id: FALLBACK_CAT_ID });
    return Array.from(map.values());
  }, []);

  const seedProducts: Product[] = useMemo(() => {
    return (productsSeed as any[]).map((p) => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price),
      category: p.category || FALLBACK_CAT_ID,
      storeLink: p.storeLink || "",
      description: p.description || "",
      authentic: !!p.authentic,
      images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
      isFavorite: !!p.isFavorite,
    }));
  }, []);

  // ---------- SEED ครั้งแรก: จาก .json → localStorage ----------
  // เงื่อนไข: ถ้ายังไม่เคย seed (ไม่มี flag) จะเขียน seed ลง LS
  useEffect(() => {
    const seeded = localStorage.getItem(SEED_FLAG_KEY);
    if (!seeded) {
      saveCategories(seedCategories);
      saveProducts(seedProducts);
      localStorage.setItem(SEED_FLAG_KEY, "1");
    }
  }, [seedCategories, seedProducts]);

  // ---------- โหลดจาก localStorage เป็น state กลาง ----------
  // หมายเหตุ: load*() ใน services จะคืนค่า seed หาก LS ว่าง
  const [categories, setCategories] = useState<Category[]>(
    () => loadCategories(seedCategories)
  );
  const [products, setProducts] = useState<Product[]>(
    () => loadProducts(seedProducts)
  );

  // (ทางเลือก) enrich: ถ้าใน LS เคยมีแต่ยังไม่มี name/image ให้เติมจาก seed
  useEffect(() => {
    const seedMap = new Map(seedCategories.map((c) => [c.id.toLowerCase(), c]));
    let changed = false;
    const enriched = categories.map((c) => {
      const s = seedMap.get(c.id.toLowerCase());
      const name = c.name ?? s?.name;
      const image = c.image ?? s?.image;
      if (name !== c.name || image !== c.image) changed = true;
      return { id: c.id, name, image };
    });
    if (changed) setCategories(enriched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // enrich ครั้งเดียวพอ

  // ---------- Sync: เมื่อ categories เปลี่ยน → บันทึก LS และกันเคสว่าง ----------
  useEffect(() => {
    if (categories.length === 0) {
      setCategories([{ id: FALLBACK_CAT_ID }]);
      return;
    }
    saveCategories(categories);
  }, [categories]);

  // ---------- Sync: เมื่อ products หรือ categories เปลี่ยน → จัดการ referential & save ----------
  useEffect(() => {
    const valid = new Set(categories.map((c) => c.id));
    const fixed = products.map((p) =>
      valid.has(p.category) ? p : { ...p, category: FALLBACK_CAT_ID }
    );
    saveProducts(fixed);
  }, [products, categories]);

  // ---------- props กลางส่งลงทุกหน้า ----------
  const catalogProps = { products, setProducts, categories, setCategories };

  return (
    <div className="min-h-dvh w-full">
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "min-h-dvh" : "min-h-[calc(100dvh-64px)]"}>
        <Routes>
          {/* ผู้ใช้ */}
          <Route path="/" element={<HomePage {...catalogProps} />} />
          <Route path="/products" element={<ProductPage {...catalogProps} />} />
          <Route path="/products/:id" element={<ProductPage {...catalogProps} />} />
          <Route path="/favorites" element={<FavoritesPage {...catalogProps} />} />

          {/* auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* แอดมิน */}
          <Route path="/admin" element={<AdminPage {...catalogProps} />} />
          {/* ถ้ามีซับเพจในแอดมิน: <Route path="/admin/*" element={<AdminPage {...catalogProps} />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
