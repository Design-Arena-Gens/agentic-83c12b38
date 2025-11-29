"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout}>
      {children}
    </button>
  );
}
