"use client";
import { Box, Typography,AppBar, Link } from "@mui/material";
import IBMIcon from "./icons/IBMIcon";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DrawerMenu from "@/components/globals/DrawerMenu";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const Topbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleDrawerOpen = () => {
    if (drawerOpen) setDrawerOpen(false);
    else setDrawerOpen(true);
    console.log("act");
  };

  const handleDrawerClose = (event) => {
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
    <>
      {session && (
        <AppBar
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
                  style={{ 
                    fontSize: "24px", 
                    color: '#3B3B3B', 
                    margin: '10px', 
                    fontWeight: 'bold',
                  }}
                >
                  Ecosystem Engineering - JudgeIt
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
                Logged in as {session.user.email}
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
      )}
    </>
  );
};

export default Topbar;
