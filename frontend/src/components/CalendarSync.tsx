import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CalendarToday,
  Sync,
  CheckCircle,
  Warning,
  Info,
  Google,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { calendarApi } from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const CalendarSync: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const queryClient = useQueryClient();

  const { data: calendarEvents, isLoading: eventsLoading } = useQuery(
    'calendarEvents',
    calendarApi.getCalendarEvents,
    {
      retry: 1,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const syncMutation = useMutation(calendarApi.syncWithGoogle, {
    onSuccess: () => {
      setSyncStatus('success');
      queryClient.invalidateQueries('calendarEvents');
      queryClient.invalidateQueries('workoutPlans');
      toast.success('Calendar synced successfully!');
      setTimeout(() => setSyncStatus('idle'), 3000);
    },
    onError: (error: any) => {
      setSyncStatus('error');
      toast.error(error.response?.data?.message || 'Failed to sync with Google Calendar');
      setTimeout(() => setSyncStatus('idle'), 3000);
    },
  });

  const handleSync = () => {
    setSyncStatus('syncing');
    syncMutation.mutate();
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'syncing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'success':
        return 'Sync completed successfully!';
      case 'error':
        return 'Sync failed. Please try again.';
      case 'syncing':
        return 'Syncing with Google Calendar...';
      default:
        return 'Ready to sync';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        {/* Google Calendar Integration */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Google sx={{ fontSize: 32, color: '#4285f4', mr: 2 }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Google Calendar Integration
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Sync your workout sessions with Google Calendar to keep track of your fitness schedule.
                    Your workout sessions will be automatically added to your calendar.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Sync />}
                    onClick={handleSync}
                    disabled={syncStatus === 'syncing'}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      px: 3,
                      py: 1.5,
                    }}
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync with Google Calendar'}
                  </Button>
                  
                  <Chip
                    label={getSyncStatusText()}
                    color={getSyncStatusColor() as any}
                    icon={
                      syncStatus === 'success' ? <CheckCircle /> :
                      syncStatus === 'error' ? <Warning /> :
                      syncStatus === 'syncing' ? <Sync /> : <Info />
                    }
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Automatic Event Creation"
                          secondary="Workout sessions are automatically added to your calendar"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Real-time Updates"
                          secondary="Changes to workout sessions sync instantly"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Smart Notifications"
                          secondary="Get reminders before your workout sessions"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Conflict Detection"
                          secondary="Automatically detects scheduling conflicts"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Calendar Events Display */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Upcoming Calendar Events
                </Typography>

                {eventsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography>Loading calendar events...</Typography>
                  </Box>
                ) : calendarEvents && calendarEvents.length > 0 ? (
                  <List>
                    {calendarEvents.map((event: any, index: number) => (
                      <React.Fragment key={event.id}>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={event.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {dayjs(event.start).format('MMMM DD, YYYY [at] h:mm A')} - {dayjs(event.end).format('h:mm A')}
                                </Typography>
                                {event.description && (
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {event.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip
                            label={event.status || 'Scheduled'}
                            color={event.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                        {index < calendarEvents.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarToday sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No Calendar Events
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sync with Google Calendar to see your workout sessions here.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default CalendarSync;
