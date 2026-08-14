"use client";

import { useState } from "react";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Healthcare Dashboard
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          className="relative rounded-lg p-2 hover:bg-slate-100"
          aria-label="Notifications"
        >
          🔔
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">Admin User</p>

              <p className="text-xs text-slate-500">Administrator</p>
            </div>

            <span className="text-slate-500">▼</span>
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-white shadow-lg">
              <button className="w-full px-4 py-3 text-left hover:bg-slate-50">
                Profile
              </button>

              <button className="w-full px-4 py-3 text-left hover:bg-slate-50">
                Settings
              </button>

              <button className="w-full px-4 py-3 text-left text-red-600 hover:bg-slate-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
