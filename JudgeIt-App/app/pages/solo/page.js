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
  Alert,
  Typography,
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
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

  const [current_api_call, setCurrent_api_call] = useState("");
  const [api_call_inprogress, setApi_call_inprogress] = useState(false);
  const [result, setResult] = useState(null);
  const [api_error, setApi_error] = useState(null);

  return (
    <>
      {session && (
        <div
          style={{
            marginRight: "15%",
            marginLeft: "15%",
            marginTop: "50px",
          }}
        >
          {api_error && (
            <Alert
              severity="error"
              sx={{ width: "85%", marginLeft: "20px", marginBottom: "10px" }}
            >
              {api_error}
            </Alert>
          )}
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
                    setApi_error(null);
                    setCurrent_api_call(values.apiType);
                    setApi_call_inprogress(true);
                    const response = await judge_api_solo_call(values);
                    setResult(response.data);
                    setApi_call_inprogress(false);
                  } catch (error) {
                    setApi_error(
                      "Error in making API call. Please try again later."
                    );
                    setApi_call_inprogress(false);
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
                        {current_api_call === API_TYPE_RATING ||
                          current_api_call === API_TYPE_SIMILARITY}
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
                        variant="outlined"
                        style={{ width: "200px" }}
                        type="submit"
                        disabled={api_call_inprogress}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </Paper>
          {api_call_inprogress && (
            <LinearProgress
              color="primary"
              sx={{ marginTop: "30px", width: "90%" }}
            />
          )}
          <Box sx={{ width: "100%", marginTop: 4, marginBottom: 2 }}>
            {result && <SoloResult api_type={current_api_call} data={result} />}
          </Box>

          <Box sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}>
            <Typography
              style={{
                fontSize: "36px",
                color: "#3B3B3B",
                margin: "10px",
                fontWeight: "bold",
              }}
            >
              LLM Judge Instructions
            </Typography>

            <Typography
              style={{
                fontSize: "16px",
                color: "#3B3B3B",
                margin: "10px",
              }}
            >
              Each type of LLM Judge will accept an excel/csv file as an input
              file. The{" "}
              <a
                href="https://github.com/ibm-ecosystem-engineering/JudgeIt-LLM-as-a-Judge/tree/main/Framework/data/input"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repository
              </a>{" "}
              for this app contains a sample input file for each type of LLM
              Judge that you can copy, edit, and use to test.
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
                    <b>Output: </b>The LLM Judge will output a Grade and
                    Explanation. A grade of 0 means the texts are dissimilar,
                    while a grade of 1 means the texts are similar.
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
                    <b>Output: </b>The LLM Judge will output a Grade and
                    Explanation. A grade of 1 means the texts are dissimilar, a
                    grade of 2 means the texts are partially similar, and a text
                    of 3 means the texts are significantly similar
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
                    <b>Function: </b>Compare a golden rewritten query to a
                    rewritten query based on a multi-turn conversation
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
                    <b>Output: </b>The LLM Judge will output a Grade and
                    Explanation. A grade of 0 means the texts are dissimilar,
                    while a grade of 1 means the texts are similar.
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
              <b>Note:</b> Your input files can contain additional columns than
              the ones specified above. These columns will have no effect on the
              LLM Judge and will be preserved in the output file.
            </Typography>
          </Box>
        </div>
      )}
    </>
  );
};

export default SoloRequestPage;
