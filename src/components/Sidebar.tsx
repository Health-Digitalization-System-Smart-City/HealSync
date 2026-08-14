"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleRoutes } from "@/config/roles";
import { currentUser } from "@/config/user";
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
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
  roleRoutes[currentUser.role].includes(link.href)
);
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static z-50 top-0 left-0 w-64 min-h-screen bg-slate-900 text-white transform transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Healthcare
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Management System
            </p>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-300 text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`block px-4 py-3 rounded-lg transition ${
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