import React from "react";
import { Grid, Box } from "@mui/material";
import {
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  grade_map_rating,
  grade_map_similarity,
} from "@/services/Config";

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
              Question:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.question}
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
              JudgeIt Score:
            </Grid>
            {API_TYPE_RATING === serverData.eval_type && (
              <Grid item xs={9}>
                {grade_map_rating[serverData.content.result.Grade]}
              </Grid>
            )}
            {API_TYPE_SIMILARITY === serverData.eval_type && (
              <Grid item xs={9}>
                {grade_map_similarity[serverData.content.result.Grade]}
              </Grid>
            )}

            <Grid item xs={3} fontWeight={"bold"}>
              JudgeIt Reasoning:
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
