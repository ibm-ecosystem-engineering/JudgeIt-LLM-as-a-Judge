"use client";
import React from "react";
import { TextField, Box } from "@mui/material";

const RatingSimilarityForm = ({
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
}) => {
  return (
    <div>
      {/* <Box margin={"20px"}>
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
      </Box> */}
      <Box margin={"20px"}>
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
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
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
      </Box>
    </div>
  );
};

export default RatingSimilarityForm;
