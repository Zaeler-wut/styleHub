// src/App.tsx
import React, { useEffect, useMemo, useState } from "react"; // นำเข้า React hooks ที่ต้องใช้
import { Routes, Route, useLocation } from "react-router-dom"; // นำเข้าคอมโพเนนต์และ hook สำหรับ routing

import Navbar from "./components/Navbar"; // แถบนำทางด้านบนของหน้า
import HomePage from "./pages/HomePage"; // หน้าแรกสำหรับผู้ใช้ทั่วไป
import ProductPage from "./pages/ProductPage"; // หน้าแสดงรายการ/รายละเอียดสินค้า
import FavoritesPage from "./pages/FavoritePage"; // หน้าแสดงสินค้าที่ถูกใจ
import LoginPage from "./pages/LoginPage"; // หน้าเข้าสู่ระบบ
import RegisterPage from "./pages/RegisterPage"; // หน้าสมัครสมาชิก
import AdminPage from "./pages/AdminPage"; // หน้าแอดมินจัดการสินค้า/หมวดหมู่

import productsSeed from "./data/products.json"; // ข้อมูลสินค้าเริ่มต้นจากไฟล์ JSON
import categoriesSeed from "./data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON
import { type Product } from "./types/product"; // type ของสินค้า
import { type Category } from "./types/category"; // type ของหมวดหมู่
import { loadProducts, saveProducts } from "./services/storage"; // ฟังก์ชันโหลด/บันทึกสินค้าใน localStorage
import { loadCategories, saveCategories } from "./services/categoryStorage"; // ฟังก์ชันโหลด/บันทึกหมวดหมู่ใน localStorage

import "./App.css"; // นำเข้า stylesheet หลักของแอป

const FALLBACK_CAT_ID = "uncategorized"; // id หมวดหมู่สำรองใช้เมื่ออ้างอิง category ที่ไม่มีอยู่
const SEED_FLAG_KEY = "catalog_seeded_v1"; // key ใน localStorage ไว้เช็คว่าเคย seed ข้อมูลแล้วหรือยัง

