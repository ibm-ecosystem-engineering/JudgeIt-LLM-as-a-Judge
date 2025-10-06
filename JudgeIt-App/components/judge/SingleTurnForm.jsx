"use client";
import React from "react";
import { TextField, Box } from "@mui/material";

const SingleTurnForm = ({
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
}) => {
  return (
    <div>
      <Box marginBottom={"20px"} margin={"20px"}>
        <TextField
          label="Previous Question"
          name="previous_question"
          value={values.previous_question}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.previous_question && Boolean(errors.previous_question)}
          helperText={touched.previous_question && errors.previous_question}
          style={{ width: "100%" }}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Previous Answer "
          name="previous_answer"
          value={values.previous_answer}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.previous_answer && Boolean(errors.previous_answer)}
          helperText={touched.previous_answer && errors.previous_answer}
          style={{ width: "100%" }}
          multiline
          rows={"4"}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Current Question"
          name="current_question"
          value={values.current_question}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.current_question && Boolean(errors.current_question)}
          helperText={touched.current_question && errors.current_question}
          style={{ width: "100%" }}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Golden Rewritten Question "
          name="golden_rewritten_question"
          value={values.golden_rewritten_question}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.golden_rewritten_question && Boolean(errors.golden_rewritten_question)}
          helperText={touched.golden_rewritten_question && errors.golden_rewritten_question}
          style={{ width: "100%" }}
          multiline
          rows={"4"}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Rewritten Question"
          name="rewritten_question"
          value={values.rewritten_question}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.rewritten_question && Boolean(errors.rewritten_question)}
          helperText={touched.rewritten_question && errors.rewritten_question}
          style={{ width: "100%" }}
          multiline
          rows={"4"}
        />
      </Box>
    </div>
  );
};

export default SingleTurnForm;
