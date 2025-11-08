"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTheme } from "next-themes";

const Logo = ({ w, h }: { w?: number; h?: number }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show default logo during SSR or before theme is resolved
  if (!mounted) {
    return (
      <Link href={"/"}>
        <Image
          src={"/Logo_with_name_light.png"}
          width={w ?? 150}
          height={h ?? 40}
          alt="ColabDev"
        />
      </Link>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/Logo_with_name_dark.png" : "/Logo_with_name_light.png";

  return (
    <Link href={"/"}>
      <Image
        src={logoSrc}
        width={w ?? 150}
        height={h ?? 40}
        alt="ColabDev"
        priority
      />
    </Link>
  );
};

export default Logo;
