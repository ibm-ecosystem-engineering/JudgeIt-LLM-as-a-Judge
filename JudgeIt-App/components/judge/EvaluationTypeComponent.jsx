import {
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import {
  API_TYPE_MULTITURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
  API_TYPE_KEY,
} from "@/services/Config";
import EvaluationTypeLabel from "@/components/judge/EvaluationTypeLabel";

const EvaluationTypeComponent = ({
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
  api_call_inprogress
}) => {
  return (
    <div>
      {" "}
      <FormControl
        component="fieldset"
        error={touched.apiType && Boolean(errors.apiType)}
        disabled={api_call_inprogress}
      >
        <FormLabel id="demo-radio-buttons-group-label">
          Evaluation Type
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          aria-label="option"
          name={API_TYPE_KEY}
          value={values.apiType}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <FormControlLabel
            value={API_TYPE_RATING}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Evaluate generated text against golden text and receive a binary score for similarity"
                label={"RAG Evaluation - Answer Rating"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_SIMILARITY}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Evaluate generated text against golden text and receive a 1/2/3 rating based on degree of similarity"
                label={"RAG Evaluation - Answer Similarity"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_MULTITURN}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Evaluate rewritten queries given a mult-turn conversation and receive a binary score for similarity"
                label={"Multi-turn Query Rewrite Evaluation"}
              />
            }
          />
        </RadioGroup>
        {touched.apiType && errors.apiType && (
          <FormHelperText>{errors.apiType}</FormHelperText>
        )}
      </FormControl>
    </div>
  );
};

export default EvaluationTypeComponent;
