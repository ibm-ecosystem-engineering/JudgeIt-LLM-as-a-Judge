"use client";
import {
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Paper,
} from "@mui/material";
import * as Yup from "yup";
import PageTitle from "@/components/globals/PageTitle";
import { judge_api_solo_call } from "@/services/JudgeBackendAPISolo";
import { Formik, Form, Field } from "formik";
import MultiTurnForm from "@/components/judge/MultiTurnForm";
import RatingSimilarityForm from "@/components/judge/RatingSimilarityForm";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  API_TYPE_KEY,
  LLM_MODELS,
} from "@/services/Config";
import { useState } from "react";
import SoloResult from "@/components/judge/SoloResult";

const validationSchema = Yup.object({
  apiType: Yup.string().required("API type is required"),
  model: Yup.string().required("Model is required"),
  previous_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Previous question is required"),
    otherwise: (schema) => schema,
  }),
  previous_answer: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Previous answer is required"),
    otherwise: (schema) => schema,
  }),

  current_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Current question is required"),
    otherwise: (schema) => schema,
  }),

  golden_rewritten_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Golden rewritten query"),
    otherwise: (schema) => schema,
  }),

  rewritten_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Rewritten question is required"),
    otherwise: (schema) => schema,
  }),

  /*
  question: Yup.string().when(API_TYPE_KEY, {
    is: (value) => value === API_TYPE_RATING || value === API_TYPE_SIMILARITY,
    then: (schema) => schema.required("Question is required"),
    otherwise: (schema) => schema,
  }),
  */

  golden_text: Yup.string().when(API_TYPE_KEY, {
    is: (value) => value === API_TYPE_RATING || value === API_TYPE_SIMILARITY,
    then: (schema) => schema.required("Golden Text is required"),
    otherwise: (schema) => schema,
  }),

  generated_text: Yup.string().when(API_TYPE_KEY, {
    is: (value) => value === API_TYPE_RATING || value === API_TYPE_SIMILARITY,
    then: (schema) => schema.required("LLM Response is required"),
    otherwise: (schema) => schema,
  }),
});

const SoloRequestPage = () => {
  const [current_api_call, setCurrent_api_call] = useState("");
  const [api_call_inprogress, setApi_call_inprogress] = useState(false);
  const [result, setResult] = useState(null);

  return (
    <div style={{ marginRight: "20px" }}>
      <PageTitle title={"LLM Judge"} />
      {api_call_inprogress && (
        <LinearProgress
          color="inherit"
          sx={{ marginBottom: "10px", width: "90%" }}
        />
      )}
      {result && <SoloResult api_type={current_api_call} data={result} />}
      <Paper elevation={2} sx={{ width: "90%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Formik
            initialValues={{
              apiType: API_TYPE_RATING,
              /* question: "", */
              golden_text: "",
              generated_text: "",
              model: "meta-llama/llama-3-70b-instruct",
              previous_question: "",
              previous_answer: "",
              current_question: "",
              golden_rewritten_question: "",
              rewritten_question: "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                setCurrent_api_call(values.apiType);
                setApi_call_inprogress(true);
                const response = await judge_api_solo_call(values);
                setResult(response.data);
                setApi_call_inprogress(false);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            {({ values, handleChange, handleBlur, errors, touched }) => (
              <Form>
                {values.apiType === API_TYPE_MULTITURN ? (
                  <>
                    <MultiTurnForm
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      errors={errors}
                      touched={touched}
                    />
                  </>
                ) : (
                  <>
                    {(current_api_call === API_TYPE_RATING ||
                      current_api_call === API_TYPE_SIMILARITY)}
                    <RatingSimilarityForm
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                      errors={errors}
                      touched={touched}
                    />
                  </>
                )}
                <Box
                  marginBottom={"20px"}
                  marginLeft={"20px"}
                  marginRight={"20px"}
                >
                  <FormControl
                    style={{ width: "300px" }}
                    error={touched.model && Boolean(errors.model)}
                  >
                    <InputLabel id="model-label">Model</InputLabel>
                    <Select
                      labelId="model-label"
                      id="model"
                      name="model"
                      value={values.model}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Model"
                    >
                      {LLM_MODELS.map((item, index) => (
                        <MenuItem key={index} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.model && errors.model && (
                      <FormHelperText>{errors.model}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Box
                  marginBottom={"20px"}
                  marginLeft={"20px"}
                  marginRight={"20px"}
                >
                  <FormControl
                    component="fieldset"
                    error={touched.apiType && Boolean(errors.apiType)}
                    disabled={api_call_inprogress}
                  >
                    <RadioGroup
                      row
                      aria-label="option"
                      name={API_TYPE_KEY}
                      value={values.apiType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <FormControlLabel
                        value={API_TYPE_RATING}
                        control={<Radio />}
                        label={"Rating"}
                      />
                      <FormControlLabel
                        value={API_TYPE_SIMILARITY}
                        control={<Radio />}
                        label="Similarity"
                      />
                      <FormControlLabel
                        value={API_TYPE_MULTITURN}
                        control={<Radio />}
                        label="Multi-Turn"
                      />
                    </RadioGroup>
                    {touched.apiType && errors.apiType && (
                      <FormHelperText>{errors.apiType}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Box
                  marginBottom={"20px"}
                  marginLeft={"20px"}
                  marginRight={"20px"}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    style={{ width: "200px" }}
                    disabled={api_call_inprogress}
                  >
                    Send
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </div>
  );
};

export default SoloRequestPage;
