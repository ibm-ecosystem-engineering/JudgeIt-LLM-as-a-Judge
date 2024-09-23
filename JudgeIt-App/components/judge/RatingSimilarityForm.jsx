"use client";
import React from "react";
import { TextField, Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const RatingSimilarityForm = ({
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
}) => {
  return (
    <div>
      <Box margin={"20px"} display={"flex"} flexDirection={"row"}>
        <TextField
          label="Question"
          name="question"
          value={values.question}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.question && Boolean(errors.question)}
          helperText={touched.question && errors.question}
          style={{ width: "100%" }}
        />
        <Tooltip title="LLM Query." sx={{ marginLeft: "5px", cursor: "help" }}>
          <InfoOutlinedIcon />
        </Tooltip>
      </Box>
      <Box margin={"20px"} display={"flex"} flexDirection={"row"}>
        <TextField
          label="Golden Text"
          name="golden_text"
          value={values.golden_text}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.golden_text && Boolean(errors.golden_text)}
          helperText={touched.golden_text && errors.golden_text}
          style={{ width: "100%" }}
          multiline
          rows={"4"}
        />
        <Tooltip
          title="The reference or target text provided as the correct answer or expected output. Used to evaluate the quality and accuracy of generated text against an ideal standard."
          sx={{ marginLeft: "5px", cursor: "help" }}
        >
          <InfoOutlinedIcon />
        </Tooltip>
      </Box>
      <Box
        marginBottom={"20px"}
        marginLeft={"20px"}
        marginRight={"20px"}
        display={"flex"}
        flexDirection={"row"}
      >
        <TextField
          label="LLM Response"
          name="generated_text"
          value={values.generated_text}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.generated_text && Boolean(errors.generated_text)}
          helperText={touched.generated_text && errors.generated_text}
          style={{ width: "100%" }}
          multiline
          rows={"4"}
        />
        <Tooltip
          title="The output produced by the language model. Compared against the golden text to assess coherence, correctness, and alignment with the expected result."
          sx={{ marginLeft: "5px", cursor: "help" }}
        >
          <InfoOutlinedIcon />
        </Tooltip>
      </Box>
    </div>
  );
};

export default RatingSimilarityForm;
