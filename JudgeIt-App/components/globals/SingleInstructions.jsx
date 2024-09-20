"use client";
import { Box, Typography, Button } from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";

function SingleInstructions() {
  return (
    <Box sx={{ width: "95%", marginBottom: 2 }}>
      <Typography
        style={{
          fontSize: "30px",
          color: "#3B3B3B",
          fontWeight: "bold",
        }}
      >
        <GavelOutlinedIcon fontSize="30px" style={{ marginRight: "10px" }} />
        Single Answer Evaluation Instructions
      </Typography>

      <Typography
        style={{
          fontSize: "16px",
          color: "#3B3B3B",
          margin: "10px",
        }}
      >
        Evaluate a single input using different LLM Judge types.
      </Typography>
      <ol className="list-decimal list-inside mb-4">
        <li className="mb-2">
          <Typography
            style={{
              fontSize: "16px",
              color: "#3B3B3B",
              margin: "10px",
              fontWeight: "bold",
            }}
          >
            RAG Evaluation (Similarity):
          </Typography>
          <ul className="list-disc list-inside ml-4">
            <li>
              <b>Function: </b>Compare a golden text to a generated text
            </li>
            <li>
              <b>Input: </b>Provide the following:
            </li>

            <ul className="list-none ml-8">
              <li>golden text</li>
              <li>generated text</li>
            </ul>
            <li>
              <b>Output: </b>The LLM Judge will output a Grade and Explanation.
              A grade of 0 means the texts are dissimilar, while a grade of 1
              means the texts are similar.
            </li>
          </ul>
        </li>

        <li className="mb-2">
          <Typography
            style={{
              fontSize: "16px",
              color: "#3B3B3B",
              margin: "10px",
              fontWeight: "bold",
            }}
          >
            RAG Evaluation (Rating):
          </Typography>
          <ul className="list-disc list-inside ml-4">
            <li>
              <b>Function: </b>Compare a golden text to a generated text
            </li>
            <li>
              <b>Input: </b>Provide the following:
            </li>
            <ul className="list-none ml-8">
              <li>golden text</li>
              <li>generated text</li>
            </ul>
            <li>
              <b>Output: </b>The LLM Judge will output a Grade and Explanation.
              A grade of 1 means the texts are dissimilar, a grade of 2 means
              the texts are partially similar, and a text of 3 means the texts
              are significantly similar
            </li>
          </ul>
        </li>

        <li className="mb-2">
          <Typography
            style={{
              fontSize: "16px",
              color: "#3B3B3B",
              margin: "10px",
              fontWeight: "bold",
            }}
          >
            Multi-turn Evaluation:
          </Typography>
          <ul className="list-disc list-inside ml-4">
            <li>
              <b>Function: </b>Compare a golden rewritten query to a rewritten
              query based on a multi-turn conversation
            </li>
            <li>
              <b>Input: </b>Provide the following:
            </li>
            <ul className="list-none ml-8">
              <li>previous question</li>
              <li>previous answer</li>
              <li>current question</li>
              <li>golden rewritten question</li>
              <li>rewritten question</li>
            </ul>
            <li>
              <b>Output: </b>The LLM Judge will output a Grade and Explanation.
              A grade of 0 means the texts are dissimilar, while a grade of 1
              means the texts are similar.
            </li>
          </ul>
        </li>
      </ol>
      <Button variant="outlined" href="/pages/single">
        Single Answer Evaluation
      </Button>
    </Box>
  );
}

export default SingleInstructions;
