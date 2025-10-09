import React from "react";
import { Grid, Paper, Box, CircularProgress } from "@mui/material";

const DisplayRequestHistoryMultiTurnConversation = ({ serverData }) => {
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
              Conversation History:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.conversation_history}
            </Grid>

            <Grid item xs={3} fontWeight={"bold"}>
              Follow up query:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.follow_up_query}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Golden query:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.golden_query}
            </Grid>
            <Grid item xs={3} fontWeight={"bold"}>
              Rewritten query:
            </Grid>
            <Grid item xs={9}>
              {serverData.content.query.rewritten_query}
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

export default DisplayRequestHistoryMultiTurnConversation;
