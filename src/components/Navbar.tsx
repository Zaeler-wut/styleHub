// src/components/Navbar.tsx
import { Link, NavLink } from "react-router-dom";
import Button from "./Button";

// คลาสพื้นฐานของลิงก์เมนู
const base =
  "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md";
// เมนูปกติ (ไม่ active)
const idle = "text-black/60 hover:text-black";
// เมนู active ให้ “เปลี่ยนสี” ชัดเจน (ถ้าอยากเป็น pill เพิ่ม bg-gray-100 ต่อท้ายได้)
const active = "text-violet-700";

export default function Navbar() {
  // ยูทิลิตี้เรนเดอร์เมนู (ลดโค้ดซ้ำ)
  const NavItem = (to: string, label: string) => (
    <NavLink
      to={to}
      end={to === "/"} // ให้ "/" active เฉพาะเมื่ออยู่ root จริง
      className={({ isActive }) => [base, isActive ? active : idle].join(" ")}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* ซ้าย: โลโก้/แบรนด์ */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg md:text-xl text-black">StyleHub</span>
        </Link>

        {/* กลาง: เมนูหลัก (เดสก์ท็อป) */}
        <div className="hidden md:flex items-center gap-10">
          {NavItem("/", "HOME")}
          {NavItem("/products", "PRODUCT")}
          {NavItem("/favorites", "FAVORITE")}
        </div>

        {/* ขวา: ปุ่ม LOGIN/REGISTER (เดสก์ท็อป) */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button
              label="LOGIN"
              variant="primary"
              size="lg"
              className="
                rounded-full
                bg-gray-900      /* เข้ม: เทาเกือบดำ */
                text-white
                shadow-md
                hover:brightness-110
                focus:outline-none focus:ring-2 focus:ring-gray-900/30
              "
            />
          </Link>
          <Link to="/register">
            <Button
              label="REGISTER"
              variant="primary"
              size="lg"
              className="
                rounded-full
                bg-violet-700    /* เข้ม: ม่วงเข้ม (ต่างจาก LOGIN) */
                text-white
                shadow-md
                hover:brightness-110
                focus:outline-none focus:ring-2 focus:ring-violet-700/30
              "
            />
          </Link>
        </div>

        {/* มือถือ: โชว์ปุ่มย่อ (ใส่เฉพาะ LOGIN; ถ้าต้องการ REGISTER ด้วยให้เพิ่มได้) */}
        <div className="md:hidden">
          <Link to="/login">
            <Button
              label="LOGIN"
              variant="primary"
              size="sm"
              className="rounded-full bg-gray-900 text-white"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}
