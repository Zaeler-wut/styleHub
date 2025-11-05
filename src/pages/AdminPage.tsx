// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

import { type Product } from "../types/product";
import { type Category } from "../types/category";

type Tab = "dashboard" | "product" | "category";
type User = { name: string; password: string; role: "member" | "admin" };

const FALLBACK_CAT_ID = "uncategorized";

// ✅ รับ state ส่วนกลางจาก App เป็น props (useState + set)
type Props = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
};

export default function AdminPage({
  products,
  setProducts,
  categories,
  setCategories,
}: Props) {
  // ------- guard: ต้องเป็น admin -------
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || u.role !== "admin") window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // ✅ เริ่มต้นที่ "dashboard" เสมอ
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categoryIds =
    categories.length > 0 ? categories.map((c) => c.id) : [FALLBACK_CAT_ID];

  // ผู้ใช้ (โชว์ใน dashboard)
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(Array.isArray(arr) ? arr : []);
    } catch {
      setUsers([]);
    }
  }, []);

  // ---------- สินค้า ----------
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function addOrUpdateProduct(p: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...p };
        return next;
      }
      return [p, ...prev];
    });
    setEditingProduct(null);
  }

  function removeProduct(id: number) {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  // ---------- หมวดหมู่ ----------
  function addCategory(c: Category) {
    const id = c.id.trim().toLowerCase();
    if (!id) return;
    setCategories((prev) => {
      if (prev.some((x) => x.id === id)) return prev; // กันซ้ำ
      return [{ ...c, id }, ...prev];
    });
  }

  function removeCategory(id: string) {
    if (id === FALLBACK_CAT_ID && categories.length === 1) return;
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }

  // แก้ไขหมวดหมู่แบบพรีฟิลฟอร์ม
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  function beginEditCategory(cat: Category) {
    setEditingCategory({ ...cat, id: cat.id.toLowerCase() });
    // เลื่อนขึ้นให้เห็นฟอร์ม
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function saveEditCategory(next: Category, originalId?: string) {
    const fromId = (originalId || editingCategory?.id || "").toLowerCase();
    const toId = next.id.trim().toLowerCase();
    if (!toId) return;

    // กันซ้ำ (ยกเว้นตัวเดิม)
    if (categories.some((c) => c.id !== fromId && c.id === toId)) {
      alert(`มีรหัส "${toId}" อยู่แล้ว`);
      return;
    }

    // อัปเดตหมวดหมู่
    setCategories((prev) =>
      prev.map((c) => (c.id === fromId ? { ...c, ...next, id: toId } : c))
    );

    // ถ้าเปลี่ยน id ให้สินค้าอ้างอิง id ใหม่ด้วย
    if (fromId && fromId !== toId) {
      setProducts((prev) =>
        prev.map((p) => (p.category === fromId ? { ...p, category: toId } : p))
      );
    }

    setEditingCategory(null);
  }

  function cancelEditCategory() {
    setEditingCategory(null);
  }

  // ---------- UI ----------
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900">
      <div className="flex">
        {/* Sidebar */}
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

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {/* top bar */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-white drop-shadow-sm">
              Admin Panel
            </h1>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-black/10 hover:brightness-105"
              >
                มุมมองผู้ใช้
              </Link>

              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="rounded-lg bg-white/90 px-3 py-1 text-sm shadow ring-1 ring-black/10 md:hidden"
              >
                {sidebarOpen ? "Hide" : "Menu"}
              </button>
            </div>
          </div>

          {/* tabs */}
          {tab === "dashboard" && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard title="จำนวนสินค้า" value={products.length} icon="🛒" />
              <StatCard title="จำนวนหมวดหมู่" value={categories.length} icon="📦" />
              <StatCard title="จำนวนผู้ใช้" value={users.length} icon="👤" />
            </section>
          )}

          {tab === "product" && (
            <>
              <ProductForm
                initial={editingProduct}
                categories={categoryIds}
                onSubmit={addOrUpdateProduct}
                onCancel={() => setEditingProduct(null)}
              />

              <ProductTable
                items={products}
                categories={categoryIds}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={removeProduct}
              />
            </>
          )}

          {tab === "category" && (
            <>
              {editingCategory ? (
                <CategoryForm
                  initial={editingCategory}
                  onSubmitEdit={(cat) => saveEditCategory(cat, editingCategory.id)}
                  onCancelEdit={cancelEditCategory}
                  onAdd={() => {}}
                />
              ) : (
                <CategoryForm onAdd={addCategory} />
              )}

              <CategoryList
                items={categories}
                onDelete={removeCategory}
                onEdit={beginEditCategory}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
