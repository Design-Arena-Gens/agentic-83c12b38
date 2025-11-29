"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetcher(resource, init),
        revalidateOnFocus: true,
        refreshInterval: 7_000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
