// src/components/users/UsersTable.tsx
import React from "react";
import type { User } from "../services/usersStorage";

type Props = {
  meName?: string | null;
  users: User[];
  adminCount: number;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  keyword: string;
  onKeyword: (q: string) => void;
};

export default function UsersTable({
  meName,
  users,
  adminCount,
  onEdit,
  onDelete,
  keyword,
  onKeyword,
}: Props) {
  const list = users.filter((u) => {
    const q = keyword.toLowerCase().trim();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">รายชื่อผู้ใช้</h3>
        <input
          placeholder="ค้นหาชื่อ/สิทธิ์…"
          className="min-w-[220px] rounded-full bg-white/90 px-4 py-2 text-sm shadow ring-1 ring-black/10"
          value={keyword}
          onChange={(e) => onKeyword(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white/90 shadow ring-1 ring-black/10">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">ชื่อผู้ใช้</th>
              <th className="px-4 py-2 text-left font-semibold">สิทธิ์</th>
              <th className="px-4 py-2 text-left font-semibold">การทำงาน</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-black/60">
                  ไม่พบบัญชีผู้ใช้
                </td>
              </tr>
            )}
            {list.map((u) => {
              const isMe = meName === u.name;
              const isOnlyAdmin = u.role === "admin" && adminCount <= 1;
              return (
                <tr key={u.name} className="border-t border-black/5">
                  <td className="px-4 py-2 font-semibold">{u.name}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(u)}
                        className="rounded-md bg-white px-3 py-1 shadow ring-1 ring-black/10 hover:bg-black/5"
                        title="แก้ไข"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        className="rounded-md bg-rose-600 px-3 py-1 text-white shadow hover:bg-rose-700 disabled:opacity-60"
                        title="ลบ"
                        disabled={isMe || isOnlyAdmin}
                      >
                        ลบ
                      </button>
                      {(isMe || isOnlyAdmin) && (
                        <span className="text-xs text-black/50">
                          {isMe ? "ห้ามลบตัวเอง" : "ห้ามลบแอดมินคนสุดท้าย"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
