"use client";

import { useState } from "react";
import { Check, ChevronDown, Lock, ShieldCheck, UserCheck } from "lucide-react";
import type { UserRole } from "@/config/roles";

const ROLES: Array<{
  role: UserRole;
  title: string;
  phoneAccess: "Visible" | "Masked";
  mutations: "Full (Edit + Delete)" | "Read-only";
  desc: string;
}> = [
  {
    role: "Admin",
    title: "System Administrator",
    phoneAccess: "Visible",
    mutations: "Full (Edit + Delete)",
    desc: "Full patient contact visibility and feedback management.",
  },
  {
    role: "Manager",
    title: "Clinic Operations Manager",
    phoneAccess: "Masked",
    mutations: "Read-only",
    desc: "Masked patient phone numbers; read-only operations.",
  },
  {
    role: "Analyst",
    title: "Healthcare Data Analyst",
    phoneAccess: "Masked",
    mutations: "Read-only",
    desc: "Masked patient phone numbers; analytics & read-only access.",
  },
];

export function RoleSelector({
  currentRole,
  onRoleChange,
  loading = false,
}: {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => Promise<void> | void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const activeRoleConfig =
    ROLES.find((r) => r.role === currentRole) || ROLES[0];

  async function handleSelect(role: UserRole) {
    setOpen(false);
    if (role !== currentRole) {
      await onRoleChange(role);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 active:scale-98 disabled:opacity-60"
        title="Simulate / Switch Dashboard Viewer Role"
      >
        <span className="flex size-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="size-3.5" />
        </span>

        <span>
          Viewing as:{" "}
          <strong className="text-slate-900">{activeRoleConfig.role}</strong>
        </span>

        <span className="text-slate-300">·</span>

        <span
          className={
            activeRoleConfig.phoneAccess === "Visible"
              ? "font-medium text-emerald-700"
              : "flex items-center gap-1 font-medium text-amber-700"
          }
        >
          {activeRoleConfig.phoneAccess === "Visible" ? (
            "Phone visible"
          ) : (
            <>
              <Lock className="size-2.5" />
              Phone masked
            </>
          )}
        </span>

        <ChevronDown className="size-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl duration-100">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Simulate Viewer Role (RBAC)
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Server enforces data masking & permissions per role.
              </p>
            </div>

            <div className="mt-1 space-y-1">
              {ROLES.map((item) => {
                const isSelected = item.role === currentRole;

                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelect(item.role)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition ${
                      isSelected
                        ? "border border-blue-200/80 bg-blue-50/80 text-blue-900"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <UserCheck className="size-3 text-slate-500" />
                        {item.role}
                      </span>
                      {isSelected && (
                        <Check className="size-3.5 text-blue-600" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        Phone:{" "}
                        <strong className="text-slate-700">
                          {item.phoneAccess}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>{item.mutations}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
