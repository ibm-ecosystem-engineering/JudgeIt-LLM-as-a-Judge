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
  API_TYPE_RATING,
  API_TYPE_SIMILARITY,
} from "@/services/Config";

const SoloResult = ({ data, api_type }) => {
  return (
    <Paper
      elevation={2}
      sx={{ width: "90%", marginBottom: "10px", backgroundColor: "#F0F7FF" }}
    >
      <Table>
        <TableHead>
          {api_type === API_TYPE_RATING && (
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell>Explanation</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_SIMILARITY && (
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell>Explanation</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_MULTITURN && (
            <TableRow>
              <TableCell>Grade</TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {api_type === API_TYPE_RATING && (
            <TableRow>
              <TableCell>{data.Grade}</TableCell>
              <TableCell>{data.Explanation}</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_SIMILARITY && (
            <TableRow>
              <TableCell>{data.Grade}</TableCell>
              <TableCell>{data.Explanation}</TableCell>
            </TableRow>
          )}
          {api_type === API_TYPE_MULTITURN && (
            <TableRow>
              <TableCell>{data.Grade}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SoloResult;
