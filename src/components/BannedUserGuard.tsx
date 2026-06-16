"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function BannedUserGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "BannedUser") {
      toast.error("Your account has been suspended.");
      signOut({ callbackUrl: "/" });
    }
  }, [session]);

  return null;
}
