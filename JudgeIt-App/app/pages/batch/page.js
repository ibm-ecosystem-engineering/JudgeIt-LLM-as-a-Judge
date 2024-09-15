"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Box, Typography, Paper, Grid } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import EvaluationHistoryLeftBar from "@/components/judge/EvaluationHistoryLeftBar";
import ExperimentForm from "@/components/judge/ExperimentForm";
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  API_TYPE_KEY,
  LLM_MODELS,
  LLM_JUDGE_BATCH_EVENT_URL,
  LLM_JUDGE_DOWNLOAD_EVALUATION_URL,
  LLM_JUDGE_API_KEY_SECRET,
} from "@/services/Config";
import { judge_api_batch_call } from "@/services/JudgeBackendAPIBatch";
import LinearProgressWithLabel from "@/components/globals/LinearProgressWithLabel";
import { useSession } from "next-auth/react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import * as XLSX from "xlsx";
import BarChart from "@/components/globals/BarChart";
import Footer from "@/components/globals/Footer";

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [task_id, setTask_id] = useState(null);
  const { data: session, status } = useSession();
  const [gradeData, setGradeData] = useState(null);
  const [newData, setNewData] = useState(null);

  const required_column_rating_similarity = "| golden_text | generated_text |";
  const required_column_multi_turn =
    "| previous_question | previous_answer | current_question | golden_rewritten_question | rewritten_question |";

  const create_bar_chart = async (chart_task_id) => {
    try {
      setErrorStatus(null);
      const response = await fetch(
        LLM_JUDGE_DOWNLOAD_EVALUATION_URL + chart_task_id,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
          },
        }
      );

      if (!response.ok) {
        setErrorStatus("Network response was not ok");
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();

      // Parse the Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract and process the 'Grade' column
        const grades = jsonData
          .map((row) => row.Grade)
          .filter((grade) => grade !== undefined);
        const gradeDistribution = grades.reduce((acc, grade) => {
          acc[grade] = (acc[grade] || 0) + 1;
          return acc;
        }, {});

        setGradeData(gradeDistribution);
      };
      reader.readAsArrayBuffer(blob);
    } catch (error) {
      setErrorStatus("Failed to set grade values");
    }
  };

  const download_evaluation_result = async () => {
    try {
      setErrorStatus(null);
      const response = await fetch(
        LLM_JUDGE_DOWNLOAD_EVALUATION_URL + task_id,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            LLM_JUDGE_API_KEY: LLM_JUDGE_API_KEY_SECRET,
          },
        }
      );

      if (!response.ok) {
        setErrorStatus("Network response was not ok");
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();

      const filename = "data.xlsx";
      // Automatically download the file
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setErrorStatus("Failed to download file");
    }
  };

  const formik = useFormik({
    initialValues: {
      model: "meta-llama/llama-3-70b-instruct",
      apiType: API_TYPE_RATING,
      experiment_option: "new_experiment",
      new_experiment: "",
      existing_experiment: "",
    },
    validationSchema: Yup.object({
      model: Yup.string().required("Model is required"),
      apiType: Yup.string().required("Api type is required"),
      new_experiment: Yup.string().when("experiment_option", {
        is: "new_experiment",
        then: (schema) =>
          schema
            .matches(
              /^[a-zA-Z0-9-]*$/,
              "No spaces or special characters allowed"
            )
            .required("Experiment name is required"),
        otherwise: (schema) => schema,
      }),

      existing_experiment: Yup.string().when("experiment_option", {
        is: "existing_experiment",
        then: (schema) => schema.required("Please select experiment"),
        otherwise: (schema) => schema,
      }),
    }),
    onSubmit: async (values) => {
      if (!file) {
        setErrorStatus("Please upload a file");
        return;
      }

      try {
        /** reset all react state */
        setErrorStatus(null);
        setProgress(null);
        setTask_id(null);
        setProgressVal(0);
        /** ====================== */

        const formData = new FormData();
        formData.append("model", values.model);
        formData.append(API_TYPE_KEY, values.apiType);
        formData.append("file", file);

        const experiment_payload = {
          experiment_option: values.experiment_option,
          existing_experiment: values.existing_experiment,
          new_experiment: values.new_experiment,
          user_id: session?.user?.email,
          apiType: values.apiType,
          filename: file.name,
        };

        setErrorStatus(null);
        const response = await judge_api_batch_call(
          formData,
          experiment_payload
        );
        const returned_task_id = response.data.task_id;
        /** if returned task id is valid then make an event source call to get continuous update */
        setTask_id(returned_task_id);
        setNewData(response.query);

        const eventSource = new EventSource(
          LLM_JUDGE_BATCH_EVENT_URL + returned_task_id
        );

        eventSource.onmessage = (event) => {
          const parsedData = JSON.parse(event.data);
          setProgress(parsedData.status);

          if (parsedData.status === "SUCCESS") {
            setProgressVal(100);
            create_bar_chart(returned_task_id);
          } else if (
            parsedData.status === "PROGRESS" ||
            parsedData.status === "PENDING"
          ) {
            const total = parsedData.total;
            const current = parsedData.current;
            let percent = parseInt((current / total) * 100);
            if (percent === 0) {
              percent = 1;
            }
            setProgressVal(percent);
          } else {
            setErrorStatus("Error receiving server events");
          }
        };

        eventSource.onerror = (event) => {
          console.error("EventSource error:", event);
          //setErrorStatus("Error receiving server events");
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          setErrorStatus(error.response.data.detail);
        } else {
          console.error(error);
          setErrorStatus(
            "Error in processing request, please try again later."
          );
        }
      }
    },
  });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    console.log(file, "file name");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

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
          <Box display={"flex"} height={"100vh"}>
            <EvaluationHistoryLeftBar type={"batch"} result={newData} />
          </Box>
          <Box width={"100%"} height={"93vh"} overflow={"scroll"}>
            <Grid spacing={0} sx={{ flexGrow: 1 }} container>
              <Grid item xs={11}>
                <Grid item xs={12} marginTop={"10px"}>
                  <Typography
                    style={{
                      fontSize: "30px",
                      marginLeft: "25px",
                      color: "#3B3B3B",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    Batch Evaluation
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <div style={{ marginLeft: "30px" }}>
                    {errorStatus && (
                      <Alert
                        variant="outlined"
                        severity="error"
                        sx={{ width: "100%", marginBottom: "20px" }}
                      >
                        {errorStatus}
                      </Alert>
                    )}
                    <form onSubmit={formik.handleSubmit}>
                      <Box
                        padding={"20px"}
                        border={"1px solid grey"}
                        borderRadius={"5px"}
                      >
                        <Box>
                          <ExperimentForm
                            values={formik.values}
                            handleChange={formik.handleChange}
                            handleBlur={formik.handleBlur}
                            errors={formik.errors}
                            touched={formik.touched}
                            type={"batch"}
                            created_experiment={newData?.experiment_name}
                          />
                        </Box>
                        <Box display={"flex"} flexDirection={"row"}>
                          <FormControl
                            error={
                              formik.touched.model &&
                              Boolean(formik.errors.model)
                            }
                          >
                            <InputLabel id="model-label">Model</InputLabel>
                            <Select
                              labelId="model-label"
                              id="model"
                              name="model"
                              value={formik.values.model}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              label="Model"
                            >
                              {LLM_MODELS.map((item, index) => (
                                <MenuItem key={index} value={item.value}>
                                  {item.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {formik.touched.model && formik.errors.model && (
                              <FormHelperText>
                                {formik.errors.model}
                              </FormHelperText>
                            )}
                          </FormControl>
                          <Tooltip
                            title="LLM Model to judge your input"
                            sx={{
                              marginLeft: "5px",
                              cursor: "help",
                              marginTop: "8px",
                            }}
                          >
                            <InfoOutlinedIcon />
                          </Tooltip>
                        </Box>

                        <Box display={"flex"} flexDirection={"row"}>
                          <FormControl
                            component="fieldset"
                            error={
                              formik.touched.apiType &&
                              Boolean(formik.errors.apiType)
                            }
                          >
                            <RadioGroup
                              row
                              aria-label="option"
                              name="apiType"
                              value={formik.values.apiType}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              style={{
                                marginTop: "15px",
                                marginBottom: "15px",
                              }}
                            >
                              <FormControlLabel
                                value={API_TYPE_RATING}
                                control={<Radio />}
                                label="RAG Evaluation - Answer Rating"
                              />
                              <FormControlLabel
                                value={API_TYPE_SIMILARITY}
                                control={<Radio />}
                                label="RAG Evaluation - Answer Similarity"
                              />
                              <FormControlLabel
                                value={API_TYPE_MULTITURN}
                                control={<Radio />}
                                label="Multi-turn Query Rewrite Evaluation"
                              />
                            </RadioGroup>
                            {formik.touched.apiType &&
                              formik.errors.apiType && (
                                <FormHelperText>
                                  {formik.errors.apiType}
                                </FormHelperText>
                              )}
                          </FormControl>
                          <Tooltip
                            title="Select your evaluation type"
                            sx={{
                              marginLeft: "5px",
                              cursor: "help",
                              marginTop: "20px",
                            }}
                          >
                            <InfoOutlinedIcon />
                          </Tooltip>
                        </Box>
                        <Box lineHeight={"40px"} color={"#3B4151"}>
                          <span style={{ color: "red" }}>**</span>Required
                          columns in csv/xlsx file{" "}
                          <span style={{ color: "blue", fontStyle: "italic" }}>
                            {formik.values.apiType == API_TYPE_MULTITURN
                              ? required_column_multi_turn
                              : required_column_rating_similarity}
                          </span>
                        </Box>
                        <Box
                          {...getRootProps()}
                          sx={{
                            border: "2px dashed #ccc",
                            p: 2,
                            textAlign: "center",
                            my: 2,
                            width: "90%",
                          }}
                        >
                          <input {...getInputProps()} />
                          <CloudUploadIcon
                            sx={{ fontSize: 40, color: "#aaa" }}
                          />
                          <Typography variant="body1">
                            Drag & Drop a to Upload CSV/Excel File, or Click to
                            Browse
                          </Typography>
                        </Box>
                        {file && (
                          <Typography variant="body2" marginBottom={"20px"}>
                            Selected file: {file.name}
                          </Typography>
                        )}

                        <Button
                          disabled={
                            progress === "PROGRESS" || progress === "PENDING"
                          }
                          variant="outlined"
                          style={{ width: "200px", marginTop: "10px" }}
                          type="submit"
                        >
                          Submit
                        </Button>
                      </Box>
                      {progress &&
                        (progress === "PENDING" || progress === "PROGRESS") && (
                          <Box
                            marginBottom={"10px"}
                            sx={{ justifyContent: "center", marginTop: "30px" }}
                          >
                            <LinearProgressWithLabel
                              value={progressVal}
                              width={"90%"}
                            />
                          </Box>
                        )}
                      {progress && progress === "SUCCESS" && (
                        <Box sx={{ marginTop: 4, marginBottom: 2 }}>
                          <Button
                            onClick={download_evaluation_result}
                            variant="outlined"
                            startIcon={<CloudDownloadOutlinedIcon />}
                            sx={{ marginBottom: "20px" }}
                          >
                            Download evaluation result
                          </Button>
                        </Box>
                      )}
                      {gradeData && (
                        <Box
                          sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}
                        >
                          <Typography
                            style={{
                              fontSize: "20px",
                              color: "#3B3B3B",
                              margin: "10px",
                              fontWeight: "bold",
                              textDecoration: "none",
                            }}
                          >
                            Grade Distribution
                          </Typography>
                          <BarChart gradeData={gradeData} />
                        </Box>
                      )}
                    </form>
                  </div>
                </Grid>
                <Grid item xs={12} marginLeft={"25px"} marginTop={"50px"}>
                  <Footer />
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default FileUploadForm;
