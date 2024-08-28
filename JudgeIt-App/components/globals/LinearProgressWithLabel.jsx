import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LinearProgressWithLabel({ value, width }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: width, mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}