// src/components/Navbar.tsx
import { Link, NavLink } from "react-router-dom";
import Button from "./Button";

const base = "uppercase font-semibold tracking-wide text-sm md:text-base transition px-2 py-1 rounded-md";
const idle = "text-black/60 hover:text-black";
const active = "text-violet-700";

export default function Navbar() {
  const NavItem = (to: string, label: string) => (
    <NavLink
      to={to}
      end={to === "/"} // "/" จะ active แค่หน้า root
      className={({ isActive }) => [base, isActive ? active : idle].join(" ")}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg md:text-xl text-black">StyleHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {NavItem("/", "HOME")}
          {NavItem("/products", "PRODUCT")}
          {NavItem("/favorites", "FAVORITE")}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button label="LOGIN" variant="primary" size="lg" className="rounded-full bg-gray-900 text-white shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-gray-900/30" />
          </Link>
          <Link to="/register">
            <Button label="REGISTER" variant="primary" size="lg" className="rounded-full bg-violet-700 text-white shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-violet-700/30" />
          </Link>
        </div>

        <div className="md:hidden">
          <Link to="/login">
            <Button label="LOGIN" variant="primary" size="sm" className="rounded-full bg-gray-900 text-white" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
