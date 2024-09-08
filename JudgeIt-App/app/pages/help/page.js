import BatchInstructions from "@/components/globals/BatchInstructions";
import SingleInstructions from "@/components/globals/SingleInstructions";
import { Grid, Paper, Typography } from "@mui/material";
import React from "react";

const HelperPage = () => {
  return (
    <div style={{ margin: "20px" }}>
      <Grid spacing={5} sx={{ flexGrow: 1 }} container>
        <Grid item xs={12} justifyContent={"center"} display={"flex"}>
          <Typography
            style={{
              fontSize: "36px",
              color: "#3B3B3B",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            Documentation
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={'4'} style={{ padding: "10px"}}>
            <SingleInstructions />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={'4'} style={{ padding: "10px"}}>
            <BatchInstructions />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default HelperPage;
