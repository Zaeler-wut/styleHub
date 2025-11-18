// src/pages/AdminPage.tsx
// หน้าหลักสำหรับผู้ดูแลระบบ (Admin)
// - เช็กสิทธิ์ว่าเป็น admin ก่อนเข้าหน้านี้
// - มี 3 แท็บหลัก: Dashboard / จัดการสินค้า / จัดการหมวดหมู่
// - เชื่อมกับ state หลักของแอปเพื่อเพิ่ม–แก้ไข–ลบสินค้าและหมวดหมู่

import React, { useEffect, useState } from "react"; // ใช้ useEffect สำหรับ side-effect และ useState สำหรับเก็บสถานะหน้า
import { Link } from "react-router-dom"; // ใช้ Link สำหรับเปลี่ยนหน้าในรูปแบบ SPA

// ส่วนประกอบย่อยที่ใช้ในหน้า Admin
import AdminSidebar from "../components/AdminSidebar"; // แถบเมนูด้านซ้ายของผู้ดูแล
import StatCard from "../components/StatCard"; // การ์ดสรุปสถิติบน Dashboard
import ProductForm from "../components/ProductForm"; // ฟอร์มเพิ่ม/แก้ไขข้อมูลสินค้า
import ProductTable from "../components/ProductTable"; // ตารางรายการสินค้า
import CategoryForm from "../components/CategoryForm"; // ฟอร์มเพิ่ม/แก้ไขหมวดหมู่
import CategoryList from "../components/CategoryList"; // รายการหมวดหมู่สำหรับจัดการ

// ประเภทข้อมูลที่ใช้ในหน้านี้
import { type Product } from "../types/product"; // โครงสร้างข้อมูลสินค้า
import { type Category } from "../types/category"; // โครงสร้างข้อมูลหมวดหมู่

// ชนิดแท็บที่มีในหน้า Admin
type Tab = "dashboard" | "product" | "category";

// โครงสร้างข้อมูลผู้ใช้ที่อ่านจาก localStorage (ใช้โชว์สถิติเท่านั้น)
type User = { name: string; password: string; role: "member" | "admin" };

// id หมวดสำรอง (ใช้กรณีไม่มีหมวดหมู่ในระบบ)
const FALLBACK_CAT_ID = "uncategorized";

// props ที่หน้า AdminPage รับมาจาก App ระดับบน
type Props = {
  products: Product[]; // รายการสินค้าทั้งหมดในระบบ
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>; // ฟังก์ชันอัปเดตรายการสินค้า
  categories: Category[]; // รายการหมวดหมู่ทั้งหมด
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>; // ฟังก์ชันอัปเดตรายการหมวดหมู่
};

