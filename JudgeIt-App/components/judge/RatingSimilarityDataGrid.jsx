"use client";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridToolbar from "@/components/globals/DataGridToolbar";
import { API_TYPE_RATING, grade_map_rating, grade_map_similarity } from "@/services/Config";

const RatingSimilarityDataGrid = ({ serverData }) => {
  const columns = [
    {
      field: "id",
      headerName: "Id",
      hide: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: "250",
    },
    {
      field: "eval_type",
      headerName: "Eval Type",
    },
    {
      field: "model",
      headerName: "Model",
      width: "250",
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
      {" "}
      <DataGrid
        {...{
          columns: columns,
          rows: serverData.map((item) => {
            return {
              id: item._id,
              name: item.name,
              eval_type: item.eval_type,
              model: item.content.query.model,
              golden_text: item.content.query.golden_text,
              generated_text: item.content.query.generated_text,
              Grade: (item.eval_type === API_TYPE_RATING) ? grade_map_rating[item.content.result.Grade] : grade_map_similarity[item.content.result.Grade],
              Explanation: item.content.result.Explanation,
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

export default RatingSimilarityDataGrid;
