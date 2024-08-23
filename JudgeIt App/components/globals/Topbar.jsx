"use client";
import { Box, Typography, AppBar } from "@mui/material";
import BuildLab from "@/components/globals/BuildLab";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DrawerMenu from "@/components/globals/DrawerMenu";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const Topbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleDrawwerOpen = () => {
    if (drawerOpen) setDrawerOpen(false);
    else setDrawerOpen(true);
    console.log("act");
  };

  const handleDrawwerClose = (event) => {
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
            display={"flex"}
            justifyContent={"space-between"}
            p={0}
            onClick={handleDrawwerClose}
          >
            {/* IBM Build lab logo  */}
            <Box display={"flex"} width={"33%"}>
              <BuildLab />
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              textAlign={"center"}
              width={"34%"}
            >
              <Typography
                fontWeight={"600"}
                fontSize={"1.5rem"}
                lineHeight={"2.5rem"}
                color={"#3B3B3B"}
              >
                JudgeIt Application
              </Typography>
              <Typography variant="h7" color={"#3B3B3B"}>
                Evaluate your LLM generated text
              </Typography>
            </Box>

            <Box
              display={"flex"}
              justifyContent={"end"}
              width={"33%"}
              flexDirection={"row"}
            >
              <Box display={"flex"} justifyItems={"center"}>
                <Box
                  lineHeight={"50px"}
                  display={"flex"}
                  color={"#3B3B3B"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  ml={"10px"}
                  mr={"20px"}
                >
                  <MenuOutlinedIcon
                    sx={{ cursor: "pointer" }}
                    color="inherit"
                    fontSize="large"
                    onClick={handleDrawwerOpen}
                  />
                  <DrawerMenu
                    open={drawerOpen}
                    handleDrawwerClose={handleDrawwerClose}
                    handleDrawwerOpen={handleDrawwerOpen}
                  />
                </Box>
              </Box>
            </Box>
          </Box>{" "}
        </AppBar>
      )}
    </>
  );
};

export default Topbar;
