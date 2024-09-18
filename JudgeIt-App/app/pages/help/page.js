import BatchInstructions from "@/components/globals/BatchInstructions";
import Footer from "@/components/globals/Footer";
import SingleInstructions from "@/components/globals/SingleInstructions";
import { Grid, Paper, Typography } from "@mui/material";
import React from "react";

const HelperPage = () => {
  return (
    <div
      style={{
        margin: "20px",
        height: "90vh",
        overflowY: "scroll",
        marginBottom: "20px",
      }}
    >
      <Grid spacing={5} sx={{ flexGrow: 1 }} container>
        <Grid item xs={12} justifyContent={"center"} display={"flex"}>
          <Typography
            style={{
              fontSize: "36px",
              color: "#3B3B3B",
              fontWeight: "bold",
            }}
          >
            Documentation
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={"4"} style={{ padding: "10px" }}>
            <SingleInstructions />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={"4"} style={{ padding: "10px" }}>
            <BatchInstructions />
          </Paper>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Footer />
      </Grid>
    </div>
  );
};

export default HelperPage;
