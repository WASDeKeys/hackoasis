import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  AccountCircle,
  FitnessCenter,
  CalendarToday,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { workoutApi } from '../services/api';
import UserConstraintsForm from '../components/UserConstraintsForm';
import WorkoutPlansDisplay from '../components/WorkoutPlansDisplay';
import CalendarSync from '../components/CalendarSync';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading: profileLoading } = useQuery(
    'userProfile',
    workoutApi.getUserProfile,
    {
      retry: 1,
    }
  );

  const { data: workoutPlans, isLoading: plansLoading } = useQuery(
    'workoutPlans',
    workoutApi.getWorkoutPlans,
    {
      retry: 1,
    }
  );

  const updateProfileMutation = useMutation(workoutApi.updateUserProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('userProfile');
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <FitnessCenter sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Adaptive Workout Scheduler
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.username}!
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
            Dashboard
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
            >
              <Tab label="User Constraints" icon={<Settings />} />
              <Tab label="Workout Plans" icon={<FitnessCenter />} />
              <Tab label="Calendar Sync" icon={<CalendarToday />} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UserConstraintsForm
              userProfile={userProfile}
              onUpdate={updateProfileMutation.mutate}
              loading={updateProfileMutation.isLoading}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <WorkoutPlansDisplay
              workoutPlans={workoutPlans}
              loading={plansLoading}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CalendarSync />
          </TabPanel>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;
