import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "./Button";

const base  = "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md";
const idle  = "text-black/60 hover:text-black";
const active = "text-violet-700";

export default function Navbar() {
  const [session, setSession] = useState<{ name: string; role: "admin"|"member" } | null>(null);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);           // ← สถานะเมนูมือถือ

  // อ่าน session + sync ข้ามแท็บ
  useEffect(() => {
    const read = () => {
      try { setSession(JSON.parse(localStorage.getItem("user") || "null")); }
      catch { setSession(null); }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  // เปลี่ยนเส้นทาง -> ปิดเมนูมือถือ
  useEffect(() => { setOpen(false); }, [pathname]);

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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-black md:text-xl">StyleHub</span>
        </Link>

        {/* เมนูเดสก์ท็อป */}
        <div className="hidden items-center gap-10 md:flex">
          {NavItem("/", "HOME")}
          {NavItem("/products", "CATEGORY")}
          {session ? (
            NavItem("/favorites", "FAVORITES")
          ) : (
            <Link to="/login" className={[base, idle].join(" ")}>FAVORITES</Link>
          )}
        </div>

        {/* ปุ่มขวาบนเดสก์ท็อป */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              {showAdminBtn ? (
                <Link
                  to="/admin"
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
                  title="กลับหน้าแอดมิน"
                >
                  ADMIN
                </Link>
              ) : (
                <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                  {session.name}
                </span>
              )}
              <button
                onClick={logout}
                className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                LOGOUT
              </button>
            </>
          ) : (
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

        {/* ปุ่ม Hamburger (มือถือ) */}
        <button
          className="grid h-10 w-10 place-items-center rounded-md ring-1 ring-black/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 rounded bg-black transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 rounded bg-black transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 rounded bg-black transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {/* แผงเมนูมือถือ (slide-down) */}
      <div
        className={`md:hidden transition-[max-height] duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <div className="mx-3 mb-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow">
          <div className="flex flex-col gap-3">
            {NavItem("/", "HOME")}
            {NavItem("/products", "CATEGORY")}
            {session ? (
              NavItem("/favorites", "FAVORITES")
            ) : (
              <Link to="/login" className={[base, idle].join(" ")}>FAVORITES</Link>
            )}

            <div className="my-2 h-px w-full bg-black/10" />

            {session ? (
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
