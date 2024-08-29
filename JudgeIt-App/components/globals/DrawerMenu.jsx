import { Box, Toolbar, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { signOut } from "next-auth/react";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import BatchPredictionOutlinedIcon from "@mui/icons-material/BatchPredictionOutlined";
import IBMIcon from "./icons/IBMIcon";

const DrawerMenu = ({
  open,
  handleDrawwerOpen,
  handleDrawwerClose,
  handleLogout,
}) => {
  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={handleDrawwerClose}
      onKeyDown={handleDrawwerClose}
    >
      <Box
              display="flex"
              justifyContent="start"
              alignItems="center"
              width="100%"
              
              sx={{ textDecoration: "none" }}
            >
              <IBMIcon></IBMIcon>
                <Typography 
                  style={{ 
                    fontSize: "24px", 
                    color: '#3B3B3B', 
                    margin: '10px', 
                    fontWeight: 'bold',
                  }}
                >
                  JudgeIt
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
          <ListItemButton href="/pages/solo">
            <ListItemIcon>
              <GavelOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={"Single Evaluation"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/pages/lot">
            <ListItemIcon>
              <BatchPredictionOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={"Batch Evaluation"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={(event) => {
              signOut();
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
