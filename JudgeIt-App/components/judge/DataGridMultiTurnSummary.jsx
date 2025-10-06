"use client";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridToolbar from "@/components/globals/DataGridToolbar";

const DataGridMultiTurnSummaryConversation = ({ serverData }) => {
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
      field: "conversation_history",
      headerName: "Conversation history",
      width: "500",
    },
    {
      field: "follow_up_query",
      headerName: "Follow up query",
      width: "300",
    },
    {
      field: "golden_query",
      headerName: "Golden query",
      width: "300",
    },
    {
      field: "rewritten_query",
      headerName: "Rewritten query",
      width: "300",
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
              conversation_history: item.conversation_history,
              follow_up_query: item.follow_up_query,
              golden_query: item.golden_query,
              rewritten_query: item.rewritten_query,
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

export default DataGridMultiTurnSummaryConversation;
