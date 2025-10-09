import React from "react";
import { Grid, Paper, Box, CircularProgress } from "@mui/material";

const DisplayRequestHistorySingleTurn = ({ serverData }) => {
  return (
    <>
      <Grid item xs={12} marginLeft={"25px"}>
        <Box
          elevation={2}
          padding={"20px"}
          border={"1px solid grey"}
          borderRadius={"5px"}
        >
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
        </Box>
      </Grid>

      <Grid item xs={12} marginLeft={"25px"} marginTop={"20px"}>
        <Box
          elevation={2}
          padding={"20px"}
          border={"1px solid grey"}
          borderRadius={"5px"}
        >
          <Grid spacing={2} sx={{ flexGrow: 1 }} container>
            <Grid item xs={3} fontWeight={"bold"}>
              Grade:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.result.Grade || serverData.content.result.judgeit_score}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </>
  );
};

export default DisplayRequestHistorySingleTurn;
