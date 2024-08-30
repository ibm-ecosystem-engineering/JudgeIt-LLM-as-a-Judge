"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, Box, Typography, Link, Paper } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";

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

import * as XLSX from "xlsx";
import BarChart from "@/components/globals/BarChart";
import { create } from "@mui/material/styles/createTransitions";

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [task_id, setTask_id] = useState(null);
  const { data: session, status } = useSession();
  const [gradeData, setGradeData] = useState(null);

  const required_column_rating_similarity = "golden_text, generated_text";
  const required_column_multi_turn =
    "previous_question, previous_answer, current_question, golden_rewritten_question, rewritten_question";

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
    },
    validationSchema: Yup.object({
      model: Yup.string().required("Model is required"),
      apiType: Yup.string().required("Api type is required"),
    }),
    onSubmit: async (values) => {
      if (!file) {
        alert("Please upload a file");
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

        setErrorStatus(null);
        const response = await judge_api_batch_call(formData);
        const returned_task_id = response.data.task_id;

        /** if returned task id is valid then make an event source call to get continuous update */
        setTask_id(returned_task_id);

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

  return (
    <>
      {session && (
        <div
          style={{
            marginRight: "20%",
            marginLeft: "20%",
            marginTop: "50px",
          }}
        >
          {errorStatus && (
            <Alert
              variant="outlined"
              severity="error"
              sx={{ width: "75%", marginBottom: "20px" }}
            >
              {errorStatus}
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Paper elevation={2} sx={{ padding: "20px", width: "90%" }}>
              <Box>
                <FormControl
                  style={{ width: "300px" }}
                  error={formik.touched.model && Boolean(formik.errors.model)}
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
                    <FormHelperText>{formik.errors.model}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box>
                <FormControl
                  component="fieldset"
                  error={
                    formik.touched.apiType && Boolean(formik.errors.apiType)
                  }
                >
                  <RadioGroup
                    row
                    aria-label="option"
                    name="apiType"
                    value={formik.values.apiType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ marginTop: "15px", marginBottom: "15px" }}
                  >
                    <FormControlLabel
                      value={API_TYPE_RATING}
                      control={<Radio />}
                      label="Rating"
                    />
                    <FormControlLabel
                      value={API_TYPE_SIMILARITY}
                      control={<Radio />}
                      label="Similarity"
                    />
                    <FormControlLabel
                      value={API_TYPE_MULTITURN}
                      control={<Radio />}
                      label="Multi-turn"
                    />
                  </RadioGroup>
                  {formik.touched.apiType && formik.errors.apiType && (
                    <FormHelperText>{formik.errors.apiType}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box lineHeight={"40px"} color={"#3B4151"}>
                <span style={{ color: "red" }}>**</span>Required columns in
                csv/xlsx file{" "}
                <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
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
                <CloudUploadIcon sx={{ fontSize: 40, color: "#aaa" }} />
                <Typography variant="body1">
                  Drag & Drop a to Upload CSV/Excel File, or Click to Browse
                </Typography>
              </Box>
              {file && (
                <Typography variant="body2" marginBottom={"20px"}>
                  Selected file: {file.name}
                </Typography>
              )}

              <Button
                disabled={progress === "PROGRESS" || progress === "PENDING"}
                variant="outlined"
                style={{ width: "200px", marginTop: "10px" }}
                type="submit"
              >
                Submit
              </Button>
            </Paper>
            {progress &&
              (progress === "PENDING" || progress === "PROGRESS") && (
                <Box
                  marginBottom={"10px"}
                  sx={{ justifyContent: "center", marginTop: "30px" }}
                >
                  <LinearProgressWithLabel value={progressVal} width={"90%"} />
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
              <Box sx={{ width: "90%", marginTop: 4, marginBottom: 2 }}>
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
                      <b>Input: </b>Provide an excel/csv file with the following
                      columns:
                    </li>

                    <ul className="list-none ml-8">
                      <li>golden_text</li>
                      <li>generated_text</li>
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
                      <b>Input: </b>Provide an excel/csv file with the following
                      columns:
                    </li>
                    <ul className="list-none ml-8">
                      <li>golden_text</li>
                      <li>generated_text</li>
                    </ul>
                    <li>
                      <b>Output: </b>The LLM Judge will output a Grade and
                      Explanation. A grade of 1 means the texts are dissimilar,
                      a grade of 2 means the texts are partially similar, and a
                      text of 3 means the texts are significantly similar
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
                <b>Note:</b> Your input files can contain additional columns
                than the ones specified above. These columns will have no effect
                on the LLM Judge and will be preserved in the output file.
              </Typography>
            </Box>
          </form>
        </div>
      )}
    </>
  );
};

export default FileUploadForm;
