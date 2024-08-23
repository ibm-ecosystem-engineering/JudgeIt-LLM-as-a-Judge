"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, Box, Typography, Link, Paper } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import PageTitle from "@/components/globals/PageTitle";
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

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [task_id, setTask_id] = useState(null);
  const { data: session, status } = useSession();

  const required_column_rating_similarity = "golden_text, generated_text";
  const required_column_multi_turn =
    "previous_question, previous_answer, current_question, golden_rewritten_question, rewritten_question";

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
            marginRight: "20px",
            marginLeft: "200px",
            marginTop: "50px",
          }}
        >
          <PageTitle title={"LLM Judge Batch Request"} />
          {progress && progress === "SUCCESS" && (
            <Box>
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
                  Drag 'n' drop a csv/xlsx file here, or click to select one
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
                style={{ width: "200px" }}
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
          </form>
        </div>
      )}
    </>
  );
};

export default FileUploadForm;
