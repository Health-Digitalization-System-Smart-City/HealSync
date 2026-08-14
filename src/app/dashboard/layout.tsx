"use client";

import { useState } from "react";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Providers>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
