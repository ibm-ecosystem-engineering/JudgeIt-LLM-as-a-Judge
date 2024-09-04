"use client";
import { Button, Typography } from "@mui/material";

export default function Home() {

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          style={{
            fontSize: "72px",
            color: "#3B3B3B",
            margin: "10px",
            fontWeight: "bold",
          }}
        >
          Welcome to JudgeIt!
        </Typography>
        <Typography
          style={{
            fontSize: "20px",
            color: "#3B3B3B",
            marginLeft: "15%",
            marginRight: "15%",
            marginTop: "3%",
            marginBottom: "75px",
          }}
        >
          JudgeIt is an automated evaluation framework designed for testing
          various Generative AI pipelines such as RAG, Multi-Turn Query
          Rewriting, Text-to-SQL, and more. This service utilizes an LLM Judge
          to accurately and efficiently evaluate generated text against provided
          golden text. Try evaluating a single input or a batch of inputs by
          clicking one of the options below!
        </Typography>
        <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
          <Button variant="outlined" href="/pages/single">
            Single Evaluation
          </Button>
          <Button variant="outlined" href="/pages/batch">
            Batch Evaluation
          </Button>
        </div>
      </div>
      <div
        style={{
          marginRight: "20%",
          marginLeft: "5%",
          marginTop: "10px",
        }}
      >
      </div>
    </>
  );
}
