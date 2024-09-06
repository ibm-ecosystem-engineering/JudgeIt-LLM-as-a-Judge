import React from "react";
import { Grid, Paper, Typography, CircularProgress } from "@mui/material";

const DisplayRequestHistoryRatingSimilarity = ({serverData}) => {
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
              Golden Text:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.golden_text}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              LLM Response:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.generated_text}
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

            <Grid item xs={3} fontWeight={"bold"}>
              Explanation:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.result.Explanation}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default DisplayRequestHistoryRatingSimilarity;
