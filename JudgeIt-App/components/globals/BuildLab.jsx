import { Box, Typography, useTheme } from "@mui/material";
import IBMIconTop from "./icons/IBMIconTop";

const BuildLab = ({ icon: IconComponent = IBMIconTop, text, iconColor = 'primary', textColor = 'text.primary' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
      }}
    >
      <IconComponent color={iconColor} sx={{ fontSize: 24, mr: 2 }} />
      <Typography variant="body1" color={textColor}>
        {text}
      </Typography>
    </Box>
  );
};

export default BuildLab;