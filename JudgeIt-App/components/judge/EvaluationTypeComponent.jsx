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
  API_TYPE_WBOX_SDR,
  API_TYPE_BBOX_SDR,  
  API_TYPE_KEY,
  API_TYPE_SINGLETURN,
  API_TYPE_AGENT,
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
            value={API_TYPE_SINGLETURN}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Evaluate rewritten queries given a single turn conversation and receive a binary score for similarity"
                label={"Single turn Query Rewrite Evaluation"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_MULTITURN}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Evaluate rewritten queries given a mult-turn with conversation history and receive a binary score for similarity"
                label={"Multi turn Query Rewrite Evaluation"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_WBOX_SDR}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Run WhiteBox Evaluation for Agentic Solution"
                label={"WhiteBox Evaluation - Thought Trail Eval"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_BBOX_SDR}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Run BlackBox Evaluation for Agentic Solution"
                label={"BlackBox Evaluation - Agent Quality Eval"}
              />
            }
          />
          <FormControlLabel
            value={API_TYPE_AGENT}
            control={<Radio />}
            label={
              <EvaluationTypeLabel
                tooltip="Run Evaluation for Agentic Solution"
                label={"Agent Evaluation - Agent Quality and Workflow Eval"}
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
