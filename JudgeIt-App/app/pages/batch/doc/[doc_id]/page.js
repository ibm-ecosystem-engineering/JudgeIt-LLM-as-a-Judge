"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetch_request_history_by_id } from "@/services/ManagemenBackendAPI";
import DataGridToolbar from "@/components/globals/DataGridToolbar";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { app_labels_and_config } from "@/services/Config";
import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography, Box, CircularProgress, Button } from "@mui/material";
import { generateColumns, generateRows } from "@/utils/Helper";
import { DataGrid } from "@mui/x-data-grid";
import BarChart from "@/components/globals/BarChart";
import Footer from "@/components/globals/Footer";

const BatchDocIdPage = () => {
  const params = useParams();
  const { doc_id } = params; // Get the 'id' from the URL
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
      const task_id_object = await fetch_request_history_by_id(
        session.user.email,
        doc_id
      );

      setTask_object(task_id_object);

      const data = await task_id_object?.content?.batch_result;

      if (data && data?.status !== "ERROR") {
        setServerData(data);
        const grades = data.Grade
          ? Object.values(data.Grade).filter((grade) => grade !== undefined)
          : Object.values(data.judgeit_score).filter((score) => score !== undefined);

        const gradeDistribution = grades.reduce((acc, grade) => {
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {});
        setGradeData(gradeDistribution);
      }
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
      {session && (
        <Box display={"flex"} flexDirection={"row"}>
          <Box display={"flex"} height={"100vh"} sx={{overflowY: 'auto'}}>
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
                          fontSize: "30px",
                          marginLeft: "25px",
                          color: "#3B3B3B",
                          fontWeight: "bold",
                          marginBottom: "15px",
                        }}
                      >
                        Batch Evaluation:{" "}
                        {task_object &&
                          task_object.name + " - " + task_object.eval_type}
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
                  <Grid item xs={12} marginLeft={"25px"}>
                    {gradeData && (
                      <Box sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}>
                        <Typography
                          style={{
                            fontSize: "20px",
                            color: "#3B3B3B",
                            margin: "10px",
                            fontWeight: "bold",
                            textDecoration: "none",
                          }}
                        >
                          {app_labels_and_config.pages.graph_title}
                        </Typography>
                        <BarChart gradeData={gradeData} />
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"}>
                    {serverData && (
                      <DataGrid
                        rows={generateRows(serverData, task_object.eval_type)}
                        columns={generateColumns(serverData)}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        density="compact"
                        getRowHeight={() => "auto"}
                        autoHeight={true}
                        pageSizeOptions={[5, 10, 25]}
                        slots={{ toolbar: DataGridToolbar }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"} marginTop={"50px"}>
                    <Footer />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default BatchDocIdPage;
