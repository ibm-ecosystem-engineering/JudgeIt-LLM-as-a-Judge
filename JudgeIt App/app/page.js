"use client";
import PageTitle from "@/components/globals/PageTitle";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (
      status != "loading" &&
      session &&
      session?.error === "RefreshAccessTokenError"
    ) {
      signOut({ callbackUrl: "/" });
    }
  }, [session, status]);

  return (
    <div style={{ marginRight: "20px" }}>
      <PageTitle title={"LLM Judge Application"} />
    </div>
  );
}
