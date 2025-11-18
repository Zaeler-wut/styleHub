// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react"; // นำเข้า React และ useEffect/useState สำหรับจัดการ lifecycle และ state
import { Link } from "react-router-dom"; // ใช้ Link สำหรับลิงก์เปลี่ยนหน้าใน SPA

import AdminSidebar from "../components/AdminSidebar"; // แถบเมนูด้านซ้ายสำหรับ admin
import StatCard from "../components/StatCard"; // การ์ดแสดงสถิติในหน้า dashboard
import ProductForm from "../components/ProductForm"; // ฟอร์มเพิ่ม/แก้ไขสินค้า
import ProductTable from "../components/ProductTable"; // ตารางแสดงรายการสินค้า
import CategoryForm from "../components/CategoryForm"; // ฟอร์มเพิ่ม/แก้ไขหมวดหมู่
import CategoryList from "../components/CategoryList"; // รายการหมวดหมู่สำหรับจัดการ

import { type Product } from "../types/product"; // type ข้อมูลสินค้า
import { type Category } from "../types/category"; // type ข้อมูลหมวดหมู่

type Tab = "dashboard" | "product" | "category"; // ชนิด tab ที่มีในหน้า Admin
type User = { name: string; password: string; role: "member" | "admin" }; // รูปแบบข้อมูลผู้ใช้ (ใช้ใน dashboard)

const FALLBACK_CAT_ID = "uncategorized"; // id หมวดหมู่สำรองใช้เมื่อไม่มีหมวด

type Props = { // props ที่หน้า AdminPage จะรับจาก App
  products: Product[]; // รายการสินค้าทั้งหมด
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>; // ฟังก์ชันแก้ไข state products
  categories: Category[]; // รายการหมวดหมู่ทั้งหมด
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>; // ฟังก์ชันแก้ไข state categories
};

