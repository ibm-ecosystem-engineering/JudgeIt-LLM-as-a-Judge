"use client";
import React from "react";
import { Box, Typography, Divider, Tooltip } from "@mui/material";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  delete_history_by_experiment_name,
  delete_history_by_id,
  fetch_experiment_list_by_type,
} from "@/services/ManagemenBackendAPI";
import { trimText } from "@/utils/Helper";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import { useRouter } from "next/navigation";

import {
  Menu as MaterialMenu,
  MenuItem as MaterialMenuItem,
} from "@mui/material";

const EvaluationHistoryLeftBar = ({ result, type }) => {
  const { data: session, status } = useSession();
  const hasEffectRun = useRef(false);
  const router = useRouter();
  const [serverData, setServerData] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const open = Boolean(anchorEl);

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    if (type === "exp") {
      setSelectedItem({
        name: item,
        leaf_type: "exp",
      });
    } else {
      setSelectedItem(item);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleMenuItemClick = async (action) => {
    if (selectedItem) {
      if (action === "View") {
        if (selectedItem?.leaf_type === "exp") {
          router.push("/pages/" + type + "/exp/" + selectedItem.name);
        } else {
          router.push("/pages/" + type + "/doc/" + selectedItem._id);
        }
      } else if (action === "Delete") {
        if (selectedItem?.leaf_type === "exp") {
          const response = await delete_history_by_experiment_name(
            selectedItem.name,
            session?.user.email
          );
          if (response.status === "success") {
            deleteTopLevelKey(selectedItem.name);
          }
        } else {
          const response = await delete_history_by_id(
            selectedItem._id,
            session?.user.email
          );
          if (response.status === "success") {
            deleteArrayEntry(selectedItem.experiment_name, selectedItem._id);
          }
        }
      }
    }
    handleClose();
  };

  const deleteTopLevelKey = (key) => {
    const { [key]: _, ...rest } = serverData;
    setServerData(rest);
  };

  const deleteArrayEntry = (key, idToRemove) => {
    const updatedArray = serverData[key].filter(
      (item) => item._id !== idToRemove
    );
    setServerData((prevData) => ({
      ...prevData,
      [key]: updatedArray,
    }));
  };

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
    }
  }, [result]); // Trigger update when `result` changes

  const menuItemStyles = {
    root: {
      padding: "0px",
    },
  };
  return (
    <Box width={"300px"} sx={{ backgroundColor: "#202123", color: "#FFFFFF" }}>
      <Box
        width={"250px"}
        height={"40px"}
        display={"flex"} // Use flexbox layout
        justifyContent={"center"} // Center horizontally
        alignItems={"center"} // Center vertically
      >
        <Typography fontSize={"20px"}>History</Typography>
      </Box>
      <Divider style={{ backgroundColor: "#F7F7F8" }} />
      <Sidebar style={{ width: "100%" }} rootStyles={{ border: "none" }}>
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
              icon={<ScienceOutlinedIcon />}
              onContextMenu={(e) =>
                handleContextMenu(e, experiment_name, "exp")
              }
            >
              {serverData[experiment_name].map((item) => (
                <MenuItem
                  key={item._id}
                  style={{ backgroundColor: "#202123", color: "#FFFFFF" }}
                  component={
                    <Link href={"/pages/" + type + "/doc/" + item._id} />
                  }
                  icon={<BiotechOutlinedIcon />}
                  onContextMenu={(e) => handleContextMenu(e, item, "leaf")}
                >
                  <Tooltip title={item.name}>
                    <Typography>{trimText(item.name)}</Typography>
                  </Tooltip>
                </MenuItem>
              ))}
            </SubMenu>
          ))}
        </Menu>
      </Sidebar>
      <MaterialMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {selectedItem && (
          <Typography variant="subtitle1" sx={{ padding: "8px 16px" }}>
            {`${selectedItem.name}`}
          </Typography>
        )}
        <Divider />
        <MaterialMenuItem onClick={() => handleMenuItemClick("Delete")}>
          Delete
        </MaterialMenuItem>
        <MaterialMenuItem onClick={() => handleMenuItemClick("View")}>
          View
        </MaterialMenuItem>
      </MaterialMenu>
    </Box>
  );
};

export default EvaluationHistoryLeftBar;
