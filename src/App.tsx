// src/App.tsx
import React, { useEffect, useMemo, useState } from "react"; // ใช้จัดการ state, memo และ side-effect
import { Routes, Route, useLocation } from "react-router-dom"; // ใช้กำหนดเส้นทางของหน้า (Routing)

import Navbar from "./components/Navbar"; // แถบนำทางด้านบน (แสดงเฉพาะหน้า user)
import HomePage from "./pages/HomePage"; // หน้า Home สำหรับผู้ใช้ทั่วไป
import ProductPage from "./pages/ProductPage"; // หน้าแสดงสินค้าตามหมวด / ทั้งหมด
import FavoritesPage from "./pages/FavoritePage"; // ✅ แก้ชื่อ import ให้ตรงกับไฟล์ FavoritesPage.tsx
import LoginPage from "./pages/LoginPage"; // หน้าเข้าสู่ระบบ
import RegisterPage from "./pages/RegisterPage"; // หน้าสมัครสมาชิก
import AdminPage from "./pages/AdminPage"; // หน้าแอดมินจัดการสินค้าและหมวดหมู่

import productsSeed from "./data/products.json"; // ข้อมูลสินค้าเริ่มต้นจากไฟล์ JSON
import categoriesSeed from "./data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON
import { type Product } from "./types/product"; // type กลางของสินค้า
import { type Category } from "./types/category"; // type กลางของหมวดหมู่
import { loadProducts, saveProducts } from "./services/storage"; // ฟังก์ชันโหลด/บันทึกสินค้าใน localStorage
import { loadCategories, saveCategories } from "./services/categoryStorage"; // ฟังก์ชันโหลด/บันทึกหมวดหมู่ใน localStorage

import "./App.css"; // สไตล์หลักของแอป

const FALLBACK_CAT_ID = "uncategorized"; // หมวดสำรอง กรณีสินค้ามี category ที่ไม่มีอยู่จริง
const SEED_FLAG_KEY = "catalog_seeded_v1"; // key ใช้เช็กว่าเคย seed ข้อมูลลง localStorage แล้วหรือยัง