export default function AdminPage({ // คอมโพเนนต์หลักของหน้าแอดมิน
  products, // สินค้าที่ส่งมาจาก App
  setProducts, // setter สำหรับอัปเดตสินค้า
  categories, // หมวดหมู่จาก App
  setCategories, // setter สำหรับอัปเดตหมวดหมู่
}: Props) {
  // ------- guard: ต้องเป็น admin -------
  useEffect(() => { // เช็กสิทธิ์แอดมินเมื่อเข้าหน้านี้ครั้งแรก
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null"); // อ่าน user จาก localStorage
      if (!u || u.role !== "admin") window.location.href = "/login"; // ถ้าไม่มี user หรือ role ไม่ใช่ admin ให้เด้งไปหน้า login
    } catch {
      window.location.href = "/login"; // ถ้า parse พลาด ให้เด้งไปหน้า login เช่นกัน
    }
  }, []);

  // เริ่มที่ dashboard
  const [tab, setTab] = useState<Tab>("dashboard"); // state เก็บ tab ปัจจุบัน (เริ่มที่ dashboard)
  const [sidebarOpen, setSidebarOpen] = useState(true); // state เปิด/ปิด sidebar (มือถือใช้เป็น slide)

  const categoryIds = // เตรียม array id หมวดหมู่สำหรับส่งให้ ProductForm/Table
    categories.length > 0 ? categories.map((c) => c.id) : [FALLBACK_CAT_ID]; // ถ้ามี categories ให้ map เป็น id ถ้าไม่มีใช้ FALLBACK_CAT_ID

  // ผู้ใช้ (โชว์ใน dashboard)
  const [users, setUsers] = useState<User[]>([]); // state เก็บรายการผู้ใช้ (เอาไปแสดงจำนวนใน dashboard)
  useEffect(() => { // โหลดผู้ใช้จาก localStorage เมื่อหน้า Admin mount
    try {
      const arr = JSON.parse(localStorage.getItem("users") || "[]"); // อ่าน "users" จาก localStorage
      setUsers(Array.isArray(arr) ? arr : []); // ถ้าเป็น array ให้ใช้ ถ้าไม่ใช่ให้ใช้ [] แทน
    } catch {
      setUsers([]); // ถ้า parse พลาดให้ใช้ []
    }
  }, []);

  // ---------- สินค้า ----------
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // state เก็บสินค้าที่กำลังถูกแก้ไข (ถ้า null = โหมดเพิ่ม)

  function addOrUpdateProduct(p: Product, isEdit: boolean) { // ฟังก์ชันเพิ่มหรือแก้ไขสินค้า (รับสินค้าและ flag isEdit)
    const newId = Number(p.id); // แปลง id จาก form ให้เป็นตัวเลข
    if (!Number.isFinite(newId) || newId <= 0) { // ถ้า id ไม่ใช่ตัวเลขหรือ <= 0
      alert("กรุณาใส่รหัสสินค้า (id) เป็นตัวเลขมากกว่า 0"); // แจ้งเตือน
      return;
    }
    if (!isEdit) { // ถ้าเป็นโหมด เพิ่มสินค้าใหม่
      const isDup = products.some((x) => Number(x.id) === newId); // เช็กว่ามี id นี้ใน products อยู่แล้วหรือยัง
      if (isDup) {
        const dup = products.find((x) => Number(x.id) === newId); // หาสินค้าตัวที่ชน id
        alert(`ไอดี ${newId} มีอยู่แล้ว${dup ? ` (สินค้า: ${dup.name})` : ""}`); // แจ้งเตือนว่าซ้ำ พร้อมชื่อสินค้าถ้ามี
        return;
      }
    }
    if (isEdit) { // ถ้าเป็นโหมดแก้ไขสินค้า
      setProducts((prev) => // อัปเดตรายการสินค้าเดิม
        prev.map((x) => (Number(x.id) === newId ? { ...x, ...p, id: newId } : x)) // ถ้า id ตรงกันให้ merge ค่าใหม่ทับของเก่า
      );
    } else {
      setProducts((prev) => [{ ...p, id: newId }, ...prev]); // ถ้าโหมดเพิ่มใหม่ ให้เพิ่มสินค้าไว้ด้านบนสุดของ list
    }
    setEditingProduct(null); // เคลียร์สถานะกำลังแก้ไข (กลับเป็นโหมดเพิ่ม)
  }

  function removeProduct(id: number) { // ฟังก์ชันลบสินค้า
    setProducts((prev) => prev.filter((x) => x.id !== id)); // กรองเอาสินค้าที่ id ตรงกับที่ส่งมาออกจากรายการ
  }

  // ---------- หมวดหมู่ ----------
  function addCategory(c: Category) { // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
    const id = c.id.trim().toLowerCase(); // จัดรูปแบบ id ให้เป็นตัวเล็กและไม่มีช่องว่างเกิน
    if (!id) return; // ถ้า id ว่าง ไม่ทำอะไร

    // ✅ เช็คซ้ำและเตือนที่ชั้น AdminPage (กันหลุด)
    const isDup = categories.some((x) => x.id.toLowerCase() === id); // เช็กว่า id นี้มีอยู่แล้วใน categories หรือยัง
    if (isDup) {
      alert(`มีไอดีหมวดหมู่ "${id}" อยู่แล้ว`); // ถ้าซ้ำแจ้งเตือน
      return;
    }

    setCategories((prev) => [{ ...c, id }, ...prev]); // เพิ่มหมวดใหม่ (ใช้ id ที่ normalize แล้ว) ไว้ด้านบนของ list
  }

  function removeCategory(id: string) { // ฟังก์ชันลบหมวดหมู่
    if (id === FALLBACK_CAT_ID && categories.length === 1) return; // ถ้าเหลือหมวด fallback หมวดเดียว ห้ามลบ
    setCategories((prev) => prev.filter((x) => x.id !== id)); // กรองเอาหมวดที่ id ตรงกับที่ส่งมาออก
  }

  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // state เก็บหมวดหมู่ที่กำลังแก้ไข (null = โหมดเพิ่ม)

  function beginEditCategory(cat: Category) { // เริ่มแก้ไขหมวดหมู่
    setEditingCategory({ ...cat, id: cat.id.toLowerCase() }); // เซ็ตหมวดที่จะแก้ไขลง state และ normalize id ให้เป็นตัวเล็ก
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0); // เลื่อนหน้าจอกลับขึ้นบนอย่างนุ่มนวล (ให้เห็นฟอร์มหมวดหมู่)
  }

  function saveEditCategory(next: Category, originalId?: string) { // เซฟผลการแก้ไขหมวดหมู่
    const fromId = (originalId || editingCategory?.id || "").toLowerCase(); // id เดิมก่อนแก้ (ใช้ parameter ก่อน ถ้าไม่มีใช้จาก state)
    const toId = next.id.trim().toLowerCase(); // id ใหม่หลังแก้ (normalize เป็นตัวเล็กและ trim)
    if (!toId) return; // ถ้า id ใหม่ว่าง ไม่ทำอะไร

    if (categories.some((c) => c.id !== fromId && c.id === toId)) { // เช็กว่ามีหมวดอื่นใช้ id นี้อยู่แล้วหรือไม่
      alert(`มีรหัส "${toId}" อยู่แล้ว`); // ถ้าซ้ำแจ้งเตือน
      return;
    }

    setCategories((prev) => // อัปเดต categories
      prev.map((c) => (c.id === fromId ? { ...c, ...next, id: toId } : c)) // ถ้า id เดิมตรงกัน ให้ใช้ข้อมูลใหม่ทับ
    );

    if (fromId && fromId !== toId) { // ถ้ามีการเปลี่ยน id ใหม่ไม่เท่าของเดิม
      setProducts((prev) => // ต้อง sync category ในสินค้าให้ใช้ id ใหม่ด้วย
        prev.map((p) => (p.category === fromId ? { ...p, category: toId } : p))
      );
    }

    setEditingCategory(null); // เคลียร์สถานะแก้ไขหมวดหมู่
  }

  function cancelEditCategory() { // ยกเลิกการแก้ไขหมวดหมู่
    setEditingCategory(null); // ตั้ง editingCategory กลับเป็น null
  }

  // ---------- UI ----------
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900"> {/* พื้นหลังหน้า admin เป็นไล่สีแนวตั้ง */}
      <div className="flex"> {/* wrapper หลักของ sidebar + content */}
        {/* Sidebar */}
        <AdminSidebar
          open={sidebarOpen} // สถานะเปิด/ปิด sidebar (มือถือใช้ slide)
          onToggle={() => setSidebarOpen((v) => !v)} // ฟังก์ชันสลับสถานะ open
          current={tab} // tab ปัจจุบัน เพื่อไฮไลต์เมนูใน sidebar
          onChangeTab={setTab} // เวลาเปลี่ยน tab ให้ปรับ state tab
          onLogout={() => { // ฟังก์ชัน logout ที่ส่งให้ sidebar
            localStorage.removeItem("user"); // ลบ user จาก localStorage
            window.location.href = "/login"; // เด้งไปหน้า login
          }}
        />

        {/* Backdrop (มือถือ) */}
        <div
          className={[
            "fixed inset-0 z-30 bg-black/40 md:hidden", // ฉากหลังทึบดำบาง ๆ ปิด content ตอน sidebar เปิด (เฉพาะจอเล็ก)
            sidebarOpen ? "block" : "hidden", // แสดง/ซ่อนตาม sidebarOpen
          ].join(" ")}
          onClick={() => setSidebarOpen(false)} // คลิกที่ backdrop เพื่อปิด sidebar
          aria-hidden="true" // บอกว่า element นี้ไม่ใช่ focus target สำหรับ screen reader
        />

        {/* Content */}
        <main className="z-0 flex-1 p-4 sm:p-6 md:p-8 md:ml-64"> {/* พื้นที่เนื้อหาหลัก ขยับ margin-left ให้พอดีกับ sidebar บนจอ md+ */}
          {/* top bar — ปุ่มมุมมองผู้ใช้อยู่ขวาบนทุกแท็บ */}
          <div className="mb-4 flex items-center justify-between"> {/* แถบบนของหน้า admin */}
            <div className="flex items-center gap-3"> {/* กลุ่มซ้าย: hamburger + title */}
              {/* hamburger (ซ้าย) */}
              <button
                onClick={() => setSidebarOpen((v) => !v)} // กดเพื่อเปิด/ปิด sidebar
                className="grid h-10 w-10 place-items-center rounded-md bg-white/90 ring-1 ring-black/10 md:hidden" // ปุ่ม hamburger แสดงเฉพาะจอเล็ก
                aria-label="Toggle menu" // ป้ายสำหรับ screen reader
                aria-expanded={sidebarOpen} // บอกสถานะเปิด/ปิด menu
              >
                <div className="space-y-1.5">
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "translate-y-2 rotate-45" : ""}`} /> {/* แถบเส้นบน แปลงเป็นกากบาทเมื่อ open */}
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "opacity-0" : ""}`} /> {/* แถบกลาง หายไปเมื่อ open */}
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "-translate-y-2 -rotate-45" : ""}`} /> {/* แถบล่าง แปลงเป็นกากบาทเมื่อ open */}
                </div>
              </button>

              <h1 className="text-xl font-extrabold text-white drop-shadow-sm"> {/* ชื่อหัวข้อหน้า admin */}
                Admin Panel
              </h1>
            </div>

            <Link
              to="/"
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-black/10 hover:brightness-105" // ปุ่มกลับไปมุมมองผู้ใช้
            >
              มุมมองผู้ใช้
            </Link>
          </div>

          {/* tabs */}
          {tab === "dashboard" && ( // เมื่อ tab = dashboard แสดงส่วนสถิติ
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* กริดการ์ดสถิติ 1/2/3 คอลัมน์ตามขนาดหน้าจอ */}
              <StatCard title="จำนวนสินค้า" value={products.length} icon="🛒" /> {/* การ์ดแสดงจำนวนสินค้า */}
              <StatCard title="จำนวนหมวดหมู่" value={categories.length} icon="📦" /> {/* การ์ดแสดงจำนวนหมวดหมู่ */}
              <StatCard title="จำนวนผู้ใช้" value={users.length} icon="👤" /> {/* การ์ดแสดงจำนวนผู้ใช้ */}
            </section>
          )}

          {tab === "product" && ( // เมื่อ tab = product แสดงส่วนจัดการสินค้า
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]"> {/* layout: ฟอร์มกว้าง 420px + ตารางกินส่วนที่เหลือ */}
              <div className="lg:sticky lg:top-6 self-start"> {/* ฟอร์มสินค้าติดบนเมื่อเลื่อน (บนจอใหญ่) */}
                <ProductForm
                  initial={editingProduct} // ถ้ามีสินค้าที่กำลังแก้ไขให้ส่งเข้าไป
                  categories={categoryIds} // ส่ง id หมวดหมู่ให้เลือก
                  onSubmit={addOrUpdateProduct} // (product, isEdit) เมื่อบันทึกสินค้า
                  onCancel={() => setEditingProduct(null)} // เคลียร์โหมดแก้ไขเมื่อกดยกเลิก
                />
              </div>

              <div className="rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10 overflow-x-auto"> {/* กล่องตารางสินค้า */}
                <ProductTable
                  items={products} // ส่งรายการสินค้าทั้งหมดให้ตารางแสดง
                  categories={categoryIds} // หมวดหมู่สำหรับ filter ในตาราง
                  onEdit={(p) => setEditingProduct(p)} // กด "แก้ไข" ในตาราง → เซ็ต editingProduct เป็นสินค้านั้น
                  onDelete={removeProduct} // กด "ลบ" → เรียก removeProduct
                />
              </div>
            </section>
          )}

          {tab === "category" && ( // เมื่อ tab = category แสดงส่วนจัดการหมวดหมู่
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]"> {/* layout เหมือน product: ซ้ายฟอร์ม ขวา list */}
              <div className="lg:sticky lg:top-6 self-start"> {/* ฟอร์มหมวดหมู่ติดบนจอใหญ่ */}
                {editingCategory ? ( // ถ้ามีหมวดกำลังแก้ไข
                  <CategoryForm
                    initial={editingCategory} // ส่งหมวดที่ต้องแก้ไขเข้าไป
                    onSubmitEdit={(cat) => saveEditCategory(cat, editingCategory.id)} // เมื่อบันทึกการแก้ไขให้เรียก saveEditCategory
                    onCancelEdit={cancelEditCategory} // กดยกเลิกแก้ไข → เคลียร์ state
                    onAdd={() => {}} // ในโหมดแก้ไขไม่ใช้ onAdd เลยส่งฟังก์ชันว่าง ๆ
                    existingIds={categories.map((c) => c.id.toLowerCase())} // ✅ ส่ง id ทั้งหมด (ตัวเล็ก) ไปให้ฟอร์มใช้เช็กซ้ำเบื้องต้น
                  />
                ) : (
                  <CategoryForm
                    onAdd={addCategory} // ถ้าไม่มี editingCategory ให้ใช้โหมดเพิ่มหมวดใหม่
                    existingIds={categories.map((c) => c.id.toLowerCase())} // ✅ ส่ง id ทั้งหมดไปให้เช็กว่าซ้ำไหม
                  />
                )}
              </div>

              <div className="rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10 overflow-x-auto"> {/* กล่องรายการหมวดหมู่ */}
                <CategoryList
                  items={categories} // ส่งรายการหมวดทั้งหมดให้ list แสดง
                  onDelete={removeCategory} // ฟังก์ชันลบหมวดหมู่
                  onEdit={beginEditCategory} // กด "แก้ไข" ใน list → ไปตั้ง editingCategory แล้วเลื่อนขึ้นบน
                />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
