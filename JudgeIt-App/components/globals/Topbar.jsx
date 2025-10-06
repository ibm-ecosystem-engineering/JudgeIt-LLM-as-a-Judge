"use client";
import {
  Box,
  Typography,
  AppBar,
  Link,
  useMediaQuery,
  useTheme,
  Tooltip,
  IconButton,
} from "@mui/material";
import IBMIcon from "./icons/IBMIcon";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DrawerMenu from "@/components/globals/DrawerMenu";
import { useState } from "react";
import { useSession } from "next-auth/react";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  app_labels_and_config,
} from "@/services/Config";

const Topbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session, status } = useSession();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const getFontSize = () => {
    if (isSmallScreen) return "16px";
    if (isMediumScreen) return "18px";
    return "20px";
  };

  const handleDrawerOpen = () => {
    if (drawerOpen) setDrawerOpen(false);
    else setDrawerOpen(true);
  };

  const handleDrawerClose = (event) => {
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
    <>
      {session && (
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
            color={"#3B3B3B"}
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
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <IBMIcon />
                <Typography
                  sx={{
                    fontSize: getFontSize(),
                    color: "#3B3B3B",
                    fontFamily: '"Source Sans Pro", sans-serif',
                    ml: 1,
                  }}
                >
                  {app_labels_and_config.logo_text}
                </Typography>
              </Link>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              textAlign={"center"}
              width={"100%"}
            >
              <Typography
                fontWeight={"600"}
                fontSize={"1.8rem"}
                lineHeight={"2.5rem"}
                fontFamily={'"Source Sans Pro", sans-serif'}
              >
                {app_labels_and_config.app_title}
              </Typography>
              <Typography
                variant="h7"
                fontFamily={'"Source Sans Pro", sans-serif'}
              >
                {app_labels_and_config.app_subtitle}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="end"
              alignItems="center"
              width="100%"
            >
              <Typography
                style={{
                  fontSize: "12px",
                  color: "#3B3B3B",
                  marginRight: "10px",
                }}
              >
                Logged in as {session.user.email}
              </Typography>
              <Tooltip title="Source code">
                <IconButton href={app_labels_and_config.github} target="_blank">
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"end"}
                marginRight={"10px"}
              >
                <Typography alignSelf={"end"} fontSize={"11px"}>
                  {app_labels_and_config.app_version}
                </Typography>
                <Link
                  href={app_labels_and_config.github_issues}
                  underline="none"
                  alignSelf={"end"}
                  target="_blank"
                  fontSize={"11px"}
                >
                  Report an issue
                </Link>
              </Box>
              <MenuOutlinedIcon
                sx={{
                  cursor: "pointer",
                  color: "#3B3B3B",
                  marginRight: "20px",
                }}
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
