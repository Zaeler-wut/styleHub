// Navbar.tsx
// แถบเมนูด้านบนของเว็บ ใช้แสดงโลโก้, เมนูหลัก (Home / Category / Favorites)
// และปุ่ม Login / Register หรือชื่อผู้ใช้ + Logout พร้อมรองรับทั้งเดสก์ท็อปและมือถือ

import { Link, NavLink, useLocation } from "react-router-dom"; // ใช้ Link/NavLink สำหรับลิงก์เปลี่ยนหน้า และ useLocation เพื่อรู้ path ปัจจุบัน
import { useEffect, useState } from "react"; // ใช้ useState เก็บสถานะในหน้า และ useEffect จัดการ side-effect
import Button from "./Button"; // ปุ่ม UI ที่สร้างไว้ใช้ซ้ำ (ไฟล์นี้ยังไม่ได้ใช้ แต่เตรียมไว้สำหรับขยายในอนาคต)

// คลาสพื้นฐานของลิงก์เมนูแต่ละอัน
const base =
  "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md";
// คลาสเมื่อเมนูอยู่สถานะปกติ
const idle = "text-black/60 hover:text-black";
// คลาสเมื่อเมนูอยู่หน้าเดียวกับที่เปิด (active)
const active = "text-violet-700";

export default function Navbar() {
  // session เก็บข้อมูลผู้ใช้ที่ล็อกอิน เช่น ชื่อ และบทบาท (admin/member)
  // ถ้ายังไม่ล็อกอินจะเป็น null
  const [session, setSession] = useState<{
    name: string;
    role: "admin" | "member";
  } | null>(null);

  // pathname คือ URL path ปัจจุบัน เช่น "/", "/products"
  const { pathname } = useLocation();

  // สถานะเปิด/ปิดเมนูสำหรับหน้าจอมือถือ (hamburger menu)
  const [open, setOpen] = useState(false);

  // อ่านข้อมูล session จาก localStorage ตอน component ถูกสร้างขึ้น
  // และสมัครฟัง event "storage" เพื่อ sync การล็อกอิน/ล็อกเอาต์ข้ามแท็บเบราว์เซอร์
  useEffect(() => {
    const read = () => {
      try {
        setSession(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setSession(null);
      }
    };

    read(); // อ่านข้อมูลครั้งแรกตอน mount
    window.addEventListener("storage", read); // ฟังการเปลี่ยนแปลงของ localStorage ข้ามแท็บ

    return () => window.removeEventListener("storage", read); // ทำความสะอาดเมื่อ component ถูก unmount
  }, []);

  // เมื่อมีการเปลี่ยนหน้า (pathname เปลี่ยน) ให้ปิดเมนูมือถืออัตโนมัติ
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ฟังก์ชันย่อยสร้าง NavLink สำหรับเมนูแต่ละอัน
  // จะเลือกคลาส active หรือ idle ตามค่า isActive จาก react-router
  const NavItem = (to: string, label: string) => (
    <NavLink
      to={to}
      // กำหนด end เฉพาะ path "/" เพื่อไม่ให้ชนกับ path ย่อยอื่น
      end={to === "/"}
      className={({ isActive }) =>
        [base, isActive ? active : idle].join(" ")
      }
    >
      {label}
    </NavLink>
  );

  // ฟังก์ชันออกจากระบบ:
  // 1) ลบข้อมูล user ออกจาก localStorage
  // 2) reload หน้าเพื่อเคลียร์ state ทั้งหมดที่เกี่ยวข้อง
  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  // กำหนดเงื่อนไขแสดงปุ่ม ADMIN:
  // - แสดงเฉพาะเมื่อผู้ใช้เป็น admin
  // - และตอนนี้ไม่ได้อยู่ภายใต้ path /admin อยู่แล้ว
  const showAdminBtn =
    session?.role === "admin" && !pathname.startsWith("/admin");

  return (
    // header เป็นแถบด้านบนสุดติดขอบหน้าจอ:
    // - sticky top-0: เลื่อนหน้าจอแล้ว navbar ยังคงอยู่ด้านบน
    // - มีเส้นขอบด้านล่าง และพื้นหลังสีขาวโปร่งเล็กน้อย
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      {/* nav เป็นคอนเทนเนอร์ภายใน จัดตำแหน่งโลโก้และเมนูให้กึ่งกลาง และจำกัดความกว้างสูงสุด */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        {/* ส่วนโลโก้ / ชื่อแบรนด์ กดแล้วกลับหน้าแรก */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-black md:text-xl">
            StyleHub
          </span>
        </Link>

        {/* เมนูหลักฝั่งซ้าย (โหมดเดสก์ท็อป) */}
        <div className="hidden items-center gap-10 md:flex">
          {NavItem("/", "HOME")}
          {NavItem("/products", "CATEGORY")}
          {session ? (
            // ถ้าล็อกอินแล้ว → FAVORITES เป็น NavLink ปกติ
            NavItem("/favorites", "FAVORITES")
          ) : (
            // ถ้ายังไม่ล็อกอิน → คลิก FAVORITES จะพาไปหน้า login
            <Link to="/login" className={[base, idle].join(" ")}>
              FAVORITES
            </Link>
          )}
        </div>

        {/* โซนปุ่มฝั่งขวา (โหมดเดสก์ท็อป) */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            // กรณีล็อกอินแล้ว
            <>
              {showAdminBtn ? (
                // ถ้าเป็น admin และไม่ได้อยู่หน้า /admin → แสดงปุ่ม ADMIN
                <Link
                  to="/admin"
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                  title="ไปหน้าแอดมิน"
                >
                  ADMIN
                </Link>
              ) : (
                // ถ้าอยู่ใน /admin หรือไม่ต้องแสดงปุ่ม → โชว์ชื่อผู้ใช้แทน
                <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                  {session.name}
                </span>
              )}

              {/* ปุ่ม LOGOUT สำหรับออกจากระบบ */}
              <button
                onClick={logout}
                className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                LOGOUT
              </button>
            </>
          ) : (
            // กรณียังไม่ล็อกอิน → แสดงปุ่ม LOGIN และ REGISTER
            <>
              <Link
                to="/login"
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white"
              >
                REGISTER
              </Link>
            </>
          )}
        </div>

        {/* ปุ่มเมนู Hamburger สำหรับหน้าจอมือถือ (แสดงเฉพาะ md ลงไป) */}
        <button
          className="grid h-10 w-10 place-items-center rounded-md ring-1 ring-black/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {/* เส้นสามขีดของ hamburger ที่แปลงร่างเป็นกากบาทเมื่อเมนูถูกเปิด */}
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 rounded bg-black transition ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded bg-black transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded bg-black transition ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* เมนูแบบ slide-down สำหรับมือถือ */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        {/* กล่องด้านในของเมนูมือถือ */}
        <div className="mx-3 mb-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow">
          <div className="flex flex-col gap-3">
            {/* เมนูหลักในมุมมองมือถือ */}
            {NavItem("/", "HOME")}
            {NavItem("/products", "CATEGORY")}
            {session ? (
              NavItem("/favorites", "FAVORITES")
            ) : (
              <Link to="/login" className={[base, idle].join(" ")}>
                FAVORITES
              </Link>
            )}

            {/* เส้นคั่นระหว่างเมนูหลักกับปุ่มด้านล่าง */}
            <div className="my-2 h-px w-full bg-black/10" />

            {/* โซนปุ่มด้านล่างในเมนูมือถือ (แยกตามสถานะล็อกอิน) */}
            {session ? (
              // ถ้าล็อกอินแล้ว
              <>
                {showAdminBtn ? (
                  <Link
                    to="/admin"
                    className="rounded-lg bg-black px-4 py-2 text-center text-sm font-semibold text-white shadow hover:brightness-110"
                  >
                    ADMIN
                  </Link>
                ) : (
                  <div className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white">
                    {session.name}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              // ถ้ายังไม่ล็อกอิน
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-violet-700 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
