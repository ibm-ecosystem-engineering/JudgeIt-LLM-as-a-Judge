"use client";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Divider, Toolbar, Typography } from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import Link from "next/link";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import BatchPredictionOutlinedIcon from "@mui/icons-material/BatchPredictionOutlined";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

function LeftNavBar() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status != "loading" &&
      session &&
      session?.error === "RefreshAccessTokenError"
    ) {
      signOut({ callbackUrl: "/" });
    }
  }, [session, status]);

  return (
    <>
      {session && (
        <Sidebar>
          <Toolbar style={{ flexDirection: "column" }}>
            <Typography variant="h5">LLM Judge</Typography>
            {status === "loading" && (
              <Typography style={{ fontSize: "12px" }}>Loading..</Typography>
            )}
            {session && (
              <Typography style={{ fontSize: "12px" }}>
                Logged in as {session.user.email}
              </Typography>
            )}
          </Toolbar>
          <Divider />
          <Menu
            menuItemStyles={{
              button: {
                // the active class will be added automatically by react router
                // so we can use it to style the active menu item
                [`&.active`]: {
                  backgroundColor: "#13395e",
                  color: "#b6c8d9",
                },
              },
            }}
          >
            <MenuItem
              icon={<HomeOutlinedIcon />}
              component={<Link href={"/"} />}
            >
              {" "}
              Home{" "}
            </MenuItem>

            {session && (
              <SubMenu label={"Judge"} defaultOpen icon={<GavelOutlinedIcon />}>
                {session && (
                  <MenuItem
                    icon={<CreateNewFolderOutlinedIcon />}
                    component={<Link href={"/pages/solo"} />}
                  >
                    Single{" "}
                  </MenuItem>
                )}
                {session && (
                  <MenuItem
                    icon={<BatchPredictionOutlinedIcon />}
                    component={<Link href={"/pages/lot"} />}
                  >
                    Batch{" "}
                  </MenuItem>
                )}
              </SubMenu>
            )}

            {!session && (
              <MenuItem
                icon={<LoginOutlinedIcon />}
                onClick={() => signIn("auth0")}
              >
                Login
              </MenuItem>
            )}

            {session && (
              <MenuItem
                icon={<LogoutOutlinedIcon />}
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
              >
                Logout
              </MenuItem>
            )}
          </Menu>
        </Sidebar>
      )}
    </>
  );
}

export default LeftNavBar;
