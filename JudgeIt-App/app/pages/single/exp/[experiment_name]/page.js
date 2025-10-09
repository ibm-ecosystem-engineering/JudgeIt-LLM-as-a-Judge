"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid, Typography, CircularProgress, Box, Button } from "@mui/material";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import { useEffect, useRef, useState } from "react";
import { fetch_request_history_by_name_and_type } from "@/services/ManagemenBackendAPI";
import RatingSimilarityDataGrid from "@/components/judge/RatingSimilarityDataGrid";
import DataGridSingleTurn from "@/components/judge/DataGridSingleTurn";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import {
  API_TYPE_SINGLETURN,
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";
import Footer from "@/components/globals/Footer";
import DataGridMultiTurnConversation from "@/components/judge/DataGridMultiTurnConversation";

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
        (item) => item.eval_type === API_TYPE_SINGLETURN
      );

      const multi_turn_conversation = data.filter(
        (item) => item.eval_type === API_TYPE_MULTITURN
      );

      const sdata = {
        rating_similarity: rating_similarity,
        multi_turn: multi_turn,
        multi_turn_conversation: multi_turn_conversation
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
      <Box display={"flex"} flexDirection={"row"}>
        <Box display={"flex"} height={"100vh"} sx={{overflowY: 'auto'}}>
          <EvaluationHistoryLeftBar type={"single"} />
        </Box>
        <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
          {session && (
            <Grid spacing={0}>
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
                        Single Answer Evaluation - {experiment_name}
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
                  <Grid item xs={12} marginLeft={"25px"}>
                    {serverData && serverData.rating_similarity.length > 0 && (
                      <>
                        <Typography fontWeight={"bold"} marginBottom={"20px"}>
                          Rating/Similarity
                        </Typography>
                        <RatingSimilarityDataGrid
                          serverData={serverData.rating_similarity}
                        />
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"}>
                    {serverData && serverData.multi_turn.length > 0 && (
                      <>
                        <Typography fontWeight={"bold"} marginBottom={"20px"} marginTop={'30px'}>
                          Single turn evalution
                        </Typography>
                        <DataGridSingleTurn serverData={serverData.multi_turn} />
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"}>
                    {serverData && serverData.multi_turn_conversation.length > 0 && (
                      <>
                        <Typography fontWeight={"bold"} marginBottom={"20px"} marginTop={'30px'}>
                          Multi turn evaluation
                        </Typography>
                        <DataGridMultiTurnConversation serverData={serverData.multi_turn_conversation} />
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"}>
                    <Footer />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ExperimentPage;
