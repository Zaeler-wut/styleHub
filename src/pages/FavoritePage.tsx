// src/pages/FavoritesPage.tsx
import React, { useEffect, useMemo, useState } from "react"; // ใช้ React + useState/useEffect/useMemo สำหรับ state และคำนวณข้อมูลที่แคชได้
import ProductCard, { type ProductCardProps } from "../components/ProductCard"; // การ์ดแสดงสินค้า + type ของ props ที่การ์ดต้องการ

import productsSeed from "../data/products.json"; // ข้อมูลสินค้าเริ่มต้นจากไฟล์ JSON (ใช้เป็น fallback)
import categoriesSeed from "../data/categorys.json"; // ข้อมูลหมวดหมู่เริ่มต้นจากไฟล์ JSON (ใช้เป็น fallback)

import { type Product } from "../types/product"; // type ของสินค้า (สำหรับ props)
import { type Category } from "../types/category"; // type ของหมวดหมู่ (สำหรับ props)

type Props = { // ชนิดข้อมูล props ของหน้า Favorites
  products?: Product[];     // สดจาก App (ถ้ามี) → ใช้แทนไฟล์ JSON
  categories?: Category[];  // สดจาก App (ถ้ามี) → ใช้ทำ label ภาษาไทยให้หมวดหมู่
}; // จบ type Props

