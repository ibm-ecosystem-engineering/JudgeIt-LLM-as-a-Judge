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
} from "@/services/Config";

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
                RAG Evaluation (Similarity)
              </div>

              {rag_similarity_display.map((similarity, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
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
                RAG Evaluation (Rating)
              </div>
              {rag_rating_display.map((rating, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
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
                Multi-turn evaluation
              </div>
              {multi_turn_display.map((multi, i) => (
                <div
                  style={{
                    minWidth: "200px",
                    backgroundColor: "#F7F7F8",
                    padding: "15px",
                    margin: "10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    lineHeight: "1.25rem",
                  }}
                  key={i}
                >
                  {multi}
                </div>
              ))}
            </Grid>
          </Grid>
          <Typography
            style={{
              fontSize: "0.85rem",
              color: "#3B3B3B",
              marginLeft: "10%",
              marginRight: "10%",
              marginTop: "3%",
              marginBottom: "50px",
              backgroundColor: "#F7F7F8",
              padding: "15px",
              borderRadius: "5px"
            }}
          >
            JudgeIt is an automated evaluation framework designed for testing
            various Generative AI pipelines such as RAG, Multi-Turn Query
            Rewriting, Text-to-SQL, and more. This service utilizes an LLM Judge
            to accurately and efficiently evaluate generated text against
            provided golden text. Try evaluating a single input or a batch of
            inputs by clicking one of the options below!
          </Typography>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginBottom: "20px",
            }}
          >
            <Button variant="outlined" href="/pages/single">
              Single Answer Evaluation
            </Button>
            <Button variant="outlined" href="/pages/batch">
              Batch Evaluation
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
    </>
  );
}
