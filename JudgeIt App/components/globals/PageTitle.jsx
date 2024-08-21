import {Box, Typography} from '@mui/material'

const PageTitle = ({ title }) => {
  return (
    <Box justifyContent={"center"} display={"flex"} marginBottom={'25px'}>
      <Typography variant="h4">{title}</Typography>
    </Box>
  );
};

export default PageTitle;
