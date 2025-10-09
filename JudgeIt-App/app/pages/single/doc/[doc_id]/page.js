"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid, Box, Button, Typography, CircularProgress } from "@mui/material";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import { useEffect, useRef, useState } from "react";
import { fetch_request_history_by_id } from "@/services/ManagemenBackendAPI";
import {
  API_TYPE_SINGLETURN,
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";
import DisplayRequestHistoryRatingSimilarity from "@/components/judge/DisplayRequestHistoryRatingSimilarity";
import DisplayRequestHistorySingleTurn from "@/components/judge/DisplayRequestHistorySingleTurn";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Footer from "@/components/globals/Footer";
import DisplayRequestHistoryMultiTurnConversation from "@/components/judge/DisplayRequestHistoryMultiTurn";

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
      <Box display={"flex"} flexDirection={"row"}>
        <Box display={"flex"} height={"100vh"} sx={{overflowY: 'auto'}}>
          <EvaluationHistoryLeftBar type={"single"} />
        </Box>
        <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
          {session && serverData && (
            <Grid spacing={0} sx={{ flexGrow: 1 }} container>
              <Grid item xs={11}>
                <Grid
                  marginTop={"30px"}
                  spacing={0}
                  sx={{ flexGrow: 1 }}
                  container
                >
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
                        Single Answer Evaluation: {serverData.name}
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
                  {API_TYPE_SINGLETURN === serverData.eval_type && (
                    <DisplayRequestHistorySingleTurn serverData={serverData} />
                  )}
                  {API_TYPE_MULTITURN === serverData.eval_type && (
                    <DisplayRequestHistoryMultiTurnConversation serverData={serverData} />
                  )}
                </Grid>
                <Grid item xs={12} marginLeft={"25px"} marginTop={'50px'}>
                  <Footer />
                </Grid>
              </Grid>
            </Grid>
          )}
          
        </Box>
      </Box>
    </>
  );
};

export default ItemPage;
