"use client";
import PageTitle from "@/components/globals/PageTitle";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
 

  return (
    <div style={{ marginRight: "20px" }}>
      {session && <PageTitle title={"LLM Judge Application"} />}
    </div>
  );
}
