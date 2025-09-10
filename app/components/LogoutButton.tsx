"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Logout
    </Button>
  );
}
