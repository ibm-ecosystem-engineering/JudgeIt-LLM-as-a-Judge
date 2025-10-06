"use client";
import {
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import {
  API_TYPE_MULTITURN,
  API_TYPE_SINGLETURN,
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";

import { grade_map_rating, grade_map_similarity, grade_map_multiturn } from "@/services/Config";

const grade_col_name = "JudgeIt Score"
const explanation_col_name = "JudgeIt Reasoning"

const SoloResult = ({ data, api_type }) => {
  return (
    <Paper
      elevation={2}
      sx={{ width: "95%", marginBottom: "10px", backgroundColor: "#F0F7FF" }}
    >
      <Table>
        <TableHead>
          {api_type === API_TYPE_RATING && (
            <TableRow>
              <TableCell sx={{fontWeight: "bold"}}>{grade_col_name}</TableCell>
              <TableCell sx={{fontWeight: "bold"}}>{explanation_col_name}</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_SIMILARITY && (
            <TableRow>
              <TableCell sx={{fontWeight: "bold"}}>{grade_col_name}</TableCell>
              <TableCell sx={{fontWeight: "bold"}}>{explanation_col_name}</TableCell>
            </TableRow>
          )}
          {(api_type === API_TYPE_MULTITURN || api_type === API_TYPE_SINGLETURN) && (
            <TableRow>
              <TableCell sx={{fontWeight: "bold"}}>{grade_col_name}</TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {api_type === API_TYPE_RATING && (
            <TableRow>
              <TableCell>{grade_map_rating[data.Grade]}</TableCell>
              <TableCell>{data.Explanation}</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_SIMILARITY && (
            <TableRow>
              <TableCell>{grade_map_similarity[data.Grade]}</TableCell>
              <TableCell>{data.Explanation}</TableCell>
            </TableRow>
          )}
          {(api_type === API_TYPE_MULTITURN || api_type === API_TYPE_SINGLETURN) && (
            <TableRow>
              <TableCell>{grade_map_multiturn[data.Grade]}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SoloResult;
