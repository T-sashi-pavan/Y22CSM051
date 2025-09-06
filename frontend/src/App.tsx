import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import UrlShortenerPage from './components/UrlShortenerPage';
import StatisticsPage from './components/StatisticsPage';
import { logger } from './utils/logging';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = React.useState(0);

  React.useEffect(() => {
    logger.info('URL Shortener application started', 'App');
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    logger.info(`Navigated to tab ${newValue}`, 'App');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <LinkIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              URL Shortener Service
            </Typography>
            
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} disableGutters>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="URL shortener navigation"
                sx={{ minHeight: 60 }}
              >
                <Tab label="Shorten URLs" sx={{ fontWeight: 'bold', minHeight: 60 }} />
                <Tab label="Statistics" sx={{ fontWeight: 'bold', minHeight: 60 }} />
              </Tabs>
            </Container>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UrlShortenerPage />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <StatisticsPage />
          </TabPanel>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
