import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({ label, error, className="", ...rest }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-black mb-1">{label}</label>
      <input
        {...rest}
        className={
          "w-full rounded-xl border bg-white px-4 py-2 outline-none focus:border-black/40 " +
          (error ? "border-rose-400" : "border-black/20") +
          " " + className
        }
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
