"use client";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridToolbar from "@/components/globals/DataGridToolbar";
import { API_TYPE_RATING, grade_map_rating, grade_map_similarity } from "@/services/Config";

const RatingSimilarityDataGridSummary = ({ serverData }) => {
  const columns = [
    {
      field: "id",
      headerName: "Id",
      hide: true,
    },
    {
      field: "Question",
      headerName: "Question",
      width: "250",
    },
    {
      field: "experiment_name",
      headerName: "Experiment Name",
      width: "100",
    },
    {
      field: "name",
      headerName: "Name",
      width: "100",
    },
    {
      field: "eval_type",
      headerName: "Eval Type",
    },
    {
      field: "golden_text",
      headerName: "Golden Text",
      width: "400",
    },
    {
      field: "generated_text",
      headerName: "Generated Text",
      width: "400",
    },
    {
      field: "Grade",
      headerName: "JudgeIt Score",
      width: 100,
    },
    {
      field: "Explanation",
      headerName: "JudgeIt Reasoning",
      width: "400",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        {...{
          columns: columns,
          rows: serverData.map((item) => {
            return {
              id: item._id,
              Question: item.question,
              experiment_name: item.experiment_name,
              name: item.name,
              eval_type: item.eval_type,
              golden_text: item.golden_text,
              generated_text: item.generated_text,
              Grade: (item?.Grade) ? item?.Grade : item?.judgeit_score,
              Explanation: (item?.Explanation) ? item?.Grade : item?.judgeit_reasoning
            };
          }),
        }}
        density="compact"
        getRowHeight={() => "auto"}
        autoHeight={true}
        initialState={{
          ...{
            columns: columns,
            rows: [],
          }.initialState,
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        slots={{ toolbar: DataGridToolbar }}
      />
    </div>
  );
};

export default RatingSimilarityDataGridSummary;
