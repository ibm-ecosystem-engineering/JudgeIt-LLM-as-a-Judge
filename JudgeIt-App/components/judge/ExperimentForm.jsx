"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Box,
  FormControlLabel,
  RadioGroup,
  FormHelperText,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { get_experiment_list } from "@/services/ManagemenBackendAPI";
import { useSession } from "next-auth/react";
import { getRandomInt } from "@/utils/Helper";

const ExperimentForm = ({
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
  type,
  created_experiment,
}) => {
  const [serverData, setServerData] = useState([]);
  const hasEffectRun = useRef(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const data = await get_experiment_list(session.user.email, type);
      setServerData(data);
      console.log(data);
    };

    if (session?.user.email) {
      fetch_data();
      hasEffectRun.current = true;
    }
  }, [session]); // Empty dependency array, runs only once

  useEffect(() => {
    if (created_experiment) {
      const newData = {
        name: created_experiment,
      };
      setServerData((prevData) => [...prevData, newData]);
      console.log("useeffect", serverData);
    }
  }, [created_experiment]); // Trigger update when `result` changes

  return (
    <div>
      <Box marginBottom={"20px"} marginRight={"20px"}>
        <FormControl
          component="fieldset"
          error={touched.experiment_option && Boolean(errors.experiment_option)}
        >
          <RadioGroup
            row
            aria-label="option"
            name={"experiment_option"}
            value={values.experiment_option}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <FormControlLabel
              value={"new_experiment"}
              control={<Radio />}
              label="New"
            />
            <FormControlLabel
              value={"existing_experiment"}
              control={<Radio />}
              label="Existing"
            />
          </RadioGroup>
          {touched.experiment_option && errors.experiment_option && (
            <FormHelperText>{errors.experiment_option}</FormHelperText>
          )}
        </FormControl>
      </Box>
      {values.experiment_option === "new_experiment" && (
        <Box marginBottom={"20px"}>
          <TextField
            label="New experiment"
            name="new_experiment"
            value={values.new_experiment}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.new_experiment && Boolean(errors.new_experiment)}
            helperText={touched.new_experiment && errors.new_experiment}
            style={{ width: "100%" }}
          />
        </Box>
      )}
      {values.experiment_option === "existing_experiment" && (
        <Box marginBottom={"20px"} marginRight={"20px"}>
          <FormControl
            error={
              touched.existing_experiment && Boolean(errors.existing_experiment)
            }
          >
            <InputLabel id="existing_experiment-label">Experiment</InputLabel>
            <Select
              sx={{ width: "200px" }}
              labelId="existing_experiment-label"
              id="existing_experiment"
              name="existing_experiment"
              value={values.existing_experiment}
              onChange={handleChange}
              onBlur={handleBlur}
              label="Experiment"
            >
              {serverData.map((item, index) => (
                <MenuItem
                  key={index + "-" + getRandomInt(100)}
                  value={item.name}
                >
                  {item.name}
                </MenuItem>
              ))}
            </Select>
            {touched.existing_experiment && errors.existing_experiment && (
              <FormHelperText>{errors.existing_experiment}</FormHelperText>
            )}
          </FormControl>
        </Box>
      )}
    </div>
  );
};

export default ExperimentForm;
