"use client";
import { Box, Typography,AppBar, Link, useMediaQuery, useTheme } from "@mui/material";
import IBMIcon from "./icons/IBMIcon";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DrawerMenu from "@/components/globals/DrawerMenu";
import { useState } from "react";


const Topbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getFontSize = () => {
    if (isSmallScreen) return '16px';
    if (isMediumScreen) return '20px';
    return '24px';
  };

  const getLogoText = () => {
    if (isSmallScreen || isMediumScreen) {
     return 'EE - JudgeIt';
    }
    return 'Ecosystem Engineering - JudgeIt';
  };

  const handleDrawerOpen = () => {
    if (drawerOpen) setDrawerOpen(false);
    else setDrawerOpen(true);
    console.log("act");
  };

  const handleDrawerClose = (event) => {
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
        <AppBar
        position="static"
          style={{
            backgroundColor: "#FFFFFF",
            height: "70px",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="100%"
            p={0}
            onClick={handleDrawerClose}
          >
            <Box
              display="flex"
              justifyContent="start"
              alignItems="center"
              height="100%"
              width="100%"
              
              sx={{ textDecoration: "none" }}
            >
              <Link
                href="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <IBMIcon />
                <Typography 
                sx={{ 
                  fontSize: getFontSize(), 
                  color: '#3B3B3B', 
                  ml: 1, 
                  fontWeight: 'bold',
                }}
              >
                {getLogoText()}
              </Typography>
              </Link>
            </Box>
            <Box
              display="flex"
              justifyContent="end"
              alignItems="center"
              width="100%"
            >
              <Typography style={{ fontSize: "12px", color: '#3B3B3B', marginRight: '10px' }}>
              </Typography>
              <MenuOutlinedIcon
                sx={{ cursor: "pointer", color: "#3B3B3B", marginRight: "20px" }}
                fontSize="large"
                onClick={handleDrawerOpen}
              />
              <DrawerMenu
                open={drawerOpen}
                handleDrawerClose={handleDrawerClose}
                handleDrawerOpen={handleDrawerOpen}
              />
            </Box>
          </Box>
        </AppBar>
  );
};

export default Topbar;
