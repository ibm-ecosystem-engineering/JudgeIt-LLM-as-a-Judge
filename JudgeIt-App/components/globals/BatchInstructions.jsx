"use client";
import { Box, Typography, Button } from "@mui/material";
import BatchPredictionOutlinedIcon from "@mui/icons-material/BatchPredictionOutlined";

function BatchInstructions() {
  return (
    <Box sx={{ width: "95%", marginBottom: 2 }}>
      <Typography
        style={{
          fontSize: "30px",
          color: "#3B3B3B",
          fontWeight: "bold",
        }}
      >
        <BatchPredictionOutlinedIcon
          fontSize="30px"
          style={{ marginRight: "10px" }}
        />
        Batch Instructions
      </Typography>

      <Typography
        style={{
          fontSize: "16px",
          color: "#3B3B3B",
          margin: "10px",
        }}
      >
        Each type of LLM Judge will accept an excel/csv file as an input file.
        The{" "}
        <a
          href="https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge/tree/main/Framework/data/input"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>{" "}
        for this app contains a sample input file for each type of LLM Judge
        that you can copy, edit, and use to test.
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
              <b>Input: </b>Provide an excel/csv file with the following
              columns:
            </li>

            <ul className="list-none ml-8">
              <li>golden_text</li>
              <li>generated_text</li>
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
              <b>Input: </b>Provide an excel/csv file with the following
              columns:
            </li>
            <ul className="list-none ml-8">
              <li>golden_text</li>
              <li>generated_text</li>
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
              <b>Input: </b>Provide an excel/csv file with the following
              columns:
            </li>
            <ul className="list-none ml-8">
              <li>previous_question</li>
              <li>previous_answer</li>
              <li>current_question</li>
              <li>golden_rewritten_question</li>
              <li>rewritten_question</li>
            </ul>
            <li>
              <b>Output: </b>The LLM Judge will output a Grade and Explanation.
              A grade of 0 means the texts are dissimilar, while a grade of 1
              means the texts are similar.
            </li>
          </ul>
        </li>
      </ol>

      <Typography
        style={{
          fontSize: "16px",
          color: "#3B3B3B",
          margin: "10px",
        }}
      >
        <b>Note:</b> Your input files can contain additional columns than the
        ones specified above. These columns will have no effect on the LLM Judge
        and will be preserved in the output file.
      </Typography>
      <Button variant="outlined" href="/pages/batch">
        Batch Evaluation
      </Button>
    </Box>
  );
}

export default BatchInstructions;
