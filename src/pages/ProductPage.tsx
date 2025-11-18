// src/pages/ProductPage.tsx
import React, { useEffect, useMemo, useState } from "react"; // นำเข้า React และ hooks ที่ใช้: useEffect/useMemo/useState
import { useParams } from "react-router-dom"; // ใช้ดึงพารามิเตอร์จาก URL เช่น /products/:id

import CategorySidebar from "../components/CategorySidebar"; // แถบเมนูหมวดหมู่ด้านซ้าย
import ProductCard, { type ProductCardProps } from "../components/ProductCard"; // การ์ดแสดงสินค้า + type ของ props การ์ด

import productsSeed from "../data/products.json"; // สินค้าเริ่มต้นจากไฟล์ JSON (ใช้เป็น fallback)
import categoriesSeed from "../data/categorys.json"; // หมวดหมู่เริ่มต้นจากไฟล์ JSON (ใช้เป็น fallback)

import { type Product } from "../types/product"; // type ข้อมูลสินค้า
import { type Category } from "../types/category"; // type ข้อมูลหมวดหมู่
import { loadProducts } from "../services/storage"; // ฟังก์ชันโหลดสินค้า (อ่านจาก localStorage + seed)
import { loadCategories } from "../services/categoryStorage"; // ฟังก์ชันโหลดหมวดหมู่ (อ่านจาก localStorage + seed)

type Props = { // ชนิดของ props ที่หน้า ProductPage จะรับ
  products?: Product[]; // รายการสินค้าแบบสดจาก App (ถ้ามี)
  categories?: Category[]; // รายการหมวดหมู่แบบสดจาก App (ถ้ามี)
}; // ปิด type Props

/** normalize ไทย + ลบวรรณยุกต์/อักขระล่องหน/วรรคตอน แล้ว trim */ // คอมเมนต์อธิบายชุดฟังก์ชัน normalize string ภาษาไทย
const stripMarks = (s: string) => // ลบวรรณยุกต์/สระ/เครื่องหมายประกอบออกจาก string
  s
    .normalize("NFD") // แยกตัวอักษร+วรรณยุกต์ออกจากกัน
    .replace(/[\u0300-\u036f\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, ""); // ลบช่วงโค้ดวรรณยุกต์ทั้งอังกฤษ+ไทย
const stripInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, ""); // ลบอักขระล่องหน เช่น zero-width space
const stripPunct = (s: string) => s.replace(/[^\p{L}\p{N}\s]/gu, ""); // ลบวรรคตอน/สัญลักษณ์ คงไว้เฉพาะ ตัวอักษร/ตัวเลข/ช่องว่าง
const sNorm = (s?: string) => // ฟังก์ชัน normalize หลัก
  stripPunct(stripInvisible(stripMarks((s ?? "").toLowerCase()))) // แปลงเป็นตัวเล็ก → ลบวรรณยุกต์ → ลบตัวล่องหน → ลบวรรคตอน
    .replace(/\s+/g, " ") // รวมช่องว่างหลายช่องให้เหลือช่องเดียว
    .trim(); // ตัดช่องว่างหัวท้ายออก

