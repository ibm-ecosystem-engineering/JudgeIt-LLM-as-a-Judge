import { Box, Typography, useTheme } from "@mui/material";
import IBMIconTop from "./icons/IBMIconTop";

const BuildLab = () => {
  return (
    <Box display={'flex'} >
      <Typography>
        <IBMIconTop />
      </Typography>
      &nbsp; &nbsp;
      <Typography
        variant="h4"
        lineHeight={"40px"}
        alignSelf={'center'}
        noWrap
        component="a"
        href="/"
        sx={{
          mr: 2,
          display: { xs: "none", md: "flex" },
          fontWeight: 500,
          textDecoration: "none",
          color: '#3B3B3B',
        }}
      >
        Ecosystem Engineering
      </Typography>
    </Box>
  );
};

export default BuildLab;