"use client";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridToolbar from "@/components/globals/DataGridToolbar";

const DataGridSingleTurnSummary = ({ serverData }) => {
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
      field: "experiment_name",
      headerName: "Experiment Name",
      width: "250",
    },
    {
      field: "eval_type",
      headerName: "Eval Type",
    },
    
    {
      field: "previous_question",
      headerName: "Previous Question",
      width: "400",
    },
    {
      field: "previous_answer",
      headerName: "Previous Answer",
      width: "400",
    },
    {
      field: "current_question",
      headerName: "Current Question",
      width: "400",
    },
    {
      field: "golden_rewritten_question",
      headerName: "Golden Rewritten Question",
      width: "400",
    },
    {
      field: "rewritten_question",
      headerName: "Rewritten Question",
      width: "400",
    },
    {
      field: "Grade",
      headerName: "JudgeIt Score",
      width: 100,
    }
  ];

  return (
    <div style={{height: 350}}>
      {" "}
      <DataGrid
        {...{
          columns: columns,
          rows: serverData.map((item) => {
            return {
              id: item._id,
              name: item.name,
              eval_type: item.eval_type,
              experiment_name: item.experiment_name,
              previous_question: item.previous_question,
              previous_answer: item.previous_answer,
              current_question: item.current_question,
              golden_rewritten_question: item.golden_rewritten_question,
              rewritten_question: item.rewritten_question,
              Grade: (item?.Grade) ? item?.Grade : item?.judgeit_score
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

export default DataGridSingleTurnSummary;
