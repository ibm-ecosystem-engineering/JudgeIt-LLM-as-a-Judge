import { Inter } from "next/font/google";
import "../styles/globals.css";
import LeftNavBar from "@/components/globals/LeftNavigation";
import { Grid, Box } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LLM Judge Application",
  description: "LLM Judge Application to evaluate LLM response.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <Grid sx={{ flexGrow: 1 }} container spacing={0}>
          <Grid item xs={2} style={{ display: "flex", height: "100vh" }}>
            <LeftNavBar />
          </Grid>
          <Grid item xs={10}>
            <Box height={"50px"}></Box>
            <Box>{children}</Box>
          </Grid>
        </Grid>
      </body>
    </html>
  );
}
