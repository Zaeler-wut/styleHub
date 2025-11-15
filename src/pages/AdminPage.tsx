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

  // เริ่มที่ dashboard
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

  function addOrUpdateProduct(p: Product, isEdit: boolean) {
    const newId = Number(p.id);
    if (!Number.isFinite(newId) || newId <= 0) {
      alert("กรุณาใส่รหัสสินค้า (id) เป็นตัวเลขมากกว่า 0");
      return;
    }
    if (!isEdit) {
      const isDup = products.some((x) => Number(x.id) === newId);
      if (isDup) {
        const dup = products.find((x) => Number(x.id) === newId);
        alert(`ไอดี ${newId} มีอยู่แล้ว${dup ? ` (สินค้า: ${dup.name})` : ""}`);
        return;
      }
    }
    if (isEdit) {
      setProducts((prev) =>
        prev.map((x) => (Number(x.id) === newId ? { ...x, ...p, id: newId } : x))
      );
    } else {
      setProducts((prev) => [{ ...p, id: newId }, ...prev]);
    }
    setEditingProduct(null);
  }

  function removeProduct(id: number) {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  // ---------- หมวดหมู่ ----------
  function addCategory(c: Category) {
    const id = c.id.trim().toLowerCase();
    if (!id) return;

    // ✅ เช็คซ้ำและเตือนที่ชั้น AdminPage (กันหลุด)
    const isDup = categories.some((x) => x.id.toLowerCase() === id);
    if (isDup) {
      alert(`มีไอดีหมวดหมู่ "${id}" อยู่แล้ว`);
      return;
    }

    setCategories((prev) => [{ ...c, id }, ...prev]);
  }

  function removeCategory(id: string) {
    if (id === FALLBACK_CAT_ID && categories.length === 1) return;
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  function beginEditCategory(cat: Category) {
    setEditingCategory({ ...cat, id: cat.id.toLowerCase() });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function saveEditCategory(next: Category, originalId?: string) {
    const fromId = (originalId || editingCategory?.id || "").toLowerCase();
    const toId = next.id.trim().toLowerCase();
    if (!toId) return;

    if (categories.some((c) => c.id !== fromId && c.id === toId)) {
      alert(`มีรหัส "${toId}" อยู่แล้ว`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === fromId ? { ...c, ...next, id: toId } : c))
    );

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

        {/* Backdrop (มือถือ) */}
        <div
          className={[
            "fixed inset-0 z-30 bg-black/40 md:hidden",
            sidebarOpen ? "block" : "hidden",
          ].join(" ")}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Content */}
        <main className="z-0 flex-1 p-4 sm:p-6 md:p-8 md:ml-64">
          {/* top bar — ปุ่มมุมมองผู้ใช้อยู่ขวาบนทุกแท็บ */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* hamburger (ซ้าย) */}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-md bg-white/90 ring-1 ring-black/10 md:hidden"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
              >
                <div className="space-y-1.5">
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "translate-y-2 rotate-45" : ""}`} />
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-0.5 w-6 rounded bg-black transition ${sidebarOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </div>
              </button>

              <h1 className="text-xl font-extrabold text-white drop-shadow-sm">
                Admin Panel
              </h1>
            </div>

            <Link
              to="/"
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-black/10 hover:brightness-105"
            >
              มุมมองผู้ใช้
            </Link>
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
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="lg:sticky lg:top-6 self-start">
                <ProductForm
                  initial={editingProduct}
                  categories={categoryIds}
                  onSubmit={addOrUpdateProduct} // (product, isEdit)
                  onCancel={() => setEditingProduct(null)}
                />
              </div>

              <div className="rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10 overflow-x-auto">
                <ProductTable
                  items={products}
                  categories={categoryIds}
                  onEdit={(p) => setEditingProduct(p)}
                  onDelete={removeProduct}
                />
              </div>
            </section>
          )}

          {tab === "category" && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="lg:sticky lg:top-6 self-start">
                {editingCategory ? (
                  <CategoryForm
                    initial={editingCategory}
                    onSubmitEdit={(cat) => saveEditCategory(cat, editingCategory.id)}
                    onCancelEdit={cancelEditCategory}
                    onAdd={() => {}}
                    existingIds={categories.map((c) => c.id.toLowerCase())} // ✅ ส่งไปให้ฟอร์มเช็คเบื้องต้น
                  />
                ) : (
                  <CategoryForm
                    onAdd={addCategory}
                    existingIds={categories.map((c) => c.id.toLowerCase())} // ✅ ส่งไปให้ฟอร์มเช็คเบื้องต้น
                  />
                )}
              </div>

              <div className="rounded-2xl bg-white/90 p-3 shadow ring-1 ring-black/10 overflow-x-auto">
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
