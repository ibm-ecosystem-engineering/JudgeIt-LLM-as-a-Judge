import React from "react";
import { Grid, Paper, Typography, CircularProgress } from "@mui/material";

const DisplayRequestHistoryMultiTurn = ({ serverData }) => {
  return (
    <>
      <Grid item xs={12} marginLeft={"25px"}>
        <Paper elevation={2} sx={{ padding: "20px" }}>
          <Grid spacing={2} sx={{ flexGrow: 1 }} container>
            <Grid item xs={3} fontWeight={"bold"}>
              Experiment name:
            </Grid>
            <Grid item xs={9}>
              {serverData.experiment_name}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              Request type:
            </Grid>
            <Grid item xs={9}>
              {serverData.eval_type}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              Previous question:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.previous_question}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              Previous answer:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.previous_answer}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Current question:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.current_question}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Golden rewritten question:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.golden_rewritten_question}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Rewritten question:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.rewritten_question}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Model:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.model}
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} marginLeft={"25px"} marginTop={"20px"}>
        <Paper elevation={2} sx={{ padding: "20px" }}>
          <Grid spacing={2} sx={{ flexGrow: 1 }} container>
            <Grid item xs={3} fontWeight={"bold"}>
              Grade:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.result.Grade}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default DisplayRequestHistoryMultiTurn;