function App() {
  // อ่าน path ปัจจุบันจาก react-router เพื่อตรวจว่าอยู่ใน /admin หรือไม่
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin"); // ถ้าเป็น /admin หรือ /admin/... → true

  // --------------------------------------------------
  // 1) เตรียมข้อมูล seed ของหมวดหมู่จากไฟล์ JSON
  // --------------------------------------------------
  const seedCategories: Category[] = useMemo(() => {
    // ใช้ Map เพื่อกัน id ซ้ำ และเลือก name/image ที่ดีที่สุด
    const map = new Map<string, Category>();

    (categoriesSeed as Array<{ id?: string; name?: string; image?: string }>).forEach(
      (raw) => {
        const id = (raw.id || "").trim();
        if (!id) return; // ถ้าไม่มี id ให้ข้าม

        const prev = map.get(id);
        map.set(id, {
          id,
          name: prev?.name || raw.name?.trim() || undefined,
          image: prev?.image || raw.image?.trim() || undefined,
        });
      }
    );

    // ถ้าไม่มีหมวดเลย ให้สร้างหมวดสำรองไว้ 1 อัน
    if (map.size === 0) map.set(FALLBACK_CAT_ID, { id: FALLBACK_CAT_ID });

    return Array.from(map.values()); // แปลง Map กลับเป็น array<Category>
  }, []);

  // --------------------------------------------------
  // 2) เตรียมข้อมูล seed ของสินค้า จากไฟล์ JSON
  // --------------------------------------------------
  const seedProducts: Product[] = useMemo(() => {
    return (productsSeed as any[]).map((p) => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price),
      category: p.category || FALLBACK_CAT_ID,
      storeLink: p.storeLink || "",
      description: p.description || "",
      authentic: !!p.authentic,
      images: Array.isArray(p.images)
        ? p.images
        : p.image
        ? [p.image]
        : [],
      isFavorite: !!p.isFavorite,
    }));
  }, []);

  // --------------------------------------------------
  // 3) Seed ครั้งแรก: ถ้ายังไม่เคย seed → เขียน seed ลง localStorage
  // --------------------------------------------------
  useEffect(() => {
    const seeded = localStorage.getItem(SEED_FLAG_KEY); // อ่าน flag จาก localStorage
    if (!seeded) {
      // ยังไม่เคย seed มาก่อน
      saveCategories(seedCategories); // เซฟหมวดหมู่เริ่มต้น
      saveProducts(seedProducts); // เซฟสินค้าเริ่มต้น
      localStorage.setItem(SEED_FLAG_KEY, "1"); // ตั้ง flag ว่า seed แล้ว
    }
  }, [seedCategories, seedProducts]);

  // --------------------------------------------------
  // 4) โหลดข้อมูลจาก localStorage มาเป็น state กลางของทั้งแอป
  // --------------------------------------------------
  const [categories, setCategories] = useState<Category[]>(() =>
    loadCategories(seedCategories) // ถ้า localStorage ว่าง ให้ใช้ seedCategories แทน
  );

  const [products, setProducts] = useState<Product[]>(() =>
    loadProducts(seedProducts) // ถ้า localStorage ว่าง ให้ใช้ seedProducts แทน
  );

  // --------------------------------------------------
  // 5) enrich หมวดหมู่ที่โหลดจาก LS ให้มี name/image ครบ โดยอิงจาก seed
  //    (รันครั้งเดียวตอน mount)
  // --------------------------------------------------
  useEffect(() => {
    const seedMap = new Map(
      seedCategories.map((c) => [c.id.toLowerCase(), c])
    );
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
  }, []); // ใช้ครั้งเดียวตอนเปิดแอป

  // --------------------------------------------------
  // 6) Sync: ถ้า categories เปลี่ยน → เซฟกลับ localStorage
  //    และกันกรณี categories ว่าง ให้ใส่ FALLBACK อย่างน้อย 1 ตัว
  // --------------------------------------------------
  useEffect(() => {
    if (categories.length === 0) {
      setCategories([{ id: FALLBACK_CAT_ID }]);
      return;
    }
    saveCategories(categories);
  }, [categories]);

  // --------------------------------------------------
  // 7) Sync: ถ้า products หรือ categories เปลี่ยน → ดูว่า category ของสินค้าแต่ละตัว
  //    ยังอ้างถึงหมวดที่มีอยู่จริงไหม ถ้าไม่ → ย้ายไป FALLBACK แล้วเซฟ
  // --------------------------------------------------
  useEffect(() => {
    const valid = new Set(categories.map((c) => c.id)); // set ของ id หมวดหมู่ทั้งหมด

    const fixed = products.map((p) =>
      valid.has(p.category) ? p : { ...p, category: FALLBACK_CAT_ID }
    );

    saveProducts(fixed); // บันทึกลง localStorage
  }, [products, categories]);

  // --------------------------------------------------
  // 8) เตรียมชุด props กลางที่ใช้ส่งลงไปแต่ละหน้า
  // --------------------------------------------------

  // หน้า user (Home / Product / Favorites) ต้องใช้แค่ products + categories
  const userCatalogProps = { products, categories };

  // หน้า admin ต้องใช้ทั้งข้อมูล + setter เพื่อให้แก้ไข state ได้
  const adminCatalogProps = { products, setProducts, categories, setCategories };

  // --------------------------------------------------
  // 9) ส่วนแสดงผลรวมของแอป (รวม Navbar + Routes)
  // --------------------------------------------------
  return (
    <div className="min-h-dvh w-full">
      {/* แสดง Navbar เฉพาะหน้าที่ไม่ใช่ /admin */}
      {!isAdminRoute && <Navbar />}

      {/* main ปรับความสูงตามว่ามี Navbar หรือไม่ */}
      <main
        className={
          isAdminRoute ? "min-h-dvh" : "min-h-[calc(100dvh-64px)]"
        }
      >
        <Routes>
          {/* กลุ่มเส้นทางสำหรับผู้ใช้ทั่วไป */}
          <Route path="/" element={<HomePage {...userCatalogProps} />} />
          <Route
            path="/products"
            element={<ProductPage {...userCatalogProps} />}
          />
          <Route
            path="/products/:id"
            element={<ProductPage {...userCatalogProps} />}
          />
          <Route
            path="/favorites"
            element={<FavoritesPage {...userCatalogProps} />}
          />

          {/* เส้นทางเกี่ยวกับการเข้าสู่ระบบ/สมัครสมาชิก */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* เส้นทางสำหรับแอดมินจัดการข้อมูล */}
          <Route
            path="/admin"
            element={<AdminPage {...adminCatalogProps} />}
          />
          {/* ถ้าต้องรองรับ path ย่อยเช่น /admin/xxx:
              <Route path="/admin/*" element={<AdminPage {...adminCatalogProps} />} />
          */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
