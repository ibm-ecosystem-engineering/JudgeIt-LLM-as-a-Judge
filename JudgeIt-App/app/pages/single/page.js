"use client";
import {
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  LinearProgress,
  Grid,
  Alert,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import * as Yup from "yup";
import { judge_api_solo_call } from "@/services/JudgeBackendAPISolo";
import { Formik, Form, Field } from "formik";
import SingleTurnForm from "@/components/judge/SingleTurnForm";
import MultiTurnWithConversationForm from "@/components/judge/MultiTurnWithConversationForm";
import RatingSimilarityForm from "@/components/judge/RatingSimilarityForm";
import ExperimentForm from "@/components/judge/ExperimentForm";
import {
  API_TYPE_SINGLETURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  API_TYPE_MULTITURN,
  API_TYPE_KEY,
  LLM_MODELS,
  app_labels_and_config,
} from "@/services/Config";
import { useState } from "react";
import SoloResult from "@/components/judge/SoloResult";
import { useSession } from "next-auth/react";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import EvaluationTypeComponent from "@/components/judge/EvaluationTypeComponent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Footer from "@/components/globals/Footer";

const validationSchema = Yup.object({
  apiType: Yup.string().required("API type is required"),
  model: Yup.string().required("Model is required"),

  new_experiment: Yup.string().when("experiment_option", {
    is: "new_experiment",
    then: (schema) =>
      schema
        .matches(/^[a-zA-Z0-9- ]*$/, "No special characters allowed")
        .required("Experiment name is required")
        .min(4, "Must be at least 4 characters long"),
    otherwise: (schema) => schema,
  }),

  existing_experiment: Yup.string().when("experiment_option", {
    is: "existing_experiment",
    then: (schema) => schema.required("Please select experiment"),
    otherwise: (schema) => schema,
  }),

  conversation_history: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Conversation history is required"),
    otherwise: (schema) => schema,
  }),

  follow_up_query: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Follow up query is required"),
    otherwise: (schema) => schema,
  }),

  golden_query: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Golden query is required"),
    otherwise: (schema) => schema,
  }),

  rewritten_query: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_MULTITURN,
    then: (schema) => schema.required("Rewritten query is required"),
    otherwise: (schema) => schema,
  }),

  previous_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_SINGLETURN,
    then: (schema) => schema.required("Previous question is required"),
    otherwise: (schema) => schema,
  }),

  previous_answer: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_SINGLETURN,
    then: (schema) => schema.required("Previous answer is required"),
    otherwise: (schema) => schema,
  }),

  current_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_SINGLETURN,
    then: (schema) => schema.required("Current question is required"),
    otherwise: (schema) => schema,
  }),

  golden_rewritten_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_SINGLETURN,
    then: (schema) => schema.required("Golden rewritten query"),
    otherwise: (schema) => schema,
  }),

  rewritten_question: Yup.string().when(API_TYPE_KEY, {
    is: API_TYPE_SINGLETURN,
    then: (schema) => schema.required("Rewritten question is required"),
    otherwise: (schema) => schema,
  }),

  question: Yup.string().when(API_TYPE_KEY, {
    is: (value) => value === API_TYPE_RATING || value === API_TYPE_SIMILARITY,
    then: (schema) => schema.required("Question is required"),
    otherwise: (schema) => schema,
  }),

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
  const [newData, setNewData] = useState(null);
  const [api_error, setApi_error] = useState(null);

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
        <Box display={"flex"} flexDirection={"row"}>
          <Box display={"flex"} height={"100vh"} sx={{ overflowY: "auto" }}>
            <EvaluationHistoryLeftBar type={"single"} result={newData} />
          </Box>
          <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
            <Grid spacing={0} sx={{ flexGrow: 1 }} container>
              <Grid item xs={11}>
                <Grid
                  marginTop={"10px"}
                  spacing={0}
                  sx={{ flexGrow: 1 }}
                  container
                >
                  <Grid item xs={12}>
                    <Typography
                      style={{
                        fontSize: "30px",
                        marginLeft: "25px",
                        color: "#3B3B3B",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      {app_labels_and_config.pages.single_evaluation_page_title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <div style={{ marginLeft: "30px" }}>
                      {api_error && (
                        <Alert
                          severity="error"
                          sx={{
                            width: "85%",
                            marginLeft: "20px",
                            marginBottom: "10px",
                          }}
                        >
                          {api_error}
                        </Alert>
                      )}
                      <Box
                        elevation={2}
                        sx={{ width: "95%" }}
                        border={"1px solid grey"}
                        borderRadius={"5px"}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Formik
                            initialValues={{
                              apiType: API_TYPE_RATING,
                              question: "",
                              golden_text: "",
                              generated_text: "",
                              model: "meta-llama/llama-3-3-70b-instruct",
                              previous_question: "",
                              previous_answer: "",
                              current_question: "",
                              golden_rewritten_question: "",
                              rewritten_question: "",
                              experiment_option: "new_experiment",
                              new_experiment: "",
                              existing_experiment: "",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={async (values) => {
                              try {
                                setApi_error(null);
                                setCurrent_api_call(values.apiType);
                                setApi_call_inprogress(true);
                                values.user_id = session?.user?.email;
                                const response = await judge_api_solo_call(
                                  values
                                );
                                setResult(response.data);
                                setNewData(response.query);
                                setApi_call_inprogress(false);
                              } catch (error) {
                                console.log(error)
                                if (error?.response?.data?.detail) {
                                  setApi_error(error?.response?.data?.detail);
                                } else {
                                  setApi_error(
                                    "Error in making API call. Please try again later."
                                  );
                                }
                                setApi_call_inprogress(false);
                              }
                            }}
                          >
                            {({
                              values,
                              handleChange,
                              handleBlur,
                              errors,
                              touched,
                            }) => (
                              <Form>
                                <Box marginLeft={"20px"} marginRight={"20px"}>
                                  <ExperimentForm
                                    values={values}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                    type={"single"}
                                    created_experiment={
                                      newData?.experiment_name
                                    }
                                  />
                                </Box>
                                <Box
                                  marginLeft={"20px"}
                                  marginRight={"20px"}
                                  display={"flex"}
                                  flexDirection={"row"}
                                >
                                  <EvaluationTypeComponent
                                    values={values}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                    api_call_inprogress={api_call_inprogress}
                                  />
                                </Box>

                                {values.apiType === API_TYPE_SINGLETURN && (
                                  <SingleTurnForm
                                    values={values}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                  />
                                )}
                                {values.apiType ===
                                  API_TYPE_MULTITURN && (
                                  <MultiTurnWithConversationForm
                                    values={values}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                  />
                                )}
                                {(values.apiType === API_TYPE_RATING ||
                                  values.apiType === API_TYPE_SIMILARITY) && (
                                  <RatingSimilarityForm
                                    values={values}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    errors={errors}
                                    touched={touched}
                                  />
                                )}
                                <Box
                                  marginBottom={"20px"}
                                  marginLeft={"20px"}
                                  marginRight={"20px"}
                                  display={"flex"}
                                  flexDirection={"row"}
                                >
                                  <FormControl
                                    error={
                                      touched.model && Boolean(errors.model)
                                    }
                                  >
                                    <InputLabel id="model-label">
                                      Model
                                    </InputLabel>
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
                                        <MenuItem
                                          key={index}
                                          value={item.value}
                                        >
                                          {item.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {touched.model && errors.model && (
                                      <FormHelperText>
                                        {errors.model}
                                      </FormHelperText>
                                    )}
                                  </FormControl>
                                  <Tooltip
                                    title="LLM Model to judge your input"
                                    sx={{ marginLeft: "5px", cursor: "help" }}
                                  >
                                    <InfoOutlinedIcon />
                                  </Tooltip>
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
                      </Box>
                      {api_call_inprogress && (
                        <LinearProgress
                          color="primary"
                          sx={{ marginTop: "30px", width: "95%" }}
                        />
                      )}
                      <Box
                        sx={{ width: "100%", marginTop: 4, marginBottom: 2 }}
                      >
                        {result && (
                          <SoloResult
                            api_type={current_api_call}
                            data={result}
                          />
                        )}
                      </Box>
                    </div>
                  </Grid>
                  <Grid item xs={12} marginLeft={"25px"}>
                    <Footer />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SoloRequestPage;
