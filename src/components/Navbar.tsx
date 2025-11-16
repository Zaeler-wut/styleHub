import { Link, NavLink, useLocation } from "react-router-dom"; // นำเข้า Link, NavLink และ hook useLocation จาก react-router-dom
import { useEffect, useState } from "react"; // นำเข้า useEffect และ useState สำหรับจัดการ state และ side-effect
import Button from "./Button"; // นำเข้าปุ่ม (ตอนนี้ยังไม่ได้ใช้ แต่เผื่อใช้ภายหลัง)

const base  = "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md"; // คลาสพื้นฐานของลิงก์เมนู
const idle  = "text-black/60 hover:text-black"; // คลาสเมื่อเมนูอยู่สถานะปกติ
const active = "text-violet-700"; // คลาสเมื่อเมนู active (อยู่หน้าปัจจุบัน)

export default function Navbar() { // คอมโพเนนต์ Navbar สำหรับแสดงเมนูด้านบน
  const [session, setSession] = useState<{ name: string; role: "admin"|"member" } | null>(null); // state เก็บข้อมูลผู้ใช้ที่ล็อกอิน (หรือ null ถ้ายังไม่ล็อกอิน)
  const { pathname } = useLocation(); // ดึง path ปัจจุบันจาก router
  const [open, setOpen] = useState(false);           // ← สถานะเมนูมือถือ (เปิด/ปิด)

  // อ่าน session + sync ข้ามแท็บ
  useEffect(() => { // ใช้ useEffect ตอน mount เพื่ออ่านข้อมูล user จาก localStorage และ sync เมื่อ storage เปลี่ยน
    const read = () => {
      try { setSession(JSON.parse(localStorage.getItem("user") || "null")); } // พยายาม parse ค่า user จาก localStorage
      catch { setSession(null); } // ถ้า parse พลาด ให้เคลียร์ session เป็น null
    };
    read(); // อ่านทันทีตอน mount
    window.addEventListener("storage", read); // ฟัง event storage เพื่อ sync การล็อกอิน/ออกข้ามแท็บ
    return () => window.removeEventListener("storage", read); // ลบ event listener เมื่อ component ถูก unmount
  }, []);

  // เปลี่ยนเส้นทาง -> ปิดเมนูมือถือ
  useEffect(() => { setOpen(false); }, [pathname]); // เมื่อ path เปลี่ยน ให้ปิดเมนูมือถือทันที

  const NavItem = (to: string, label: string) => ( // ฟังก์ชันย่อยสร้าง NavLink พร้อมจัดสไตล์ active/idle
    <NavLink
      to={to} // เส้นทางปลายทาง
      end={to === "/"} // ใช้ end เพื่อให้ / ตรงเป๊ะกับหน้า HOME
      className={({ isActive }) => [base, isActive ? active : idle].join(" ")} // เลือกคลาสตาม isActive
    >
      {label}
    </NavLink>
  );

  const logout = () => { // ฟังก์ชันออกจากระบบ
    localStorage.removeItem("user"); // ลบข้อมูล user ใน localStorage
    window.location.reload(); // รีโหลดหน้าเพื่อเคลียร์ state ทั้งหมด
  };

  const showAdminBtn = session?.role === "admin" && !pathname.startsWith("/admin"); // แสดงปุ่ม ADMIN เฉพาะเมื่อเป็น admin และไม่ได้อยู่ในหน้า /admin

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur"> {/* แถบบนสุดติดขอบหน้าจอ มีพื้นหลังขาวโปร่งและเส้นขอบล่าง */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4"> {/* คอนเทนเนอร์ภายใน navbar จัดระยะห่าง ซ้าย-ขวา */}
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2"> {/* โลโก้/ชื่อเว็บ ลิงก์กลับหน้าแรก */}
          <span className="text-lg font-bold text-black md:text-xl">StyleHub</span> {/* ชื่อแบรนด์ */}
        </Link>

        {/* เมนูเดสก์ท็อป */}
        <div className="hidden items-center gap-10 md:flex"> {/* เมนูหลักซ้ายมือ (แสดงเฉพาะจอ md ขึ้นไป) */}
          {NavItem("/", "HOME")} {/* ลิงก์ไปหน้า HOME */}
          {NavItem("/products", "CATEGORY")} {/* ลิงก์ไปหน้าหมวดหมู่/สินค้า */}
          {session ? ( // ถ้าล็อกอินแล้ว
            NavItem("/favorites", "FAVORITES") // ลิงก์ Favorites แบบ NavLink ปกติ
          ) : (
            <Link to="/login" className={[base, idle].join(" ")}>FAVORITES</Link> // ถ้ายังไม่ล็อกอิน ให้ลิงก์ไปหน้า login แทน
          )}
        </div>

        {/* ปุ่มขวาบนเดสก์ท็อป */}
        <div className="hidden items-center gap-3 md:flex"> {/* โซนปุ่มขวา (LOGIN/REGISTER หรือชื่อ + LOGOUT) */}
          {session ? ( // ล็อกอินแล้ว
            <>
              {showAdminBtn ? ( // แสดงปุ่ม ADMIN ถ้าผู้ใช้เป็น admin และตอนนี้ไม่ได้อยู่หน้า admin
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
          ) : ( // ยังไม่ล็อกอิน
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
          className="grid h-10 w-10 place-items-center rounded-md ring-1 ring-black/10 md:hidden" // ปุ่มเมนูมือถือ (แสดงเฉพาะจอเล็ก)
          onClick={() => setOpen((v) => !v)} // คลิกสลับเปิด/ปิดเมนู
          aria-label="Toggle menu" // ป้ายช่วยอ่านหน้าจอ
          aria-expanded={open} // บอกสถานะเปิด/ปิดเมนูสำหรับ screen reader
        >
          <div className="space-y-1.5"> {/* เส้นสามขีดของ hamburger / หรือรูปกากบาทตอน open */}
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
        }`} // กล่องเมนูมือถือแบบเลื่อนลง/ซ่อน ด้วยการเปลี่ยน max-height
      >
        <div className="mx-3 mb-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow"> {/* กล่องเมนูภายในสำหรับมือถือ */}
          <div className="flex flex-col gap-3"> {/* วางเมนูแนวตั้งเว้นระยะห่าง */}
            {NavItem("/", "HOME")} {/* เมนู HOME บนมือถือ */}
            {NavItem("/products", "CATEGORY")} {/* เมนู CATEGORY บนมือถือ */}
            {session ? (
              NavItem("/favorites", "FAVORITES") // ถ้าล็อกอิน แสดง Favorites เป็น NavLink
            ) : (
              <Link to="/login" className={[base, idle].join(" ")}>FAVORITES</Link> // ถ้ายังไม่ล็อกอิน ส่งไปหน้า login
            )}

            <div className="my-2 h-px w-full bg-black/10" /> {/* เส้นคั่นเมนูหลักกับปุ่มด้านล่าง */}

            {session ? ( // โซนปุ่มสำหรับผู้ใช้ที่ล็อกอินแล้ว (มือถือ)
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
            ) : ( // โซนปุ่มสำหรับผู้ใช้ที่ยังไม่ล็อกอิน (มือถือ)
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
