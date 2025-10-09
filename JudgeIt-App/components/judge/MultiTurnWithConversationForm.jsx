"use client";
import React from "react";
import { TextField, Box } from "@mui/material";

const MultiTurnWithConversationForm = ({
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
          label="Conversation history"
          name="conversation_history"
          value={values.conversation_history}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.conversation_history && Boolean(errors.conversation_history)}
          helperText={touched.conversation_history && errors.conversation_history}
          style={{ width: "100%" }}
          rows={"8"}
          multiline
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Follow up query"
          name="follow_up_query"
          value={values.follow_up_query}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.follow_up_query && Boolean(errors.follow_up_query)}
          helperText={touched.follow_up_query && errors.follow_up_query}
          style={{ width: "100%" }}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Golden query"
          name="golden_query"
          value={values.golden_query}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.golden_query && Boolean(errors.golden_query)}
          helperText={touched.golden_query && errors.golden_query}
          style={{ width: "100%" }}
        />
      </Box>
      <Box marginBottom={"20px"} marginLeft={"20px"} marginRight={'20px'}>
        <TextField
          label="Rewritten query "
          name="rewritten_query"
          value={values.rewritten_query}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.rewritten_query && Boolean(errors.rewritten_query)}
          helperText={touched.rewritten_query && errors.rewritten_query}
          style={{ width: "100%" }}
        />
      </Box>
    </div>
  );
};

export default MultiTurnWithConversationForm;
