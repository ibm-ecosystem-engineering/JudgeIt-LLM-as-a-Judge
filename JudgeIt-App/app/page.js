"use client";
import PageTitle from "@/components/globals/PageTitle";
import { useSession, signOut } from "next-auth/react";
import SignIn from '@/components/globals/SignIn'

export default function Home() {
  const { data: session, status } = useSession();
 

  return (
    <div style={{ marginRight: "20px" }}>
      {!session && <SignIn />}
    </div>
  );
}
