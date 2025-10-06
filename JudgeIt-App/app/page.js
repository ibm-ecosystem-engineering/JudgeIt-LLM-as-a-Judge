"use client";
import { useSession } from "next-auth/react";
import { Button, Typography, CircularProgress, Grid, Box } from "@mui/material";
import SignIn from "@/components/globals/SignIn";
import JoinInnerOutlinedIcon from "@mui/icons-material/JoinInnerOutlined";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import TurnSharpRightOutlinedIcon from "@mui/icons-material/TurnSharpRightOutlined";
import {
  rag_similarity_display,
  rag_rating_display,
  multi_turn_display,
  app_labels_and_config,
  wbox_display,
  bbox_display
} from "@/services/Config";
import Footer from "@/components/globals/Footer";

export default function Home() {
  const { data: session, status } = useSession();

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
      {session && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            marginLeft: "200px",
            marginRight: "200px",
            marginTop: "70px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "200px",
              marginRight: "200px",
            }}
          >
            <Typography
              style={{
                fontSize: "0.85rem",
                color: "#3B3B3B",
                marginLeft: "10%",
                marginRight: "10%",
                marginBottom: "50px",
                backgroundColor: "#F7F7F8",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              {app_labels_and_config.home_page_panel_title.home_page_intro}
            </Typography>
          </div>

          <Grid spacing={0} sx={{ flexGrow: 1 }} container>
            <Grid item xs={4}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  marginBottom: "40px",
                  fontSize: "1.125rem",
                  lineHeight: "1.75rem",
                }}
              >
                <div
                  style={{
                    display: "block",
                    flexDirection: "row",
                    alignContent: "center",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  <JoinInnerOutlinedIcon />
                </div>
               {app_labels_and_config.home_page_panel_title.similarity_panel}
              </div>

              {rag_similarity_display.map((similarity, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
                    height: "60px",
                  }}
                  key={i}
                >
                  {similarity}
                </div>
              ))}
            </Grid>
            <Grid item xs={4}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  marginBottom: "40px",
                  fontSize: "1.125rem",
                  lineHeight: "1.75rem",
                }}
              >
                <div
                  style={{
                    display: "block",
                    flexDirection: "row",
                    alignContent: "center",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  <GradeOutlinedIcon />
                </div>
                {app_labels_and_config.home_page_panel_title.rating_panel}
              </div>
              {rag_rating_display.map((rating, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
                    height: "60px",
                  }}
                  key={i}
                >
                  {rating}
                </div>
              ))}
            </Grid>
            <Grid item xs={4}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  marginBottom: "40px",
                  fontSize: "1.125rem",
                  lineHeight: "1.75rem",
                }}
              >
                <div
                  style={{
                    display: "block",
                    flexDirection: "row",
                    alignContent: "center",
                    width: "100%",
                    flexWrap: "wrap",
                  }}
                >
                  <TurnSharpRightOutlinedIcon />
                </div>
                {app_labels_and_config.home_page_panel_title.multiturn_panel}
              </div>
              {multi_turn_display.map((multi, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
                    height: "60px",
                  }}
                  key={i}
                >
                  {multi}
                </div>
              ))}
            </Grid>
          </Grid>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginBottom: "20px",
              marginTop: "50px",
            }}
          >
            <Button variant="outlined" href="/pages/single">
              {app_labels_and_config.buttons.single_page_action}
            </Button>
            <Button variant="outlined" href="/pages/batch">
              {app_labels_and_config.buttons.batch_page_action}
            </Button>
          </div>
        </div>
      )}
      {!session && (
        <div
          style={{
            marginRight: "5%",
            marginLeft: "5%",
            marginTop: "10px",
          }}
        >
          <SignIn />
        </div>
      )}
      <Box marginTop={"50px"}>
        <Footer />
      </Box>
    </>
  );
}
