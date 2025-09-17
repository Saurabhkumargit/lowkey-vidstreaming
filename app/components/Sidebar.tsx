"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: "/assets/icons/home.svg" },
  { href: "/feed", label: "Following", icon: "/assets/icons/following.svg" },
  { href: "/videos", label: "Library", icon: "/assets/icons/library.svg" },
  { href: "/profile", label: "History", icon: "/assets/icons/history.svg" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="flex w-16 md:w-64 shrink-0 h-[calc(100dvh-4rem)] sticky top-16 border-r border-white/10"
      style={{ backgroundColor: "#0f0f0f", color: "#e5e5e5" }}
    >
      <nav className="w-full p-2 md:p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition"
              style={{
                backgroundColor: active ? "#181818" : "transparent",
              }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-md"
                style={{
                  backgroundColor: active ? "#181818" : "transparent",
                }}
              >
                <img src={item.icon} alt={item.label} className="h-5 w-5" />
              </span>
              <span className="hidden md:inline text-[0.925rem] text-[#e5e5e5] group-hover:opacity-100">
                {item.label}
              </span>
              <style jsx>{`
                a.group:hover { background-color: #181818; }
              `}</style>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


