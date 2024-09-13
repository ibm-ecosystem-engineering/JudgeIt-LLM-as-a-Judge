import React from "react";
import { Grid, Box } from "@mui/material";

const DisplayRequestHistoryRatingSimilarity = ({ serverData }) => {
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
              {serverData.content.result.Grade}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              Explanation:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.result.Explanation}
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </>
  );
};

export default DisplayRequestHistoryRatingSimilarity;
