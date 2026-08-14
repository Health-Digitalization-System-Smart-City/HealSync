"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleRoutes } from "@/config/roles";
import { currentUser } from "@/config/user";
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const allLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Feedback", href: "/dashboard/feedback" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Branches", href: "/dashboard/branches" },
    { name: "Services", href: "/dashboard/services" },
    { name: "Users", href: "/dashboard/users" },
  ];

  const links = allLinks.filter((link) =>
    roleRoutes[currentUser.role].includes(link.href),
  );
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 min-h-screen w-64 transform bg-slate-900 text-white transition-transform duration-300 md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-700 p-6">
          <div>
            <h2 className="text-xl font-bold">Healthcare</h2>

            <p className="mt-1 text-sm text-slate-400">Management System</p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-slate-300 md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`block rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
