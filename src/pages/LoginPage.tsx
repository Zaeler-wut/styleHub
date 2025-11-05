// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import AuthTabs from "../components/AuthTabs";
import AuthCard from "../components/AuthCard";
import TextField from "../components/TextField";
import baseUsers from "../data/user.json"; // ← admin อยู่ในไฟล์นี้

type User = { name: string; password: string; role: "admin" | "member" };

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errU, setErrU] = useState("");
  const [errP, setErrP] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setErrU(""); setErrP("");

    const u = username.trim();
    const p = password;

    if (!u) setErrU("กรุณากรอกชื่อผู้ใช้");
    if (!p) setErrP("กรุณากรอกรหัสผ่าน");
    if (!u || !p) return;

    // users จาก localStorage
    let localUsers: User[] = [];
    try {
      const raw = localStorage.getItem("users");
      const parsed = raw ? JSON.parse(raw) : [];
      localUsers = Array.isArray(parsed) ? parsed : [];
    } catch { localUsers = []; }

    // รวมกับ users จากไฟล์ (admin)
    const merged: User[] = [
      ...(Array.isArray(baseUsers) ? (baseUsers as User[]) : []),
      ...localUsers,
    ];

    const found = merged.find(x => x.name === u && x.password === p);
    if (!found) {
      setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // เก็บ session
    localStorage.setItem("user", JSON.stringify({ name: found.name, role: found.role }));

    // ✅ แยกเส้นทางตาม role
    if (found.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-pink-200 via-purple-500 to-purple-900 flex items-center justify-center px-4">
      <AuthCard>
        <AuthTabs />
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="Username"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            error={errU}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            error={errP}
          />

          {err && <div className="text-center text-sm font-semibold text-rose-600">{err}</div>}

          <button
            type="submit"
            className="w-full rounded-full bg-black text-white py-3 font-extrabold tracking-wide shadow-md ring-2 ring-black/20 hover:brightness-110"
          >
            LOGIN
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          ยังไม่มีบัญชี?
          <NavLink to="/register" className="ml-2 font-semibold text-rose-600 hover:underline">
            สมัครสมาชิก
          </NavLink>
        </div>
      </AuthCard>
    </div>
  );
}