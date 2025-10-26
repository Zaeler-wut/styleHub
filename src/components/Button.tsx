import React from "react";

type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const sizeMap: Record<Size, string> = {
  sm: "px-3 py-2 text-xs rounded-xl",
  md: "px-4 py-2 text-sm rounded-2xl",
  lg: "px-5 py-3 text-base rounded-2xl",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-black/30",
  outline:
    "bg-white text-black border border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20",
};

const Button: React.FC<ButtonProps> = ({
  label,
  type = "button",
  variant = "primary",
  size = "lg",
  fullWidth,
  className = "",
  disabled,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-semibold transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        sizeMap[size],
        variantMap[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
};

export default Button;
