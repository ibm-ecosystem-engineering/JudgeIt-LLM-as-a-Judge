"use client";
import React from "react";
import { TextField, Box, Typography, Divider } from "@mui/material";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetch_experiment_list_by_type } from "@/services/ManagemenBackendAPI";

const EvaluationHistoryLeftBar = ({ result, type }) => {
  const { data: session, status } = useSession();
  const hasEffectRun = useRef(false);
  const [serverData, setServerData] = useState([]);

  useEffect(() => {
    if (hasEffectRun.current) {
      return; // Prevents the effect from running again
    }

    const fetch_data = async () => {
      const data = await fetch_experiment_list_by_type(
        session.user.email,
        type
      );
      setServerData(data);
    };

    if (session.user.email) {
      fetch_data();
      hasEffectRun.current = true;
    }
  }, [session.user.email]); // Empty dependency array, runs only once

  useEffect(() => {
    if (result) {
      setServerData((prevServerData) => {
        // Create a copy of prevServerData to avoid direct mutation
        const newServerData = { ...prevServerData };

        // Check if the experiment_name already exists in the data
        if (newServerData[result.experiment_name]) {
          // If it exists, update it with the new result query
          newServerData[result.experiment_name].push(result);
        } else {
          // If it doesn't exist, add a new key and array with the result query
          newServerData[result.experiment_name] = [result];
        }

        // Return the updated data
        return newServerData;
      });
      console.log("useeffect", serverData);
    }
  }, [result]); // Trigger update when `result` changes

  const menuItemStyles = {
    root: {
      padding: "0px",
    },
  };
  return (
    <Box
      width={"100%"}
      minHeight={"100vh"}
      sx={{ backgroundColor: "#202123", color: "#FFFFFF" }}
    >
      <Box
        display={"flex"}
        width={"100%"}
        height={"40px"}
        justifyContent={"center"}
        padding={"10px"}
        fontSize={"20px"}
      >
        History
      </Box>
      <Divider style={{ backgroundColor: "#F7F7F8" }} />
      <Sidebar
        rootStyles={{ border: "none", width: "100%" }}
        style={{ width: "100%" }}
      >
        <Menu menuItemStyles={menuItemStyles}>
          {Object.keys(serverData).map((experiment_name) => (
            <SubMenu
              defaultOpen
              key={experiment_name}
              label={experiment_name}
              style={{ backgroundColor: "#202123", color: "#FFFFFF" }}
              component={
                <Link href={"/pages/" + type + "/exp/" + experiment_name} />
              }
            >
              {serverData[experiment_name].map((item) => (
                <MenuItem
                  key={item._id}
                  style={{ backgroundColor: "#202123", color: "#FFFFFF" }}
                  component={
                    <Link href={"/pages/" + type + "/doc/" + item._id} />
                  }
                >
                  {item.name}
                </MenuItem>
              ))}
            </SubMenu>
          ))}
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default EvaluationHistoryLeftBar;
