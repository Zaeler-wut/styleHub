import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";             // ← เพิ่ม
import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";

// mock data
import productsData from "../data/products.json";
import categoriesData from "../data/categorys.json";

type User = { name: string; password: string; role: "member" | "admin" };
type Tab = "dashboard" | "product" | "category";

export default function AdminPage() {
  // ------- guard: ต้องเป็น admin เท่านั้น -------
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u || u.role !== "admin") {
        // ไม่ใช่แอดมิน → ส่งไปหน้า login
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // ------- state -------
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // mock -> products
  const products = (productsData as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
  }));

  // mock -> categories (เอาเฉพาะ id)
  const categories = Array.from(
    new Set(
      (categoriesData as Array<{ id?: string }>)
        .map((c) => c.id)
        .filter(Boolean)
    )
  ) as string[];

  // users จาก localStorage
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(Array.isArray(arr) ? arr : []);
    } catch {
      setUsers([]);
    }
  }, []);

  // ------- UI -------
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
              {/* ปุ่มไปมุมมองผู้ใช้ */}
              <Link
                to="/"                           // ← ถ้าอยากไปหน้า /products ให้เปลี่ยนเป็น "/products"
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-black/10 hover:brightness-105"
                title="ดูมุมมองผู้ใช้"
              >
                มุมมองผู้ใช้
              </Link>

              {/* ปุ่มเมนู (แสดงเฉพาะจอเล็ก) */}
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
            <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
              <h2 className="mb-4 text-lg font-bold">รายการสินค้า</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-black/70">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">ชื่อสินค้า</th>
                      <th className="px-3 py-2">หมวดหมู่</th>
                      <th className="px-3 py-2">ราคา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-black/5">
                        <td className="px-3 py-2">{p.id}</td>
                        <td className="px-3 py-2 font-semibold">{p.name}</td>
                        <td className="px-3 py-2">{p.category}</td>
                        <td className="px-3 py-2">{p.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "category" && (
            <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-black/10">
              <h2 className="mb-4 text-lg font-bold">รายการหมวดหมู่</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((c) => (
                  <li
                    key={c}
                    className="rounded-xl bg-white px-3 py-2 shadow ring-1 ring-black/10"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
