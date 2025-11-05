// src/pages/AdminPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

import UsersTable from "../components/UsersTable";
import UserForm from "../components/UserForm";

import { type Product } from "../types/product";
import { type Category } from "../types/category";
import {
  loadUsers,
  saveUsers,
  countAdmins,
  removeUserFavorites,
  type User,
} from "../services/usersStorage";

type Tab = "dashboard" | "product" | "category" | "users";
const FALLBACK_CAT_ID = "uncategorized";

type Props = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
};

const USERS_KEY = "users";

export default function AdminPage({
  products,
  setProducts,
  categories,
  setCategories,
}: Props) {
  // ------- guard: ต้องเป็น admin -------
  const [me, setMe] = useState<User | null>(null);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || u.role !== "admin") window.location.href = "/login";
      else setMe(u);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // เริ่มที่ dashboard
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categoryIds =
    categories.length > 0 ? categories.map((c) => c.id) : [FALLBACK_CAT_ID];

  // ---------- Users ----------
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [keyword, setKeyword] = useState("");

  // โหลด users ครั้งแรก
  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  // ถ้า me มีอยู่ แต่ยังไม่ถูกบันทึกในคลัง users → ใส่ให้เลย (กันเคสสถิติเป็น 0)
  useEffect(() => {
    if (!me) return;
    setUsers((prev) => {
      if (prev.some((u) => u.name === me.name)) return prev;
      const next = [{ name: me.name, password: me.password, role: me.role }, ...prev];
      saveUsers(next);
      return next;
    });
  }, [me]);

  // บันทึก users เมื่อมีการเปลี่ยน
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  // sync ข้ามแท็บ/หน้าต่าง
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USERS_KEY) setUsers(loadUsers());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const adminCount = useMemo(() => countAdmins(users), [users]);

  const handleSubmitUser = (payload: User, isEdit: boolean) => {
    setUsers((prev) => {
      if (isEdit && editingUser) {
        // ถ้าลดสิทธิ์แอดมินคนสุดท้าย → ห้าม
        if (
          editingUser.role === "admin" &&
          payload.role !== "admin" &&
          adminCount <= 1
        ) {
          alert("ไม่สามารถลดสิทธิ์แอดมินคนสุดท้ายได้");
          return prev;
        }
        // ถ้ารหัสผ่านว่างตอนแก้ไข → คงรหัสเดิม
        const old = prev.find((u) => u.name === editingUser.name);
        const pass = payload.password.trim() || old?.password || "";
        const next = prev.map((u) =>
          u.name === editingUser.name
            ? { ...payload, name: editingUser.name, password: pass }
            : u
        );
        setEditingUser(null);
        return next;
      }

      // เพิ่มใหม่ (กันชื่อซ้ำ)
      if (prev.some((u) => u.name === payload.name)) {
        alert("มีชื่อผู้ใช้นี้อยู่แล้ว");
        return prev;
      }
      return [{ ...payload }, ...prev];
    });
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const handleDeleteUser = (u: User) => {
    if (me && u.name === me.name) {
      alert("ไม่สามารถลบบัญชีของตัวเองได้");
      return;
    }
    if (u.role === "admin" && adminCount <= 1) {
      alert("ไม่สามารถลบแอดมินคนสุดท้ายได้");
      return;
    }
    if (!confirm(`ต้องการลบบัญชี "${u.name}" ใช่ไหม?`)) return;
    setUsers((prev) => prev.filter((x) => x.name !== u.name));
    removeUserFavorites(u.name);
  };

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
      if (prev.some((x) => x.id === id)) return prev;
      return [{ ...c, id }, ...prev];
    });
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
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="จำนวนสินค้า" value={products.length} icon="🛒" />
              <StatCard title="จำนวนหมวดหมู่" value={categories.length} icon="🏷️" />
              <StatCard title="จำนวนผู้ใช้" value={users.length} icon="👤" />
              <StatCard title="แอดมิน" value={adminCount} icon="🛡️" />
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
                  onCancelEdit={() => setEditingCategory(null)}
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

          {tab === "users" && (
            <>
              <UserForm
                editing={editingUser}
                onSubmit={handleSubmitUser}
                onCancel={() => setEditingUser(null)}
              />
              <div className="h-2" />
              <UsersTable
                meName={me?.name ?? null}
                users={users}
                adminCount={adminCount}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                keyword={keyword}
                onKeyword={setKeyword}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
