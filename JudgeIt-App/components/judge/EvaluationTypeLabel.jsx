"use client";
import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const EvaluationTypeLabel = ({ label, tooltip }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <span>{label}</span>
      <Tooltip
        title={tooltip}
        sx={{
          cursor: "help",
          marginLeft: "5px",
        }}
      >
        <InfoOutlinedIcon />
      </Tooltip>
    </div>
  );
};

export default EvaluationTypeLabel;
