import React from "react";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
      {children}
    </div>
  );
}
