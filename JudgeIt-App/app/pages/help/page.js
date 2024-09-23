import BatchInstructions from "@/components/globals/BatchInstructions";
import Footer from "@/components/globals/Footer";
import SingleInstructions from "@/components/globals/SingleInstructions";
import { Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";

const HelperPage = () => {
  return (
    <div
      style={{
        marginTop: "20px",
        marginLeft: "50px",
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
        <Grid item xs={11} spacing={5} sx={{ flexGrow: 1 }} container>
          <Grid item xs={6}>
            <Box
              border={"1px solid grey"}
              borderRadius={"5px"}
              padding={"10px"}
            >
              <SingleInstructions />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              border={"1px solid grey"}
              borderRadius={"5px"}
              padding={"10px"}
            >
              <BatchInstructions />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Footer />
      </Grid>
    </div>
  );
};

export default HelperPage;
