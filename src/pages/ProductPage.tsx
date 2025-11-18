// src/pages/ProductPage.tsx
import React, { useEffect, useMemo, useState } from "react"; // ใช้ hook หลักในการจัดการ state, side-effect และคำนวณค่าที่สามารถ cache ได้
import { useParams } from "react-router-dom"; // ใช้ดึงพารามิเตอร์ id ของหมวดหมู่จาก URL เช่น /products/:id

import CategorySidebar from "../components/CategorySidebar"; // แถบหมวดหมู่ด้านซ้ายมือ
import ProductCard, { type ProductCardProps } from "../components/ProductCard"; // การ์ดแสดงสินค้าแต่ละชิ้น

import productsSeed from "../data/products.json"; // ข้อมูลสินค้าตั้งต้นจากไฟล์ JSON
import categoriesSeed from "../data/categorys.json"; // ข้อมูลหมวดหมู่ตั้งต้นจากไฟล์ JSON

import { type Product } from "../types/product"; // รูปแบบข้อมูลของสินค้า
import { type Category } from "../types/category"; // รูปแบบข้อมูลของหมวดหมู่
import { loadProducts } from "../services/storage"; // ฟังก์ชันอ่านข้อมูลสินค้า (รวม localStorage + seed)
import { loadCategories } from "../services/categoryStorage"; // ฟังก์ชันอ่านข้อมูลหมวดหมู่ (รวม localStorage + seed)

type Props = {
  products?: Product[];    // ถ้าหน้า App ส่งสินค้ามาเป็น props จะใช้ชุดนั้นเป็นหลัก
  categories?: Category[]; // ถ้าหน้า App ส่งหมวดหมู่มาเป็น props จะใช้ชุดนั้นเป็นหลัก
};

// ===================== ฟังก์ชันช่วย normalize ข้อความ (โดยเฉพาะภาษาไทย) =====================
// เป้าหมาย: ทำให้การเปรียบเทียบ category / การค้นหา “ทนต่อ” วรรณยุกต์ ช่องว่าง หรือสัญลักษณ์ต่าง ๆ

// ลบวรรณยุกต์/สระ/เครื่องหมายประกอบออกจากข้อความ (ทั้งอังกฤษและไทย)
const stripMarks = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "");

// ลบอักขระล่องหน เช่น zero-width space ที่อาจหลงมาในข้อความ
const stripInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, "");

// ลบสัญลักษณ์และวรรคตอนออก เหลือเฉพาะตัวอักษร ตัวเลข และช่องว่าง
const stripPunct = (s: string) => s.replace(/[^\p{L}\p{N}\s]/gu, "");

// ฟังก์ชัน normalize หลัก: ตัวเล็ก + ลบวรรณยุกต์ + ลบตัวล่องหน + ลบสัญลักษณ์ + จัดช่องว่าง
const sNorm = (s?: string) =>
  stripPunct(stripInvisible(stripMarks((s ?? "").toLowerCase())))
    .replace(/\s+/g, " ")
    .trim();

// ===================== คอมโพเนนต์หลักหน้าแสดงสินค้า =====================

