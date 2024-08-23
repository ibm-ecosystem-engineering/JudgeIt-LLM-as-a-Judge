"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import IBMIcon from "./icons/IBMIcon";
import { LineWeight } from "@mui/icons-material";
import { Grid } from "@mui/material";

export default function SignInWithIBMId() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  return (
    <Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={10}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <button onClick={() => signIn("IBMid", { callbackUrl: callbackUrl })}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "5px",
                fontFamily: "IBM Plex Sans",
              }}
            >
              <IBMIcon />
              <span style={{ marginLeft: "5px" }}>Sign in with IBMid</span>
            </span>
          </button>
        </div>
      </Grid>
    </Grid>
  );
}
