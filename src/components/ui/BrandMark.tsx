import Image from "next/image";

interface BrandMarkProps {
  size?: "sm" | "lg";
  className?: string;
}

export function BrandMark({ size = "sm", className = "" }: BrandMarkProps) {
  const isLarge = size === "lg";
  const iconSize = isLarge ? 40 : 28;
  const aiText = isLarge ? "text-2xl" : "text-base";
  const nameText = isLarge ? "text-xl" : "text-[15px]";

  return (
    <span className={`inline-flex items-center gap-2 transition-transform duration-300 hover:scale-[1.03] ${className}`}>
      <Image
        src="/images/logo.png"
        alt="AI Educademy"
        width={iconSize}
        height={iconSize}
        className="rounded-lg transition-shadow duration-300 hover:shadow-md hover:shadow-indigo-500/20"
      />
      <span className="flex items-baseline gap-0.5 leading-none">
        <span
          className={`${aiText} font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent`}
        >
          AI
        </span>
        <span
          className={`${nameText} font-semibold tracking-tight text-[var(--color-text)]`}
        >
          Educademy
        </span>
      </span>
    </span>
  );
}
