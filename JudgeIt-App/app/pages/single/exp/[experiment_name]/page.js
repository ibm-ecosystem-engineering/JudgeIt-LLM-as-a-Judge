"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid, Typography, CircularProgress } from "@mui/material";
import SingleEvaluationLeftBar from "@/components/judge/SingleEvaluationLeftBar";
import { useEffect, useRef, useState } from "react";

const ExperimentPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const hasEffectRun = useRef(false);
  const [serverData, setServerData] = useState([]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }
  const { experiment_name } = params; // Get the 'id' from the URL

  return (
    <>
      {session && (
        <Grid spacing={0} sx={{ flexGrow: 1 }} container>
          <Grid item xs={2}>
            <SingleEvaluationLeftBar />
          </Grid>
          <Grid item xs={8}>
            <Grid marginTop={"30px"} spacing={0} sx={{ flexGrow: 1 }} container>
              <Grid item xs={12}>
                <Typography
                  style={{
                    fontSize: "30px",
                    marginLeft: "25px",
                    color: "#3B3B3B",
                    fontWeight: "bold",
                    marginBottom: "15px",
                  }}
                >
                  Single Evaluation
                </Typography>
              </Grid>
              <Grid item xs={12} marginLeft={"25px"}>
                
              </Grid>

              <Grid item xs={12} marginLeft={"25px"} marginTop={"20px"}>
                
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default ExperimentPage;
