"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid, Box, Button, Typography, CircularProgress } from "@mui/material";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import { useEffect, useRef, useState } from "react";
import { fetch_request_history_by_id } from "@/services/ManagemenBackendAPI";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";
import DisplayRequestHistoryRatingSimilarity from "@/components/judge/DisplayRequestHistoryRatingSimilarity";
import DisplayRequestHistoryMultiTurn from "@/components/judge/DisplayRequestHistoryMultiTurn";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

const ItemPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const hasEffectRun = useRef(false);
  const [serverData, setServerData] = useState(null);
  const { doc_id } = params; // Get the 'id' from the URL

  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const data = await fetch_request_history_by_id(
        session.user.email,
        doc_id
      );
      setServerData(data);
      console.log("history", data);
    };

    if (session?.user.email) {
      fetch_data();
      hasEffectRun.current = true;
    }
  }, [session?.user.email, doc_id]); // Empty dependency array, runs only once

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
      {session && serverData && (
        <Grid spacing={0} sx={{ flexGrow: 1 }} container>
          <Grid item xs={2}>
            <EvaluationHistoryLeftBar type={"single"} />
          </Grid>
          <Grid item xs={9}>
            <Grid marginTop={"30px"} spacing={0} sx={{ flexGrow: 1 }} container>
              <Grid item xs={12}>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    style={{
                      fontSize: "30px",
                      marginLeft: "25px",
                      color: "#3B3B3B",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    Single Answer Evaluation {serverData.eval_type}
                  </Typography>
                  <Button
                    size="small"
                    href="/pages/single"
                    startIcon={<ArrowBackOutlinedIcon />}
                  >
                    Back
                  </Button>
                </Box>
              </Grid>
              {(API_TYPE_RATING === serverData.eval_type ||
                API_TYPE_SIMILARITY === serverData.eval_type) && (
                <DisplayRequestHistoryRatingSimilarity
                  serverData={serverData}
                />
              )}
              {API_TYPE_MULTITURN === serverData.eval_type && (
                <DisplayRequestHistoryMultiTurn serverData={serverData} />
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default ItemPage;
