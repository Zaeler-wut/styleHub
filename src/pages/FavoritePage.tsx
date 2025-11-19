// แสดงเฉพาะสินค้าที่ผู้ใช้กดถูกใจ (favorite)
// อ่าน/บันทึกข้อมูลรายการโปรดแยกตามผู้ใช้ใน localStorage
// รองรับ filter ตามหมวดหมู่บนหน้า Favorites

import React, { useEffect, useMemo, useState } from "react";
import ProductCard, { type ProductCardProps } from "../components/ProductCard";

import productsSeed from "../data/products.json";   // สินค้าเริ่มต้นจากไฟล์ JSON (ใช้เมื่อยังไม่มีข้อมูลจาก App)
import categoriesSeed from "../data/categorys.json"; // หมวดหมู่เริ่มต้นจากไฟล์ JSON (ใช้ทำ label หมวด)

import { type Product } from "../types/product";
import { type Category } from "../types/category";

// กำหนด Props สำหรับหน้า FavoritePage
// products: รายการสินค้าทั้งหมด (เอามาจาก state กลางใน App)
// categories: รายการหมวดหมู่ทั้งหมด (ใช้ทำ label / filter)
// ทำเป็นแบบ Array ให้ตรงกับสิ่งที่ App ส่งมา
type Props = {
  products?: Product[]; //ใช้เป็น array ของสินค้า อาจไม่มีเลยก็ได้ เลยใส่ ?
  categories?: Category[]; // ใช้เป็น array ของหมวดหมู่ อาจไม่มีเลยก็ได้ เลยใส่ ?
};

const FavoritesPage: React.FC<Props> = ({ products, categories }) => {
  // เตรียมข้อมูลสินค้าให้อยู่ในรูปแบบที่ ProductCard ใช้งานได้
  const allProducts: ProductCardProps[] = useMemo(() => {
    // เลือก source: ใช้ props.products ก่อน ถ้าไม่มีค่อย fallback เป็น productsSeed
    const src = (Array.isArray(products) && products.length > 0
      ? products
      : (productsSeed as any[])
    ).filter(Boolean);

    // map ให้กลายเป็นโครงสร้าง ProductCardProps
    return src.map((p: any) => ({
      id: Number(p.id),
      name: String(p.name),
      price: Number(p.price),
      category: String(p.category || ""),
      images: Array.isArray(p.images)
        ? p.images
        : p.image
        ? [p.image]
        : [],
      storeLink: p.storeLink || "",
      description: p.description || "",
      authentic: !!p.authentic,
    }));
  }, [products]);

  //สร้าง label ของหมวดหมู่ ใช้แสดงชื่ออ่านง่ายใน dropdown
  const catLabel: Record<string, string> = useMemo(() => {
    // เลือก source ของหมวดหมู่: รับจาก props ก่อน ถ้าไม่มีก็ใช้ categoriesSeed
    const src = (Array.isArray(categories) && categories.length > 0
      ? categories
      : (categoriesSeed as Array<{ id?: string; name?: string }>)
    ).filter(Boolean);

    const map: Record<string, string> = {};
    for (const c of src) {
      const id = String((c as any).id ?? "").trim();
      if (!id) continue;
      const name = String((c as any).name ?? "").trim();
      if (name) map[id] = name; // เก็บคู่ id → ชื่อหมวด
    }
    return map;
  }, [categories]);

  // ผู้ใช้ปัจจุบัน รายการ id ของสินค้าโปรดจาก localStorage
  const [username, setUsername] = useState<string | null>(null); // ชื่อผู้ใช้ที่ล็อกอินอยู่
  const [favIds, setFavIds] = useState<number[]>([]); // id สินค้าที่ถูกกด favorite
  const favKey = username ? `fav:${username}` : null; // key แยกเก็บ favorite ต่อ user เช่น fav:admin

  // 3.1 เช็กการล็อกอินและดึงชื่อผู้ใช้
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || !u.name) {
        // ถ้ายังไม่ล็อกอิน  บังคับไปหน้าเข้าสู่ระบบก่อน
        window.location.href = "/login";
        return;
      }
      setUsername(u.name);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // โหลดรายการโปรดของ user คนนั้นจาก localStorage
  useEffect(() => {
    if (!favKey) return;
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]");
      setFavIds(Array.isArray(raw) ? raw : []);
    } catch {
      setFavIds([]);
    }
  }, [favKey]);

  // ฟังก์ชันสลับสถานะ favorite ของสินค้าตัวหนึ่ง
  const toggleFavorite = (id: number) => {
    if (!favKey) {
      window.location.href = "/login";
      return;
    }
    setFavIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id) // ถ้ามีอยู่แล้ว ลบออก
        : [...prev, id]; // ถ้ายังไม่มี เพิ่มเข้าไป
      localStorage.setItem(favKey, JSON.stringify(next)); // เซฟกลับ localStorage
      return next;
    });
  };

  // คัดเฉพาะสินค้าที่อยู่ในรายการโปรด ตาม favIds
  const favProducts = useMemo(
    () => allProducts.filter((p) => favIds.includes(p.id)),
    [allProducts, favIds]
  );

  // สร้าง list หมวดหมู่ที่มีอยู่จริงใน favorites ไว้ใช้ filter
  const favCategories = useMemo(
    () => Array.from(new Set(favProducts.map((p) => p.category))),
    [favProducts]
  );

  // state เก็บหมวดหมู่ที่เลือกในหน้า Favorites
  const [selectedCat, setSelectedCat] = useState<string>("all");

  // เลือกเฉพาะสินค้าตามหมวดที่กำลังเลือก
  const list = useMemo(
    () =>
      selectedCat === "all"
        ? favProducts
        : favProducts.filter((p) => p.category === selectedCat),
    [favProducts, selectedCat]
  );

  // ส่วนแสดงผลหน้า Favorites
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
        {/* แถวบน: หัวเรื่อง  ตัวเลือกหมวดหมู่ */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold text-white drop-shadow">
            รายการโปรดของฉัน
          </h1>

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-white/90">
              หมวดหมู่
            </label>
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

        {/* เนื้อหาหลัก: แสดงรายการโปรดเป็น grid หรือข้อความแจ้งถ้าไม่มีข้อมูล */}
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white/80 p-8 text-center text-black/70 shadow">
            {favProducts.length === 0
              ? "ยังไม่มีสินค้าในรายการโปรด"
              : "ไม่มีสินค้าในหมวดนี้"}
          </div>
        ) : (
          <div className="grid items-stretch grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                {...p} // ส่งข้อมูลสินค้าให้การ์ด id, name, price, images
                isFav={true} // บอกการ์ดว่าอยู่ในรายการโปรดแล้ว
                onToggleFav={() => toggleFavorite(p.id)} // กดหัวใจแล้วสลับสถานะ favorite
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage;
