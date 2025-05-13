"use client";

import { CacheKey } from "@/services/constant";
import { cacheSet } from "@/lib/cache";
import { getTimestamp } from "@/lib/time";
import { useEffect } from "react";

export default function ({ params }: { params: { code: string } }) {
  useEffect(() => {
    // expires 30 days
    const expires = 2592000;
    const expiresAt = getTimestamp() + expires;

    cacheSet(CacheKey.InviteCode, params.code, expiresAt);
    console.log("cache invite code", params.code, expiresAt);
    window.location.href = "/";
  }, [params.code]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      loading...
    </div>
  );
}
