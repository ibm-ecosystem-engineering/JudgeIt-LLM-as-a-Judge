"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetch_request_history_by_name_and_type } from "@/services/ManagemenBackendAPI";
import { get_result_by_task_id } from "@/services/JudgeBackendAPIBatch";
import DataGridToolbar from "@/components/globals/DataGridToolbar";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";

import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { generateColumns, generateRows } from "@/utils/Helper";
import { DataGrid } from "@mui/x-data-grid";
import BarChart from "@/components/globals/BarChart";

const page = () => {
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
      const data = await fetch_request_history_by_name_and_type(
        session.user.email,
        experiment_name,
        "batch"
      );

      setServerData(data);

      const grades_list = await Promise.all(
        data.map(async (item) => {
          const data = await get_result_by_task_id(item.content.task_id);

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
        })
      );
      setGradeData(grades_list);
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
      <Grid spacing={0} sx={{ flexGrow: 1 }} container>
        <Grid item xs={2}>
          <EvaluationHistoryLeftBar type={"batch"} />
        </Grid>
        <Grid item xs={9}>
          <Grid marginTop={"30px"} spacing={0} sx={{ flexGrow: 1 }} container>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12} marginLeft={"25px"} spacing={0} sx={{ flexGrow: 1 }} container>
              {gradeData &&
                gradeData.map((gdata, index) => (
                  <Grid item xs={gradeData.length == 1 ? 12 : 6} key={index}>
                    <Box sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}>
                      <Typography
                        style={{
                          fontSize: "16px",
                          color: "#3B3B3B",
                          margin: "10px",
                          fontWeight: "bold",
                          textDecoration: "none",
                        }}
                      >
                        Grade Distribution - {gdata.name}
                      </Typography>
                      <BarChart gradeData={gdata.grades} />
                    </Box>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default page;
