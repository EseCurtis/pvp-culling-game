"use server";

import { signIn } from "@/src/lib/auth";

export async function signInToBattle() {
  await signIn("google");
}

