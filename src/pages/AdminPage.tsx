// src/pages/AdminPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";

import productsData from "../data/products.json";
import categoriesData from "../data/categorys.json";

import { type Product } from "../types/product";
import { loadProducts, saveProducts } from "../services/storage";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

// ▼ หมวดหมู่
import { type Category } from "../types/category";
import { loadCategories, saveCategories } from "../services/categoryStorage";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

type Tab = "dashboard" | "product" | "category";
type User = { name: string; password: string; role: "member" | "admin" };

const FALLBACK_CAT_ID = "uncategorized";

export default function AdminPage() {
  // ------- guard -------
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || u.role !== "admin") window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const [tab, setTab] = useState<Tab>("product");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ---------- Categories (อ่านจากไฟล์ + localStorage) ----------
  const initialCategoriesFromFile: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    (categoriesData as Array<{ id?: string; name?: string; image?: string }>).forEach((raw) => {
      const id = (raw.id || "").trim();
      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: raw.name?.trim() || undefined,
          image: raw.image?.trim() || undefined,
        });
      } else {
        const prev = map.get(id)!;
        map.set(id, {
          id,
          name: prev.name || (raw.name?.trim() || undefined),
          image: prev.image || (raw.image?.trim() || undefined),
        });
      }
    });

    if (map.size === 0) map.set(FALLBACK_CAT_ID, { id: FALLBACK_CAT_ID });
    return Array.from(map.values());
  }, []);

  const [categories, setCategories] = useState<Category[]>(
    () => loadCategories(initialCategoriesFromFile)
  );

  useEffect(() => {
    if (categories.length === 0) {
      setCategories([{ id: FALLBACK_CAT_ID }]);
      return;
    }
    saveCategories(categories);
  }, [categories]);

  const categoryIds = categories.map((c) => c.id);

  // ---------- Products ----------
  const mockProducts: Product[] = (productsData as any[]).map((p) => ({
    id: Number(p.id),
    name: p.name,
    price: Number(p.price),
    category: p.category || FALLBACK_CAT_ID,
    storeLink: p.storeLink || "",
    description: p.description || "",
    authentic: !!p.authentic,
    images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
    isFavorite: !!p.isFavorite,
  }));

  const [products, setProducts] = useState<Product[]>(
    () => loadProducts(mockProducts)
  );

  useEffect(() => {
    const valid = new Set(categoryIds);
    const fixed = products.map((p) =>
      valid.has(p.category) ? p : { ...p, category: FALLBACK_CAT_ID }
    );
    saveProducts(fixed);
  }, [products, categoryIds]);

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

  // ---------- ฟอร์มสินค้า ----------
  const [editing, setEditing] = useState<Product | null>(null);
  function addOrUpdate(p: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...p };
        return next;
      }
      return [p, ...prev];
    });
    setEditing(null);
  }
  function remove(id: number) {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }

  // ---------- จัดการหมวดหมู่ ----------
  function addCategory(c: Category) {
    const id = c.id.trim().toLowerCase();
    if (!id) return;
    setCategories((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
      return [{ ...c, id }, ...prev];
    });
  }
  function removeCategory(id: string) {
    if (id === FALLBACK_CAT_ID && categories.length === 1) return;
    setCategories((prev) => prev.filter((x) => x.id !== id));
  }

  // ✅ โหมดแก้ไขหมวดหมู่ (prefill แบบฟอร์ม)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // เริ่มแก้ไข (รับ cat ที่ merge แล้วจาก CategoryList)
  function beginEditCategory(cat: Category) {
    // ทำให้ id เป็นตัวเล็กเสมอ (ให้ไปแมตช์กับระบบ)
    setEditingCategory({ ...cat, id: cat.id.toLowerCase() });
    // เลื่อนสกรอลล์ขึ้นบนเล็กน้อยให้เห็นฟอร์ม
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  // บันทึกการแก้ไขจากฟอร์ม
  function saveEditCategory(next: Category, originalId?: string) {
    const fromId = (originalId || editingCategory?.id || "").toLowerCase();
    const toId = next.id.trim().toLowerCase();
    if (!toId) return;

    // กันซ้ำ id (ยกเว้นตัวเดิม)
    if (categories.some((c) => c.id !== fromId && c.id === toId)) {
      alert(`มีรหัส "${toId}" อยู่แล้ว`);
      return;
    }

    // อัปเดต categories
    setCategories((prev) =>
      prev
        .map((c) => (c.id === fromId ? { ...c, ...next, id: toId } : c))
        // กันเผื่อ onEdit ส่ง id ใหม่ไม่ตรงเคส
        .map((c) => ({ ...c, id: c.id.toLowerCase() }))
    );

    // อัปเดตสินค้าให้ชี้ไป id ใหม่ถ้ามีการเปลี่ยน
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
                initial={editing}
                categories={categoryIds.length ? categoryIds : [FALLBACK_CAT_ID]}
                onSubmit={addOrUpdate}
                onCancel={() => setEditing(null)}
              />

              <ProductTable
                items={products}
                categories={categoryIds.length ? categoryIds : [FALLBACK_CAT_ID]}
                onEdit={(p) => setEditing(p)}
                onDelete={remove}
              />
            </>
          )}

          {tab === "category" && (
            <>
              {/* ถ้าอยู่ในโหมดแก้ไข ให้โชว์ฟอร์มแบบ prefill แทนฟอร์มเพิ่ม */}
              {editingCategory ? (
                <CategoryForm
                  // ⚠️ ต้องให้ CategoryForm เพิ่ม prop เหล่านี้:
                  //   - initial?: Category
                  //   - onSubmitEdit?: (cat: Category, originalId: string) => void
                  //   - onCancelEdit?: () => void
                  //   (ยังคงมี onAdd อยู่ แต่จะไม่ถูกใช้ในโหมดแก้ไข)
                  initial={editingCategory}
                  onSubmitEdit={(cat) => saveEditCategory(cat, editingCategory.id)}
                  onCancelEdit={cancelEditCategory}
                  onAdd={() => { /* not used in edit mode */ }}
                />
              ) : (
                <CategoryForm onAdd={addCategory} />
              )}

              <CategoryList
                items={categories}
                onDelete={removeCategory}
                onEdit={beginEditCategory} // ← ส่งเข้าไปเพื่อ prefill
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
