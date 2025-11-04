import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "./Button";

const base  = "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md";
const idle  = "text-black/60 hover:text-black";
const active = "text-violet-700";

export default function Navbar() {
  const [session, setSession] = useState<{ name: string; role: "admin"|"member" } | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const read = () => {
      try { setSession(JSON.parse(localStorage.getItem("user") || "null")); }
      catch { setSession(null); }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const NavItem = (to: string, label: string) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => [base, isActive ? active : idle].join(" ")}
    >
      {label}
    </NavLink>
  );

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const showAdminBtn = session?.role === "admin" && !pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg md:text-xl text-black">StyleHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {NavItem("/", "HOME")}
          {NavItem("/products", "CATEGORY")}
          {session ? (
            NavItem("/favorites", "FAVORITES")
          ) : (
            <Link to="/login" className={[base, idle].join(" ")}>FAVORITES</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              {/* ถ้าเป็นแอดมินนอกหน้า /admin → โชว์เฉพาะปุ่ม ADMIN ไม่โชว์ชื่อซ้ำ */}
              {showAdminBtn ? (
                <Link
                  to="/admin"
                  className="rounded-full bg-black text-white px-4 py-2 text-sm font-semibold shadow hover:brightness-110"
                  title="กลับหน้าแอดมิน"
                >
                  ADMIN
                </Link>
              ) : (
                <span className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold">
                  {session.name}
                </span>
              )}

              <button
                onClick={logout}
                className="rounded-full bg-violet-700 text-white px-4 py-2 text-sm font-semibold hover:brightness-110"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-violet-700 text-white px-4 py-2 text-sm font-semibold"
              >
                REGISTER
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