function App() { // คอมโพเนนต์หลักของแอปพลิเคชัน
  const location = useLocation(); // ใช้ hook เพื่อตรวจ path ปัจจุบันจาก react-router
  const isAdminRoute = location.pathname.startsWith("/admin"); // เช็คว่าตอนนี้อยู่ใน route ของ admin หรือไม่

  // ---------- เตรียม seed จากไฟล์ .json ----------
  const seedCategories: Category[] = useMemo(() => { // ใช้ useMemo สร้างรายการหมวดหมู่จาก JSON เพียงครั้งเดียว
    const map = new Map<string, Category>(); // ใช้ Map เพื่อรวมหมวดหมู่ตาม id และกันซ้ำ
    (categoriesSeed as Array<{ id?: string; name?: string; image?: string }>).forEach((raw) => { // loop ข้อมูลหมวดหมู่ดิบจากไฟล์ JSON
      const id = (raw.id || "").trim(); // ดึง id ออกมาและตัดช่องว่าง
      if (!id) return; // ถ้าไม่มี id ให้ข้าม
      const prev = map.get(id); // ดูว่ามีหมวดหมู่ id นี้อยู่ใน map แล้วหรือยัง
      map.set(id, { // บันทึก/อัปเดตหมวดหมู่ลงใน map
        id, // กำหนด id ให้ category
        name: prev?.name || raw.name?.trim() || undefined, // ถ้ามี name เดิมใช้ก่อน ไม่มีก็ใช้จาก raw
        image: prev?.image || raw.image?.trim() || undefined, // ถ้ามี image เดิมใช้ก่อน ไม่มีก็ใช้จาก raw
      });
    });

    if (map.size === 0) map.set(FALLBACK_CAT_ID, { id: FALLBACK_CAT_ID }); // ถ้าไม่มีหมวดหมู่เลย ให้สร้างหมวดสำรองขึ้นมา 1 ตัว
    return Array.from(map.values()); // แปลง Map กลับเป็น Array<Category> เพื่อใช้งานต่อ
  }, []); // dependency ว่าง แปลว่าให้คำนวณครั้งเดียวตอน mount

  const seedProducts: Product[] = useMemo(() => { // เตรียมรายการสินค้า seed จากไฟล์ JSON
    return (productsSeed as any[]).map((p) => ({ // map แต่ละสินค้าในไฟล์ JSON เป็น object Product
      id: Number(p.id), // แปลง id ให้เป็นตัวเลข
      name: p.name, // ชื่อสินค้า
      price: Number(p.price), // ราคาแปลงเป็น number
      category: p.category || FALLBACK_CAT_ID, // ถ้าไม่มี category ให้ใช้หมวดสำรอง
      storeLink: p.storeLink || "", // ลิงก์ไปยังหน้าร้าน ถ้าไม่มีให้เป็นสตริงว่าง
      description: p.description || "", // รายละเอียดสินค้า ถ้าไม่มีให้เป็นสตริงว่าง
      authentic: !!p.authentic, // แปลงค่าเป็น boolean ว่าสินค้าของแท้หรือไม่
      images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [], // ถ้า images เป็น array ใช้เลย ถ้ามี image เดี่ยวให้ห่อเป็น array
      isFavorite: !!p.isFavorite, // สถานะถูกใจสินค้า (รายการโปรด)
    }));
  }, []); // ใช้ useMemo เช่นกันให้สร้าง seed ครั้งเดียว

  // ---------- SEED ครั้งแรก: จาก .json → localStorage ----------
  // เงื่อนไข: ถ้ายังไม่เคย seed (ไม่มี flag) จะเขียน seed ลง LS
  useEffect(() => { // ใช้ effect ทำงานเมื่อ component mount
    const seeded = localStorage.getItem(SEED_FLAG_KEY); // อ่านค่า flag จาก localStorage ว่าเคย seed แล้วหรือยัง
    if (!seeded) { // ถ้ายังไม่เคย seed
      saveCategories(seedCategories); // บันทึกหมวดหมู่เริ่มต้นลง localStorage
      saveProducts(seedProducts); // บันทึกสินค้าเริ่มต้นลง localStorage
      localStorage.setItem(SEED_FLAG_KEY, "1"); // ตั้ง flag ไว้ว่า seed แล้ว
    }
  }, [seedCategories, seedProducts]); // ถ้า seedCategories หรือ seedProducts เปลี่ยนจะรัน effect ใหม่ (ปกติไม่เปลี่ยน)

  // ---------- โหลดจาก localStorage เป็น state กลาง ----------
  // หมายเหตุ: load*() ใน services จะคืนค่า seed หาก LS ว่าง
  const [categories, setCategories] = useState<Category[]>( // state สำหรับเก็บหมวดหมู่ทั้งหมด
    () => loadCategories(seedCategories) // lazy init: โหลดจาก localStorage ถ้าไม่มีใช้ seedCategories
  ); // ปิด useState ของ categories
  const [products, setProducts] = useState<Product[]>( // state สำหรับเก็บรายการสินค้าทั้งหมด
    () => loadProducts(seedProducts) // lazy init: โหลดจาก localStorage ถ้าไม่มีใช้ seedProducts
  );

  // (ทางเลือก) enrich: ถ้าใน LS เคยมีแต่ยังไม่มี name/image ให้เติมจาก seed
  useEffect(() => { // effect สำหรับ enrich ข้อมูลหมวดหมู่ที่ขาด name หรือ image
    const seedMap = new Map(seedCategories.map((c) => [c.id.toLowerCase(), c])); // สร้าง map จาก seedCategories โดย normalize id เป็นตัวพิมพ์เล็ก
    let changed = false; // ตัวแปรไว้เช็คว่ามีการเปลี่ยนข้อมูลหรือไม่

    const enriched = categories.map((c) => { // วน loop หมวดหมู่ที่โหลดมาใน state
      const s = seedMap.get(c.id.toLowerCase()); // หาหมวดใน seed ที่ id ตรงกัน
      const name = c.name ?? s?.name; // ถ้าใน state ไม่มี name ให้ใช้ชื่อจาก seed
      const image = c.image ?? s?.image; // ถ้าใน state ไม่มี image ให้ใช้จาก seed
      if (name !== c.name || image !== c.image) changed = true; // ถ้ามีอย่างใดอย่างหนึ่งเปลี่ยน แสดงว่าต้องอัปเดต
      return { id: c.id, name, image }; // คืนค่าหมวดหมู่ที่เติมข้อมูลครบแล้ว
    });

    if (changed) setCategories(enriched); // ถ้ามีการเปลี่ยนจริง ค่อยอัปเดต state categories
    // eslint-disable-next-line react-hooks/exhaustive-deps // ปิดคำเตือนของ ESLint ให้รัน effect นี้ครั้งเดียว
  }, []); // enrich ครั้งเดียวพอตอน mount

  // ---------- Sync: เมื่อ categories เปลี่ยน → บันทึก LS และกันเคสว่าง ----------
  useEffect(() => { // effect สำหรับ sync categories กับ localStorage
    if (categories.length === 0) { // ถ้าตอนนี้ไม่มีหมวดหมู่เลย
      setCategories([{ id: FALLBACK_CAT_ID }]); // ตั้งค่าหมวดสำรองกลับเข้าไปอย่างน้อย 1 ตัว
      return; // ออกจาก effect ไม่ต้อง save ต่อ
    }
    saveCategories(categories); // บันทึกหมวดหมู่ล่าสุดลง localStorage
  }, [categories]); // รัน effect เมื่อ categories เปลี่ยน

  // ---------- Sync: เมื่อ products หรือ categories เปลี่ยน → จัดการ referential & save ----------
  useEffect(() => { // effect ใช้จัดการความสัมพันธ์สินค้าและหมวดหมู่ แล้ว save ลง localStorage
    const valid = new Set(categories.map((c) => c.id)); // สร้าง Set ของ id หมวดหมู่ที่มีอยู่จริง
    const fixed = products.map((p) => // วนสินค้าทุกรายการเพื่อตรวจสอบ category
      valid.has(p.category) ? p : { ...p, category: FALLBACK_CAT_ID } // ถ้า category ไม่อยู่ใน valid ให้เปลี่ยนเป็น FALLBACK
    );
    saveProducts(fixed); // บันทึกรายการสินค้า (ที่ปรับ category แล้วถ้าจำเป็น) ลง localStorage
  }, [products, categories]); // รัน effect เมื่อ products หรือ categories เปลี่ยน

  // ---------- props กลางส่งลงทุกหน้า ----------
  const catalogProps = { products, setProducts, categories, setCategories }; // รวม props ที่ใช้ร่วมกันในหลายหน้า

  return ( // คืนค่า JSX หลักของแอป
    <div className="min-h-dvh w-full"> {/* คอนเทนเนอร์หลัก ความสูงอย่างน้อยเท่ากับหน้าจอ */}
      {!isAdminRoute && <Navbar />} {/* ถ้าไม่ใช่หน้า /admin ให้แสดง Navbar ด้านบน */}

      <main className={isAdminRoute ? "min-h-dvh" : "min-h-[calc(100dvh-64px)]"}> {/* พื้นที่หลักของเนื้อหา ปรับความสูงตามว่ามี Navbar หรือไม่ */}
        <Routes> {/* กำหนดเส้นทาง (routes) ทั้งหมดของแอป */}
          {/* ผู้ใช้ */}
          <Route path="/" element={<HomePage {...catalogProps} />} /> {/* เส้นทางหน้าแรก แสดงสินค้า/หมวดหมู่ภาพรวม */}
          <Route path="/products" element={<ProductPage {...catalogProps} />} /> {/* หน้าแสดงรายการสินค้าทั้งหมด */}
          <Route path="/products/:id" element={<ProductPage {...catalogProps} />} /> {/* หน้าแสดงรายละเอียดสินค้าตาม id ใน URL */}
          <Route path="/favorites" element={<FavoritesPage {...catalogProps} />} /> {/* หน้าแสดงสินค้าที่ผู้ใช้กดถูกใจ */}

          {/* auth */}
          <Route path="/login" element={<LoginPage />} /> {/* หน้าเข้าสู่ระบบ */}
          <Route path="/register" element={<RegisterPage />} /> {/* หน้าสมัครสมาชิก */}

          {/* แอดมิน */}
          <Route path="/admin" element={<AdminPage {...catalogProps} />} /> {/* หน้า admin สำหรับจัดการสินค้าและหมวดหมู่ */}
          {/* ถ้ามีซับเพจในแอดมิน: <Route path="/admin/*" element={<AdminPage {...catalogProps} />} /> */} {/* ตัวอย่างสำหรับรองรับเส้นทางย่อยใน /admin */}
        </Routes>
      </main>
    </div>
  );
} 

export default App;
