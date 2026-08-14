// @vitest-environment jsdom
//
// Regression guard for the "Functions cannot be passed directly to Client
// Components" error: the dashboard shell must render from serializable
// nav config (icon keys, not component references) resolved in the client.

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { SidebarNav } from "@/components/dashboard/sidebar";
import { getNavItems } from "@/components/dashboard/nav-config";
import { ROLES } from "@/lib/permissions";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Dashboard shell — nav rendering", () => {
  it("renders every nav item, resolving icon keys without errors", () => {
    const nav = getNavItems(ROLES.ADMIN, { tasks: 3, feedback: 2 });
    render(<SidebarNav items={nav} branchCount={13} />);

    for (const item of nav) {
      expect(
        screen.getByRole("link", { name: new RegExp(item.title) }),
      ).toBeTruthy();
    }

    // Live counts surface as nav badges.
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();

    // Real branch count in the footer status card.
    expect(screen.getByText("13 Clinics Connected")).toBeTruthy();
  });

  it("hides nav badges when counts are zero", () => {
    const nav = getNavItems(ROLES.ADMIN);
    render(<SidebarNav items={nav} branchCount={0} />);

    expect(screen.queryByText("0")).toBeNull();
    expect(screen.getByText("0 Clinics Connected")).toBeTruthy();
  });

  it("only renders items permitted for the role", () => {
    const nav = getNavItems(ROLES.ANALYST);
    render(<SidebarNav items={nav} branchCount={3} />);

    expect(screen.getByRole("link", { name: /Analytics/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Branches/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Users/i })).toBeNull();
  });
});