export default function AdminPage({
  products,
  setProducts,
  categories,
  setCategories,
}: Props) {
  // ---------- ส่วนเช็กสิทธิ์: อนุญาตเฉพาะผู้ใช้ที่เป็น admin ----------
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null"); // อ่านข้อมูล user ปัจจุบันจาก localStorage
      if (!u || u.role !== "admin") {
        // ถ้าไม่มี user หรือ role ไม่ใช่ admin ให้เด้งกลับหน้า login
        window.location.href = "/login";
      }
    } catch {
      // ถ้า parse ข้อมูลพลาด ให้กันไว้โดยส่งกลับหน้า login เช่นกัน
      window.location.href = "/login";
    }
  }, []);

  // ---------- state หลักของหน้านี้ ----------
  const [tab, setTab] = useState<Tab>("dashboard"); // เก็บว่าอยู่แท็บไหน (เริ่มต้นที่ dashboard)
  const [sidebarOpen, setSidebarOpen] = useState(true); // สถานะ sidebar เปิด/ปิด (มีผลกับมุมมองมือถือ)

  // เตรียมรายการ id ของหมวดหมู่สำหรับส่งให้ฟอร์มสินค้า/ตารางสินค้าใช้งาน
  const categoryIds =
    categories.length > 0 ? categories.map((c) => c.id) : [FALLBACK_CAT_ID];

  // เก็บข้อมูลผู้ใช้ทั้งหมด (ดึงจาก localStorage เพื่อไปแสดงบน Dashboard)
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(Array.isArray(arr) ? arr : []); // ถ้าไม่ใช่ array ให้ fallback เป็น []
    } catch {
      setUsers([]);
    }
  }, []);

  // ================== จัดการสินค้า ==================
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // ถ้ามีค่า แปลว่ากำลังแก้ไขสินค้านั้นอยู่

  // เพิ่มหรือแก้ไขสินค้า (ใช้ร่วมกันฟังก์ชันเดียว โดยบอก isEdit)
  function addOrUpdateProduct(p: Product, isEdit: boolean) {
    const newId = Number(p.id); // แปลง id จากฟอร์มให้เป็นตัวเลข

    // กันกรณี id ไม่ใช่ตัวเลข หรือ น้อยกว่าหรือเท่ากับ 0
    if (!Number.isFinite(newId) || newId <= 0) {
      alert("กรุณาใส่รหัสสินค้า (id) เป็นตัวเลขมากกว่า 0");
      return;
    }

    // ถ้าเป็นโหมด "เพิ่ม" ต้องเช็กว่ามี id ซ้ำหรือไม่
    if (!isEdit) {
      const isDup = products.some((x) => Number(x.id) === newId);
      if (isDup) {
        const dup = products.find((x) => Number(x.id) === newId);
        alert(`ไอดี ${newId} มีอยู่แล้ว${dup ? ` (สินค้า: ${dup.name})` : ""}`);
        return;
      }
    }

    if (isEdit) {
      // โหมดแก้ไข: map สินค้าเดิม แล้วอัปเดตตัวที่ id ตรงกัน
      setProducts((prev) =>
        prev.map((x) =>
          Number(x.id) === newId ? { ...x, ...p, id: newId } : x
        )
      );
    } else {
      // โหมดเพิ่มใหม่: นำสินค้าใหม่มาต่อด้านหน้า list
      setProducts((prev) => [{ ...p, id: newId }, ...prev]);
    }

    // หลังบันทึกเสร็จให้เคลียร์สถานะแก้ไข
    setEditingProduct(null);
  }

  // ลบสินค้าออกจากรายการ ตาม id ที่ส่งเข้ามา
  function removeProduct(id: number) {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  // ================== จัดการหมวดหมู่ ==================
  // เพิ่มหมวดหมู่ใหม่
  function addCategory(c: Category) {
    const id = c.id.trim().toLowerCase(); // ปรับ id ให้เป็นตัวพิมพ์เล็กและตัดช่องว่าง
    if (!id) return;

    // เช็กว่ามี id นี้อยู่แล้วในระบบหรือไม่
    const isDup = categories.some((x) => x.id.toLowerCase() === id);
    if (isDup) {
      alert(`มีไอดีหมวดหมู่ "${id}" อยู่แล้ว`);
      return;
    }

    // ถ้าไม่ซ้ำให้นำหมวดใหม่มาต่อด้านหน้า list
    setCategories((prev) => [{ ...c, id }, ...prev]);
  }

  // ลบหมวดหมู่
  function removeCategory(id: string) {
    // กันกรณีเหลือหมวด fallback เพียงอันเดียว ห้ามลบ
    if (id === FALLBACK_CAT_ID && categories.length === 1) return;
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }

  // เก็บหมวดหมู่ที่กำลังแก้ไข (ถ้า null แปลว่าใช้โหมดเพิ่ม)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // เข้าสู่โหมดแก้ไขหมวดหมู่
  function beginEditCategory(cat: Category) {
    setEditingCategory({ ...cat, id: cat.id.toLowerCase() }); // normalize id เป็นตัวเล็ก
    // เลื่อนหน้าจอกลับขึ้นไปด้านบนเพื่อให้เห็นฟอร์มแก้ไขชัด ๆ
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  // บันทึกผลการแก้ไขหมวดหมู่
  function saveEditCategory(next: Category, originalId?: string) {
    const fromId = (originalId || editingCategory?.id || "").toLowerCase(); // id เดิม
    const toId = next.id.trim().toLowerCase(); // id ใหม่หลังแก้
    if (!toId) return;

    // ถ้ามีหมวดอื่นใช้ id นี้อยู่แล้ว (ยกเว้นตัวที่กำลังแก้ไขเอง) ให้เตือนว่าซ้ำ
    if (categories.some((c) => c.id !== fromId && c.id === toId)) {
      alert(`มีรหัส "${toId}" อยู่แล้ว`);
      return;
    }

    // อัปเดตหมวดหมู่ใน state หลัก
    setCategories((prev) =>
      prev.map((c) => (c.id === fromId ? { ...c, ...next, id: toId } : c))
    );

    // ถ้าเปลี่ยน id ใหม่ไม่เท่าของเดิม ต้องไป sync ในฝั่งสินค้าให้ตาม id ใหม่ด้วย
    if (fromId && fromId !== toId) {
      setProducts((prev) =>
        prev.map((p) => (p.category === fromId ? { ...p, category: toId } : p))
      );
    }

    setEditingCategory(null); // ออกจากโหมดแก้ไข
  }

  // ยกเลิกการแก้ไขหมวดหมู่
  function cancelEditCategory() {
    setEditingCategory(null);
  }

  // ================== ส่วน UI / Layout ==================
  return (
    // พื้นหลังหลักของหน้า Admin เป็นไล่สีแนวตั้ง
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <div className="flex">
        {/* ---------- Sidebar ด้านซ้าย ---------- */}
        <AdminSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          current={tab}
          onChangeTab={setTab}
          onLogout={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        />

        {/* ฉากหลังทึบ (สำหรับปิด sidebar บนจอมือถือ) */}
        <div
          className={[
            "fixed inset-0 z-30 bg-black/40 md:hidden",
            sidebarOpen ? "block" : "hidden",
          ].join(" ")}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* ---------- พื้นที่เนื้อหาด้านขวา ---------- */}
        <main className="z-0 flex-1 p-4 sm:p-6 md:p-8 md:ml-64">
          {/* แถบบนสุด: ปุ่มเปิด sidebar + ปุ่มกลับไปมุมมองผู้ใช้ */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* ปุ่ม hamburger เปิด/ปิด sidebar (โชว์เฉพาะมือถือ) */}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-md bg-white/90 ring-1 ring-black/10 md:hidden"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
              >
                <div className="space-y-1.5">
                  <span
                    className={`block h-0.5 w-6 rounded bg-black transition ${
                      sidebarOpen ? "translate-y-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 rounded bg-black transition ${
                      sidebarOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 rounded bg-black transition ${
                      sidebarOpen ? "-translate-y-2 -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>

              <h1 className="text-xl font-extrabold text-white drop-shadow-sm">
                Admin Panel
              </h1>
            </div>

            {/* ปุ่มลัดกลับไปดูมุมมองผู้ใช้ทั่วไป */}
            <Link
              to="/"
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-black/10 hover:brightness-105"
            >
              มุมมองผู้ใช้
            </Link>
          </div>

          {/* ---------- แสดงเนื้อหาตามแท็บที่เลือก ---------- */}

          {/* 1) แท็บ Dashboard: แสดงสถิติภาพรวม */}
          {tab === "dashboard" && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard title="จำนวนสินค้า" value={products.length} icon="🛒" />
              <StatCard title="จำนวนหมวดหมู่" value={categories.length} icon="📦" />
              <StatCard title="จำนวนผู้ใช้" value={users.length} icon="👤" />
            </section>
          )}

          {/* 2) แท็บ Product: ฟอร์มสินค้า + ตารางสินค้า */}
          {tab === "product" && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
              {/* ฟอร์มเพิ่ม/แก้ไขสินค้า (ยึดด้านบนในจอใหญ่) */}
              <div className="self-start lg:sticky lg:top-6">
                <ProductForm
                  initial={editingProduct}
                  categories={categoryIds}
                  onSubmit={addOrUpdateProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              </div>

              {/* ตารางรายการสินค้า */}
              <div className="overflow-x-auto rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10">
                <ProductTable
                  items={products}
                  categories={categoryIds}
                  onEdit={(p) => setEditingProduct(p)}
                  onDelete={removeProduct}
                />
              </div>
            </section>
          )}

          {/* 3) แท็บ Category: ฟอร์มหมวด + รายการหมวดหมู่ */}
          {tab === "category" && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
              {/* ฟอร์มหมวดหมู่ (โหมดเพิ่ม / โหมดแก้ไข) */}
              <div className="self-start lg:sticky lg:top-6">
                {editingCategory ? (
                  <CategoryForm
                    initial={editingCategory}
                    onSubmitEdit={(cat) =>
                      saveEditCategory(cat, editingCategory.id)
                    }
                    onCancelEdit={cancelEditCategory}
                    onAdd={() => {}}
                    existingIds={categories.map((c) => c.id.toLowerCase())}
                  />
                ) : (
                  <CategoryForm
                    onAdd={addCategory}
                    existingIds={categories.map((c) => c.id.toLowerCase())}
                  />
                )}
              </div>

              {/* รายการหมวดหมู่ทั้งหมด */}
              <div className="overflow-x-auto rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10">
                <CategoryList
                  items={categories}
                  onDelete={removeCategory}
                  onEdit={beginEditCategory}
                />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
