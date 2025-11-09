"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTheme } from "next-themes";

const LogoIcon = ({ w, h, href = "/" }: { w?: number; h?: number; href?: string }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show default logo during SSR or before theme is resolved
  if (!mounted) {
    return (
      <Link href={href}>
        <Image
          src={"/Logo_light.png"}
          width={w ?? 40}
          height={h ?? 40}
          alt="ColabDev"
          className="object-contain"
        />
      </Link>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/Logo_dark.png" : "/Logo_light.png";

  return (
    <Link href={href}>
      <Image
        src={logoSrc}
        width={w ?? 40}
        height={h ?? 40}
        
        alt="ColabDev"
        priority
        className="object-contain hover:opacity-80 h-20 w-20 rounded-full transition-opacity"
      />
    </Link>
  );
};

export default LogoIcon;
