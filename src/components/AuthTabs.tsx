import { NavLink } from "react-router-dom";

const base = "flex-1 text-center py-3 rounded-full font-semibold transition";
const active = "bg-white text-black shadow";
const idle = "bg-black/10 text-black/70 hover:bg-black/20";

export default function AuthTabs() {
  return (
    <div className="mb-6 flex gap-3 rounded-full bg-black/10 p-2">
      <NavLink to="/login" end className={({isActive})=>[base, isActive?active:idle].join(" ")}>Login</NavLink>
      <NavLink to="/register" className={({isActive})=>[base, isActive?active:idle].join(" ")}>Register</NavLink>
    </div>
  );
}