const ProductPage: React.FC<Props> = ({ products, categories }) => { // ประกาศคอมโพเนนต์ ProductPage แบบ React.FC พร้อม props
  const { id: selectedKeyRaw } = useParams<{ id?: string }>(); // ดึงค่า id จาก URL (เช่น /products/:id)
  const selectedKey = sNorm(selectedKeyRaw); // นำ id ดิบมา normalize เป็น key สำหรับ filter category

  // ---------- หมวดหมู่: props > LS > JSON ----------
  const catObjects: Array<{ id: string; name?: string }> = useMemo(() => { // คำนวณ list หมวดหมู่ที่ใช้ใน sidebar
    const buildMap = (arr: Array<{ id?: string; name?: string }>) => { // helper function สร้าง map id → name จาก array
      const map = new Map<string, { id: string; name?: string }>(); // Map เก็บ id ที่ normalize แล้ว
      for (const c of arr || []) { // วนทุก element ใน array
        const id = sNorm(String(c?.id || "")); // normalize id ให้เป็นรูปแบบเดียวกัน
        if (!id) continue; // ถ้า id ว่างข้าม
        const name = (c?.name || "").trim() || c?.id || id; // ถ้า name ว่างให้ fallback เป็น id เดิม หรือ id normalize
        if (!map.has(id)) map.set(id, { id, name }); // ถ้ายังไม่มี key นี้ใน map ให้เพิ่มเข้าไป
      }
      return Array.from(map.values()); // แปลงจาก Map กลับเป็น array ของ object {id,name}
    };

    if (Array.isArray(categories) && categories.length > 0) { // ถ้ามี categories จาก props (สดจาก App)
      return buildMap(categories as any); // ใช้ข้อมูลจาก props เป็นหลัก
    }

    const ls = loadCategories( // ถ้าไม่มี props ให้พยายามโหลดจาก localStorage ผ่าน loadCategories
      (categoriesSeed as any[]).map((c) => ({ // seed หมวดหมู่เบื้องต้นส่งเข้าไปให้ loadCategories
        id: String(c?.id || "").trim(), // id ตัดช่องว่าง
        name: String(c?.name || "").trim() || undefined, // name ถ้าไม่มีให้ undefined
      }))
    );
    if (ls.length > 0) return buildMap(ls as any); // ถ้าโหลดจาก LS แล้วมีข้อมูลให้ใช้ข้อมูลนั้น

    return buildMap(categoriesSeed as any[]); // ถ้า props และ LS ไม่ได้ข้อมูล ให้ fallback เป็นไฟล์ JSON เดิม
  }, [categories]); // คำนวณใหม่เมื่อ categories จาก props เปลี่ยน

  // ---------- สินค้า: props > LS > JSON ----------
  const allProducts: ProductCardProps[] = useMemo(() => { // แปลงรายการสินค้าให้เป็นรูปแบบที่ ProductCard ใช้ได้
    const toCard = (arr: any[]): ProductCardProps[] => // helper function แปลง array ของสินค้าเป็น ProductCardProps[]
      arr
        .filter(Boolean) // กรองค่าที่เป็น null/undefined ออก
        .map((p: any) => ({ // map แต่ละ record ให้กลายเป็น ProductCardProps
          id: Number(p.id), // แปลง id เป็น number
          name: String(p.name ?? ""), // ชื่อสินค้า
          price: Number(p.price ?? 0), // ราคา เลขจำนวนเต็มหรือ 0
          category: sNorm(String(p.category || "")), // category normalize เป็น key ที่ใช้เทียบ
          images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [], // ถ้า images เป็น array ใช้เลย ไม่ก็ลองดู p.image เดี่ยว
          storeLink: p.storeLink || "", // ลิงก์ร้านค้า ถ้าไม่มีให้ค่าว่าง
          description: p.description || "", // รายละเอียด ถ้าไม่มีให้ค่าว่าง
          authentic: !!p.authentic, // แปลงให้ชัดเจนว่าเป็น boolean
        }))
        .filter((p) => !!p.id); // กรองสินค้าไม่มี id ออก (กันข้อมูลเสีย)

    if (Array.isArray(products) && products.length > 0) { // ถ้าส่งสินค้าแบบสดจาก App มาให้
      return toCard(products as any[]); // ใช้สินค้าจาก props เป็นหลัก
    }

    const ls = loadProducts( // ถ้าไม่มี props ให้โหลดจาก localStorage ผ่าน loadProducts
      (productsSeed as any[]).map((p) => ({ // ส่ง seed (productsSeed) เข้าไปเป็นค่า default
        id: Number(p.id), // id
        name: String(p.name ?? ""), // name
        price: Number(p.price ?? 0), // price
        category: String(p.category || ""), // category ยังไม่ normalize ตรงนี้
        storeLink: p.storeLink || "", // storeLink
        description: p.description || "", // description
        authentic: !!p.authentic, // authentic
        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [], // images
        isFavorite: !!p.isFavorite, // isFavorite (เก็บใน storage เผื่อหน้าที่สนใจ)
      }))
    );
    if (ls.length > 0) return toCard(ls as any[]); // ถ้าโหลดจาก LS แล้วได้ข้อมูลให้ใช้ข้อมูลนั้น

    return toCard(productsSeed as any[]); // ถ้าไม่มีทั้ง props และ LS → fallback เป็นสินค้าจาก JSON อย่างเดียว
  }, [products]); // คำนวณใหม่เมื่อ products จาก props เปลี่ยน

  // ---------- ผู้ใช้ & รายการโปรด ----------
  const [username, setUsername] = useState<string | null>(null); // state เก็บชื่อ user ปัจจุบัน (จาก localStorage)
  const [favIds, setFavIds] = useState<number[]>([]); // state เก็บรายการ id ของสินค้าที่ถูกกด favorite โดย user นี้
  const favKey = username ? `fav:${username}` : null; // key ใน localStorage สำหรับ favorite ของ user นี้ เช่น fav:admin

  useEffect(() => { // โหลดข้อมูล user จาก localStorage ครั้งแรก
    try {
      const s = JSON.parse(localStorage.getItem("user") || "null"); // อ่านค่า "user" จาก localStorage
      setUsername(s?.name ?? null); // ถ้ามี name ให้ใช้ ไม่มีก็ตั้งเป็น null
    } catch {
      setUsername(null); // ถ้า parse พลาดให้ใช้ null
    }
  }, []);

  useEffect(() => { // โหลดรายการ favIds ตาม user (favKey)
    if (!favKey) { // ถ้ายังไม่มี favKey (ยังไม่รู้ชื่อ user)
      setFavIds([]); // เคลียร์ favIds ให้ว่าง
      return; // หยุดทำงาน
    }
    try {
      const raw = JSON.parse(localStorage.getItem(favKey) || "[]"); // อ่าน favorite จาก localStorage โดยใช้ favKey
      setFavIds(Array.isArray(raw) ? raw : []); // ถ้าเป็น array ให้ใช้ ไม่งั้นให้ []
    } catch {
      setFavIds([]); // ถ้า parse พลาดให้ []
    }
  }, [favKey]); // รันใหม่เมื่อ favKey (เช่น username) เปลี่ยน

  // ---------- ค้นหาเฉพาะ "ชื่อสินค้า" ----------
  const [q, setQ] = useState(""); // state สำหรับคำค้น (search) เฉพาะชื่อสินค้า

  // ---------- กรองตามหมวด + ค้นหาเฉพาะชื่อ ----------
  const list = useMemo(() => { // useMemo เพื่อคำนวณรายการสินค้าที่จะแสดงใน grid
    const base = !selectedKey // ถ้าไม่มีหมวดที่เลือก (เช่น /products เฉย ๆ)
      ? allProducts // ใช้สินค้าทั้งหมด
      : allProducts.filter((p) => p.category === selectedKey); // ถ้ามีหมวดที่เลือก ให้กรองเฉพาะสินค้าที่ category ตรงกับ selectedKey

    const qq = sNorm(q); // normalize ข้อความค้นหา
    if (!qq) return base; // ถ้า search ว่าง ให้คืน base โดยไม่กรองเพิ่ม

    const tokens = qq.split(/\s+/).filter(Boolean); // แยกคำค้นด้วยช่องว่าง แล้วกรองช่องว่างออก (AND search)
    return base.filter((p) => { // กรองสินค้าใน base ตามคำค้น
      const nameNorm = sNorm(p.name); // normalize ชื่อสินค้าแต่ละตัว
      return tokens.every((tk) => nameNorm.includes(tk)); // ทุก token ต้องถูกพบในชื่อสินค้า (AND)
    });
  }, [allProducts, selectedKey, q]); // คำนวณใหม่เมื่อรายการสินค้า, หมวดที่เลือก หรือคำค้นเปลี่ยน

  return ( // เริ่ม JSX ของหน้า ProductPage
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900"> {/* พื้นหลังไล่สีทั้งหน้า */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 py-10 md:py-16 md:grid-cols-[240px_1fr]"> {/* layout หลัก: mobile = 1 คอลัมน์, md+ = sidebar 240px + content */}
        {/* Sidebar หมวดหมู่ */}
        <CategorySidebar categories={catObjects} selectedKey={selectedKeyRaw} /> {/* ส่งรายการหมวดหมู่และ id ที่เลือก (จาก URL) ให้ sidebar แสดงออกมา */}

        <div className="flex flex-col gap-4"> {/* โซนฝั่งขวา: ช่องค้นหา + grid สินค้า */}
          {/* ช่องค้นหาแบบ “ยาวเต็มแถว” */}
          <div className="rounded-xl bg-white/90 p-3 shadow ring-1 ring-black/10"> {/* กล่องครอบ input ค้นหา */}
            <input
              aria-label="ค้นหาชื่อสินค้า" // ป้ายสำหรับ screen reader
              placeholder="ค้นหาชื่อสินค้า (เช่น รองเท้า, bag, watch...)" // ข้อความตัวอย่างบอกรูปแบบคำค้น
              value={q} // ผูกกับ state คำค้น
              onChange={(e) => setQ(e.target.value)} // เมื่อผู้ใช้พิมพ์ให้เปลี่ยนค่า q
              className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300" // สไตล์ช่องค้นหา
            />
          </div>

          {/* สินค้า */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> {/* กริดแสดงการ์ดสินค้า: 1 คอลัมน์บนมือถือ, 2/3 บนจอใหญ่ */}
            {list.map((p) => ( // วนรายการสินค้าที่ผ่านการกรองแล้ว
              <ProductCard
                key={p.id} // key ไม่ซ้ำต่อ React ใช้ id สินค้า
                {...p} // กระจาย props พื้นฐานทั้งหมดของสินค้าให้ ProductCard
                isFav={favIds.includes(p.id)} // บอกการ์ดว่าสินค้านี้เป็น favorite หรือไม่ (ตาม favIds)
                onToggleFav={() => { // ฟังก์ชันสลับสถานะ favorite เมื่อคลิกหัวใจ
                  if (!favKey) { // ถ้ายังไม่มี favKey แปลว่ายังไม่รู้ user
                    window.location.href = "/login"; // ส่งไปหน้า login ก่อน
                    return; // หยุดทำงาน
                  }
                  setFavIds((prev) => { // อัปเดต state favIds
                    const next = prev.includes(p.id) // ถ้า id นี้อยู่ใน list แล้ว
                      ? prev.filter((x) => x !== p.id) // ให้เอาออก (unfavorite)
                      : [...prev, p.id]; // ถ้าไม่มีให้เพิ่มเข้าไป (favorite)
                    localStorage.setItem(favKey, JSON.stringify(next)); // เซฟรายการใหม่กลับไปใน localStorage
                    return next; // คืนค่า state ใหม่
                  });
                }}
              />
            ))}

            {list.length === 0 && ( // ถ้าไม่มีสินค้าใดตรงกับเงื่อนไขกรอง+ค้นหา
              <div className="col-span-full rounded-2xl bg-white/70 p-8 text-center text-black/70 shadow"> {/* กล่องแจ้งเตือนแสดงเต็มแถว */}
                ไม่พบ “{q.trim()}” ในชื่อสินค้า {/* ข้อความแจ้งว่าไม่เจอผลลัพธ์ พร้อมแสดงคำที่ค้นหา */}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductPage; // export คอมโพเนนต์ ProductPage เป็น default ให้ไฟล์อื่นนำไปใช้
