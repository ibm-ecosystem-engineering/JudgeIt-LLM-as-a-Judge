"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid, Typography, CircularProgress } from "@mui/material";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import { useEffect, useRef, useState } from "react";
import { fetch_request_history_by_name_and_type } from "@/services/ManagemenBackendAPI";
import RatingSimilarityDataGrid from "@/components/judge/RatingSimilarityDataGrid";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";
import MultiTurnDataGrid from "@/components/judge/MultiturnDataGrid";
const ExperimentPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const hasEffectRun = useRef(false);
  const [serverData, setServerData] = useState(null);
  const { experiment_name } = params; // Get the 'id' from the URL

  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const data = await fetch_request_history_by_name_and_type(
        session.user.email,
        experiment_name,
        "single"
      );

      const rating_similarity = data.filter(
        (item) =>
          item.eval_type === API_TYPE_RATING ||
          item.eval_type === API_TYPE_SIMILARITY
      );

      const multi_turn = data.filter(
        (item) => item.eval_type === API_TYPE_MULTITURN
      );
      const sdata = {
        rating_similarity: rating_similarity,
        multi_turn: multi_turn,
      };
      setServerData(sdata);
    };

    if (session?.user.email) {
      fetch_data();
      hasEffectRun.current = true;
    }
  }, [session?.user.email, experiment_name]); // Empty dependency array, runs only once

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

  return (
    <>
      {session && (
        <Grid spacing={0} sx={{ flexGrow: 1 }} container>
          <Grid item xs={2}>
            <EvaluationHistoryLeftBar type={"single"} />
          </Grid>
          <Grid item xs={9}>
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
                  Single Answer Evaluation - {experiment_name}
                </Typography>
              </Grid>
              <Grid item xs={12} marginLeft={"25px"}>
                {serverData && serverData.rating_similarity.length > 0 && (
                  <RatingSimilarityDataGrid
                    serverData={serverData.rating_similarity}
                  />
                )}
              </Grid>
              <Grid item xs={12} marginLeft={"25px"}>
                {serverData && serverData.multi_turn.length > 0 && (
                  <MultiTurnDataGrid
                    serverData={serverData.multi_turn}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default ExperimentPage;