const FavoritesPage: React.FC<Props> = ({ products, categories }) => { // ประกาศคอมโพเนนต์ FavoritesPage แบบ React.FC พร้อม destructure props
  // ----------- เตรียมสินค้า (ใช้ props ก่อน, ไม่งั้น fallback JSON) -----------
  const allProducts: ProductCardProps[] = useMemo(() => { // ใช้ useMemo แปลง source สินค้าให้เป็นรูปแบบที่ ProductCard ต้องการ
    const src = (Array.isArray(products) && products.length > 0 // ถ้ามี props.products และไม่ว่าง
      ? products // ใช้ products จาก App เป็นหลัก
      : (productsSeed as any[])).filter(Boolean); // ถ้าไม่มี ให้ fallback เป็น productsSeed จากไฟล์ JSON และกรองค่า falsy ออก

    return src.map((p: any) => ({ // map แต่ละ item ให้เป็น ProductCardProps
      id: Number(p.id), // บังคับ id ให้เป็น number
      name: String(p.name), // ชื่อสินค้าเป็น string
      price: Number(p.price), // ราคาแปลงเป็น number
      category: String(p.category || ""), // category เป็น string ถ้าไม่มีให้เป็น ""
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []), // ถ้า images เป็น array ใช้เลย ถ้าไม่แต่มี image เดียวให้ wrap เป็น array ไม่งั้น []
      storeLink: p.storeLink || "", // ลิงก์ร้านค้า ถ้าไม่มีให้เป็น string ว่าง
      description: p.description || "", // รายละเอียดสินค้า ถ้าไม่มีให้เป็น string ว่าง
      authentic: !!p.authentic, // แปลงเป็น boolean ว่าเป็นของแท้ไหม
    }));
  }, [products]); // คำนวณใหม่เมื่อ products (จาก props) เปลี่ยน

  // ----------- ทำ label ของหมวดหมู่ (ดึงจาก props.categories ก่อน) -----------
  const catLabel: Record<string, string> = useMemo(() => { // สร้าง map id → label (ชื่อหมวดหมู่) ไว้ใช้ใน dropdown
    const src = (Array.isArray(categories) && categories.length > 0 // ถ้ามี categories จาก App
      ? categories // ใช้จาก App ก่อน
      : (categoriesSeed as Array<{ id?: string; name?: string }> ) // ไม่งั้น fallback เป็น categoriesSeed จาก JSON
    ).filter(Boolean); // กรองค่า falsy ออก

    const map: Record<string, string> = {}; // object เปล่าเก็บคู่ id → name
    for (const c of src) { // loop จาก source
      const id = String((c as any).id ?? "").trim(); // ดึง id เป็น string ตัดช่องว่างหัวท้าย
      if (!id) continue; // ถ้าไม่มี id ข้าม
      const name = String((c as any).name ?? "").trim(); // ดึงชื่อหมวดหมู่
      if (name) map[id] = name; // ถ้ามีชื่อให้เซ็ตใน map
    }
    return map; // คืน map ที่สร้างไว้
  }, [categories]); // คำนวณใหม่เมื่อ categories (จาก props) เปลี่ยน

  // ----------- ผู้ใช้ & รายการโปรด -----------
  const [username, setUsername] = useState<string | null>(null); // เก็บชื่อผู้ใช้ปัจจุบัน (ดึงจาก localStorage)
  const [favIds, setFavIds] = useState<number[]>([]); // เก็บ list id สินค้าที่ user กด favorite
  const favKey = username ? `fav:${username}` : null; // key สำหรับเก็บใน localStorage แยกตามชื่อ user เช่น fav:admin

  // guard login + load username
  useEffect(() => { // เช็กว่ามีการล็อกอินหรือยังเมื่อหน้า favorites โหลด
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null"); // อ่าน user จาก localStorage
      if (!u || !u.name) { // ถ้าไม่มี user หรือล็อกอินไม่สมบูรณ์
        window.location.href = "/login"; // เด้งไปหน้า login
        return; // จบ effect
      }
      setUsername(u.name); // ถ้ามี user ให้ตั้ง username
    } catch {
      window.location.href = "/login"; // ถ้า parse พลาด ให้เด้งไปหน้า login
    }
  }, []); // ทำครั้งเดียวตอน mount

  // load favIds ของ user
  useEffect(() => { // โหลดรายการ id สินค้าที่ user คนนี้กด favorite ไว้
    if (!favKey) return; // ถ้ายังไม่รู้ favKey (เช่น ยังไม่ set username) ให้จบก่อน
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]"); // อ่านค่าจาก localStorage โดยใช้ favKey
      setFavIds(Array.isArray(raw) ? raw : []); // ถ้าเป็น array ให้ใช้ได้เลย ไม่งั้นใช้ [] แทน
    } catch {
      setFavIds([]); // ถ้า parse พลาดให้ใช้ []
    }
  }, [favKey]); // รันใหม่เมื่อ favKey เปลี่ยน (เช่น username เปลี่ยน)

  // toggle favorite
  const toggleFavorite = (id: number) => { // ฟังก์ชันสลับสถานะ favorite ของสินค้า id ที่ส่งมา
    if (!favKey) { // ถ้ายังไม่มี favKey แสดงว่าผู้ใช้ยังไม่พร้อม
      window.location.href = "/login"; // ส่งไป login ไว้ก่อน
      return; // หยุดทำงาน
    }
    setFavIds((prev) => { // อัปเดตรายการ favIds
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]; // ถ้ามี id นี้อยู่แล้วให้ลบออก ไม่งั้นให้เพิ่มเข้าไป
      localStorage.setItem(favKey, JSON.stringify(next)); // เซฟรายการใหม่กลับไป localStorage
      return next; // คืนค่า state ใหม่
    });
  };

  // เฉพาะสินค้าที่กดถูกใจ
  const favProducts = useMemo( // คำนวณรายการสินค้าเฉพาะที่อยู่ใน favIds
    () => allProducts.filter((p) => favIds.includes(p.id)), // เลือกเฉพาะสินค้าที่ id อยู่ใน favIds
    [allProducts, favIds] // คำนวณใหม่เมื่อสินค้า หรือ favIds เปลี่ยน
  );

  // หมวดที่มีในรายการโปรด สำหรับ dropdown
  const favCategories = useMemo( // คำนวณรายการหมวดหมู่ที่มีอยู่จริงใน favorites
    () => Array.from(new Set(favProducts.map((p) => p.category))), // ดึง category จาก favProducts แล้วใช้ Set ตัดซ้ำ แล้วแปลงกลับเป็น array
    [favProducts] // คำนวณใหม่เมื่อ favProducts เปลี่ยน
  );

  // เลือกหมวดในหน้า Favorites
  const [selectedCat, setSelectedCat] = useState<string>("all"); // state เก็บหมวดหมู่ที่เลือกใน dropdown (เริ่มจาก "all")

  // สินค้าตามหมวดที่เลือก
  const list = useMemo( // คำนวณ list สินค้าที่จะแสดงตามหมวดที่เลือก
    () =>
      selectedCat === "all" // ถ้าเลือก "all"
        ? favProducts // แสดงทุกตัวใน favorites
        : favProducts.filter((p) => p.category === selectedCat), // ไม่งั้นกรองเฉพาะสินค้าที่ category ตรงกับที่เลือก
    [favProducts, selectedCat] // คำนวณใหม่เมื่อ favorites หรือหมวดที่เลือกเปลี่ยน
  );

  return ( // เริ่ม JSX ของหน้า Favorites
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900"> {/* พื้นหลังไล่สีชมพู→ม่วง ทั้งหน้า */}
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-16"> {/* คอนเทนเนอร์หลัก กำหนดความกว้างสูงสุดและระยะห่างรอบ ๆ */}
        {/* หัวเรื่อง + Dropdown */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> {/* แถวบน: หัวข้อ + ตัวเลือกหมวดหมู่ (เรียงแนวตั้งบนจอเล็ก แนวนอนบนจอใหญ่) */}
          <h1 className="text-2xl font-extrabold text-white drop-shadow"> {/* ชื่อหน้า Favorites */}
            รายการโปรดของฉัน
          </h1>

          <div className="flex items-center gap-3"> {/* กลุ่ม label + select หมวดหมู่ */}
            <label className="text-sm font-semibold text-white/90">หมวดหมู่</label> {/* label บอกว่าคือเลือกหมวดหมู่ */}
            <select
              value={selectedCat} // ค่าปัจจุบันของ dropdown
              onChange={(e) => setSelectedCat(e.target.value)} // เมื่อเลือกหมวดใหม่ ให้เปลี่ยน selectedCat
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow ring-1 ring-black/10 focus:outline-none" // สไตล์ dropdown
            >
              <option value="all">ทั้งหมด</option> {/* ตัวเลือกค่า "all" = แสดงทุกหมวด */}
              {favCategories.map((id) => ( // วนแสดงทุกหมวดที่มีอยู่ใน favorites
                <option key={id} value={id}>
                  {catLabel[id] || id} {/* แสดงชื่อหมวดจาก catLabel ถ้ามี ไม่งั้นใช้ id ตรง ๆ */}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid รายการโปรด */}
        {list.length === 0 ? ( // ถ้า list สินค้าที่จะโชว์ว่าง
          <div className="rounded-2xl bg-white/80 p-8 text-center text-black/70 shadow"> {/* กล่องข้อความแจ้ง */}
            {favProducts.length === 0 // เช็กว่าทั้ง favorites ว่างไหม
              ? "ยังไม่มีสินค้าในรายการโปรด" // กรณีไม่มีสินค้าใดถูกกด favorite เลย
              : "ไม่มีสินค้าในหมวดนี้"}      // กรณีมี favorite แต่ไม่มีตัวที่อยู่ในหมวดที่เลือก
          </div>
        ) : ( // ถ้ามีสินค้าให้แสดง
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch"> {/* กริดการ์ดสินค้า 1/2/3 คอลัมน์ตามขนาดจอ */}
            {list.map((p) => ( // วนแสดง ProductCard จาก list
              <ProductCard
                key={p.id} // key ไม่ซ้ำ ใช้ id สินค้า
                {...p} // กระจาย props พื้นฐาน (id, name, price, category, images, storeLink, description, authentic)
                isFav={true} // บอกการ์ดว่าอันนี้คือ favorite แล้ว
                onToggleFav={() => toggleFavorite(p.id)} // กดหัวใจแล้วให้ toggleFavorite ตาม id ของสินค้า
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage; // export คอมโพเนนต์ FavoritesPage เป็น default
