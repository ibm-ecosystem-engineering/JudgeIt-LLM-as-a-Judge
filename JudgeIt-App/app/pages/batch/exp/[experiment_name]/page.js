"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetch_request_history_by_name_and_type } from "@/services/ManagemenBackendAPI";
import { get_result_by_task_id } from "@/services/JudgeBackendAPIBatch";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography, Box, CircularProgress, Button } from "@mui/material";
import BarChart from "@/components/globals/BarChart";
import Footer from "@/components/globals/Footer";

const ExperimentPage = () => {
  const params = useParams();
  const { experiment_name } = params; // Get the 'id' from the URL
  const { data: session, status } = useSession();
  const [serverData, setServerData] = useState(null);
  const [task_object, setTask_object] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const hasEffectRun = useRef(false);

  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const history_data = await fetch_request_history_by_name_and_type(
        session.user.email,
        experiment_name,
        "batch"
      );

      if (history_data) {
        setServerData(history_data);

        const grades_list = await Promise.all(
          history_data.map(async (item) => {
            //const data = await get_result_by_task_id(item.content.task_id);
            const data = await item?.content?.batch_result;

            if (data && data?.status !== "ERROR") {
              const grades = Object.values(data.Grade).filter(
                (grade) => grade !== undefined
              );

              const gradeDistribution = grades.reduce((acc, grade) => {
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
              }, {});

              return {
                grades: gradeDistribution,
                name: item.name,
                eval_type: item.eval_type,
              };
            } else {
              return null;
            }
          })
        );
        setGradeData(grades_list);
      }
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
        <Box display={"flex"} height={"100vh"}>
          <EvaluationHistoryLeftBar type={"batch"} />
        </Box>
        <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
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
                        fontSize: "24px",
                        marginLeft: "25px",
                        color: "#3B3B3B",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      Batch Evaluation - {experiment_name}
                    </Typography>
                    <Button
                      size="small"
                      href="/pages/batch"
                      startIcon={<ArrowBackOutlinedIcon />}
                    >
                      Back
                    </Button>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  marginLeft={"25px"}
                  spacing={0}
                  sx={{ flexGrow: 1 }}
                  container
                >
                  {gradeData &&
                    gradeData.map((gdata, index) => (
                      <Grid
                        item
                        xs={gradeData.length == 1 ? 12 : 6}
                        key={index}
                      >
                        <Box
                          sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}
                        >
                          <Typography
                            style={{
                              fontSize: "16px",
                              color: "#3B3B3B",
                              margin: "10px",
                              fontWeight: "bold",
                              textDecoration: "none",
                            }}
                          >
                            Grade Distribution - {gdata && gdata.name}
                          </Typography>
                          {gdata && <BarChart gradeData={gdata.grades} />}
                        </Box>
                      </Grid>
                    ))}
                </Grid>
                <Grid item xs={12} marginLeft={"25px"} marginTop={"50px"}>
                  <Footer />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ExperimentPage;
