import { Box, Toolbar, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { signOut } from "next-auth/react";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import BatchPredictionOutlinedIcon from "@mui/icons-material/BatchPredictionOutlined";
import HelpCenterOutlinedIcon from "@mui/icons-material/HelpCenterOutlined";
import { app_labels_and_config } from "@/services/Config";

const DrawerMenu = ({
  open,
  handleDrawwerOpen,
  handleDrawwerClose,
  handleLogout,
}) => {
  const list = () => (
    <Box
      sx={{ width: 300 }}
      role="presentation"
      onClick={handleDrawwerClose}
      onKeyDown={handleDrawwerClose}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        sx={{ textDecoration: "none" }}
      >
        <Typography
          style={{
            fontSize: "24px",
            color: "#3B3B3B",
            margin: "10px",
            fontWeight: "bold",
          }}
        >
          {app_labels_and_config.app_title}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/">
            <ListItemIcon>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={"Home"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/pages/single">
            <ListItemIcon>
              <GavelOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={app_labels_and_config.buttons.single_page_action}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/pages/batch">
            <ListItemIcon>
              <BatchPredictionOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={app_labels_and_config.buttons.batch_page_action}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/pages/help">
            <ListItemIcon>
              <HelpCenterOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={"Help"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={(event) => {
              signOut({ callbackUrl: "/" });
            }}
          >
            <ListItemIcon>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={"Logout"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer anchor="right" open={open}>
      {list()}
    </Drawer>
  );
};

export default DrawerMenu;
