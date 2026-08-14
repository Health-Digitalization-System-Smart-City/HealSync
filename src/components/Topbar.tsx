"use client";

import { useState } from "react";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
     {/* Left side */}
<div className="flex items-center gap-3">
  <button
    onClick={onMenuClick}
    className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
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
          className="relative p-2 rounded-lg hover:bg-slate-100"
          aria-label="Notifications"
        >
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              A
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800">
                Admin User
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <span className="text-slate-500">
              ▼
            </span>
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
              <button className="w-full text-left px-4 py-3 hover:bg-slate-50">
                Profile
              </button>

              <button className="w-full text-left px-4 py-3 hover:bg-slate-50">
                Settings
              </button>

              <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-red-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}