const ProductPage: React.FC<Props> = ({ products, categories }) => {
  // ดึง id ของหมวดหมู่จาก URL เช่น /products/shoes → selectedKeyRaw = "shoes"
  const { id: selectedKeyRaw } = useParams<{ id?: string }>();

  // แปลง id จาก URL ให้เป็นรูปแบบ normalize เพื่อเอาไว้ใช้เปรียบเทียบกับ category ในสินค้า
  const selectedKey = sNorm(selectedKeyRaw);

  // ===================== ส่วนหมวดหมู่: เลือกใช้จาก props > localStorage > ไฟล์ JSON =====================
  const catObjects: Array<{ id: string; name?: string }> = useMemo(() => {
    // ฟังก์ชันช่วย: รับ array ของหมวดหมู่ แล้วรวมเป็น map กัน id ซ้ำ โดยใช้ id แบบ normalize เป็น key
    const buildMap = (arr: Array<{ id?: string; name?: string }>) => {
      const map = new Map<string, { id: string; name?: string }>();

      for (const c of arr || []) {
        const id = sNorm(String(c?.id || "")); // normalize id หมวดหมู่
        if (!id) continue; // ถ้าไม่มี id ให้ข้าม

        // ถ้าไม่มี name ให้ fallback เป็น id เดิม หรือค่าที่ normalize แล้ว
        const name = (c?.name || "").trim() || c?.id || id;

        if (!map.has(id)) {
          map.set(id, { id, name }); // เก็บเฉพาะตัวแรกของ id นั้น ๆ เพื่อกันข้อมูลซ้ำ
        }
      }

      return Array.from(map.values()); // คืนเป็น array เพื่อนำไปแสดงใน sidebar
    };

    // กรณีที่ 1: ถ้ามี categories จาก props (ข้อมูลสดจาก App) → ใช้เป็นแหล่งข้อมูลหลัก
    if (Array.isArray(categories) && categories.length > 0) {
      return buildMap(categories as any);
    }

    // กรณีที่ 2: ถ้าไม่มี props → พยายามโหลดจาก localStorage โดยใช้ seed จากไฟล์ JSON เป็นค่าเริ่มต้น
    const ls = loadCategories(
      (categoriesSeed as any[]).map((c) => ({
        id: String(c?.id || "").trim(),
        name: String(c?.name || "").trim() || undefined,
      }))
    );
    if (ls.length > 0) return buildMap(ls as any);

    // กรณีที่ 3: ถ้า localStorage ยังว่าง → ใช้ข้อมูลจากไฟล์ JSON โดยตรง
    return buildMap(categoriesSeed as any[]);
  }, [categories]);

  // ===================== ส่วนสินค้า: เลือกใช้จาก props > localStorage > ไฟล์ JSON =====================
  const allProducts: ProductCardProps[] = useMemo(() => {
    // ฟังก์ชันช่วย: แปลง array สินค้า “ดิบ” ให้กลายเป็นรูปแบบที่ ProductCard ใช้ได้
    const toCard = (arr: any[]): ProductCardProps[] =>
      arr
        .filter(Boolean)
        .map((p: any) => ({
          id: Number(p.id),
          name: String(p.name ?? ""),
          price: Number(p.price ?? 0),
          // เก็บ category ในรูปแบบ normalize เพื่อใช้เทียบกับ selectedKey ได้แม่นยำ
          category: sNorm(String(p.category || "")),
          // รองรับทั้ง products ที่เก็บรูปเป็น images[] หรือ image เดี่ยว
          images: Array.isArray(p.images)
            ? p.images
            : p.image
            ? [p.image]
            : [],
          storeLink: p.storeLink || "",
          description: p.description || "",
          authentic: !!p.authentic,
        }))
        // กันข้อมูลเสีย: ตัดสินค้าที่ไม่มี id (หรือแปลงไม่ได้) ทิ้ง
        .filter((p) => !!p.id);

    // กรณีที่ 1: ถ้ามีสินค้าแบบสดจาก App ส่งมาทาง props → ใช้เป็นหลัก
    if (Array.isArray(products) && products.length > 0) {
      return toCard(products as any[]);
    }

    // กรณีที่ 2: ถ้าไม่มี props → โหลดจาก localStorage โดยใช้ productsSeed เป็นค่าเริ่มต้น
    const ls = loadProducts(
      (productsSeed as any[]).map((p) => ({
        id: Number(p.id),
        name: String(p.name ?? ""),
        price: Number(p.price ?? 0),
        category: String(p.category || ""),
        storeLink: p.storeLink || "",
        description: p.description || "",
        authentic: !!p.authentic,
        images: Array.isArray(p.images)
          ? p.images
          : p.image
          ? [p.image]
          : [],
        isFavorite: !!p.isFavorite,
      }))
    );
    if (ls.length > 0) return toCard(ls as any[]);

    // กรณีที่ 3: ถ้า localStorage ว่าง → ใช้ข้อมูลจากไฟล์ JSON เป็นค่า fallback
    return toCard(productsSeed as any[]);
  }, [products]);

  // ===================== ส่วนจัดการผู้ใช้และ “รายการโปรด (favorite)” =====================
  const [username, setUsername] = useState<string | null>(null); // เก็บชื่อผู้ใช้ที่ล็อกอินอยู่ (อ่านจาก localStorage)
  const [favIds, setFavIds] = useState<number[]>([]); // เก็บ list ของ id สินค้าที่ผู้ใช้นี้กด favorite ไว้
  const favKey = username ? `fav:${username}` : null; // ใช้ key ใน localStorage แยกตาม username เช่น fav:admin

  // ตอนเข้า page ครั้งแรก: ลองอ่าน session user จาก localStorage
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("user") || "null");
      setUsername(s?.name ?? null);
    } catch {
      setUsername(null);
    }
  }, []);

  // เมื่อรู้ favKey (รู้ว่าเป็น user ไหน) → โหลดรายการ favorite ของ user คนนั้น
  useEffect(() => {
    if (!favKey) {
      setFavIds([]); // ถ้าไม่มี favKey แสดงว่ายังไม่มี user → เคลียร์ให้ว่าง
      return;
    }
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]");
      setFavIds(Array.isArray(raw) ? raw : []);
    } catch {
      setFavIds([]);
    }
  }, [favKey]);

  // ===================== ส่วนค้นหาชื่อสินค้า =====================
  const [q, setQ] = useState(""); // state สำหรับเก็บข้อความค้นหาที่ผู้ใช้พิมพ์

  // ===================== กรองสินค้า: ตามหมวดจาก URL + ตามคำค้นหา =====================
  const list = useMemo(() => {
    // ขั้นแรก: กรองตามหมวดหมู่ใน URL (selectedKey)
    const base = !selectedKey
      ? allProducts // ถ้า URL ไม่ระบุหมวด → ใช้สินค้าทั้งหมด
      : allProducts.filter((p) => p.category === selectedKey); // ถ้าเลือกหมวด → เหลือเฉพาะสินค้าที่ category ตรงกัน

    // ขั้นต่อมา: กรองตามคำค้นหา q (เฉพาะชื่อสินค้า)
    const qq = sNorm(q);
    if (!qq) return base; // ถ้าไม่ได้พิมพ์คำค้นหา → ไม่ต้องกรองเพิ่ม

    // รองรับการค้นหาหลายคำ โดยใช้ AND (ทุกคำต้องพบในชื่อสินค้า)
    const tokens = qq.split(/\s+/).filter(Boolean);
    return base.filter((p) => {
      const nameNorm = sNorm(p.name);
      return tokens.every((tk) => nameNorm.includes(tk));
    });
  }, [allProducts, selectedKey, q]);

  // ===================== ส่วนแสดงผล UI หลักของหน้า ProductPage =====================
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      {/* พื้นหลังของหน้า products ใช้ไล่สีชมพู → ม่วง และให้สูงอย่างน้อยเท่าความสูงของหน้าจอ */}

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]">
        {/* layout หลัก
            - มือถือ: 1 คอลัมน์ (sidebar อยู่ด้านบน content)
            - จอ md ขึ้นไป: แบ่ง 2 คอลัมน์ → ซ้าย 240px (sidebar), ขวาเป็นพื้นที่แสดงสินค้า */}

        {/* ===== Sidebar หมวดหมู่ทางซ้าย ===== */}
        <CategorySidebar
          categories={catObjects}      // รายการหมวดหมู่ที่เตรียมไว้ (id + ชื่อ)
          selectedKey={selectedKeyRaw} // ส่ง id จาก URL ไปให้ sidebar ใช้ไฮไลต์หัวข้อที่กำลังดูอยู่
        />

        {/* ===== พื้นที่ฝั่งขวา: ช่องค้นหา + กริดสินค้า ===== */}
        <div className="flex flex-col gap-4">
          {/* กล่องค้นหาชื่อสินค้า */}
          <div className="rounded-xl bg-white/90 p-3 shadow ring-1 ring-black/10">
            <input
              aria-label="ค้นหาชื่อสินค้า"
              placeholder="ค้นหาชื่อสินค้า"
              value={q}
              onChange={(e) => setQ(e.target.value)} // อัปเดต state คำค้นหาเมื่อผู้ใช้พิมพ์
              className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          {/* กริดการ์ดสินค้า */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p.id}           // ใช้ id สินค้าเป็น key ให้ React
                {...p}              // ส่งข้อมูลสินค้า (id, name, price, images, ฯลฯ) ให้การ์ดทีเดียว
                isFav={favIds.includes(p.id)} // เช็กว่า id นี้อยู่ในรายการโปรดหรือไม่
                onToggleFav={() => {
                  // ฟังก์ชันเมื่อกดหัวใจ toggle favorite
                  if (!favKey) {
                    // ถ้ายังไม่รู้จะเก็บ favorite ให้ user ไหน → บังคับให้ไป login ก่อน
                    window.location.href = "/login";
                    return;
                  }
                  setFavIds((prev) => {
                    const next = prev.includes(p.id)
                      ? prev.filter((x) => x !== p.id) // ถ้ามีอยู่แล้ว → ถอดออก
                      : [...prev, p.id];               // ถ้ายังไม่มี → เพิ่มเข้าไป
                    localStorage.setItem(favKey, JSON.stringify(next)); // เซฟรายการ favorite ใหม่ของ user นี้
                    return next;
                  });
                }}
              />
            ))}

            {/* กรณีกรองแล้วไม่พบสินค้าเลย */}
            {list.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white/70 p-8 text-center text-black/70 shadow">
                ไม่พบสินค้า
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage; // ส่งออกคอมโพเนนต์ให้ App นำไปใช้ใน route /products
