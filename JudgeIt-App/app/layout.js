import "../styles/globals.css";
import Footer from "@/components/globals/Footer";
import Topbar from "@/components/globals/Topbar";
import { Grid, Box, AppBar } from "@mui/material";

export const metadata = {
  title: "LLM Judge Application",
  description: "LLM Judge Application to evaluate LLM response.",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning={true}>
        <body suppressHydrationWarning={true}>
          <div style={{ minHeight: "90vh" }}>
            <Topbar />
            <Grid sx={{ flexGrow: 1 }} container spacing={0}>
              <Grid item xs={12}>
                <Box height={"10px"}></Box>
                <Box>{children}</Box>
              </Grid>
            </Grid>
          </div>
          <Footer />
        </body>
      </html>
  );
}
