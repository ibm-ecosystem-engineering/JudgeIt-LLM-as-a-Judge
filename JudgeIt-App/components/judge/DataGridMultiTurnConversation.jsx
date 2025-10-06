"use client";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import DataGridToolbar from "@/components/globals/DataGridToolbar";

const DataGridMultiTurnConversation = ({ serverData }) => {
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
      field: "conversation_history",
      headerName: "Conversation history",
      width: "400",
    },
    {
      field: "follow_up_query",
      headerName: "Follow up query",
      width: "400",
    },
    {
      field: "golden_query",
      headerName: "Golden query",
      width: "400",
    },
    {
      field: "rewritten_query",
      headerName: "Rewritten query",
      width: "400",
    },
    {
      field: "Grade",
      headerName: "Grade",
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
              model: item.content.query.model,
              conversation_history: item.content.query.conversation_history,
              follow_up_query: item.content.query.follow_up_query,
              golden_query: item.content.query.golden_query,
              rewritten_query: item.content.query.rewritten_query,
              Grade: item.content.result.Grade
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

export default DataGridMultiTurnConversation;
