import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore,
  FitnessCenter,
  CheckCircle,
  Cancel,
  Schedule,
  Edit,
  Add,
  Refresh,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from 'react-query';
import { workoutApi } from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface WorkoutPlansDisplayProps {
  workoutPlans?: any[];
  loading: boolean;
}

const WorkoutPlansDisplay: React.FC<WorkoutPlansDisplayProps> = ({
  workoutPlans,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const queryClient = useQueryClient();

  const updateSessionMutation = useMutation(
    ({ sessionId, status, notes }: { sessionId: number; status: string; notes?: string }) =>
      workoutApi.updateWorkoutSession(sessionId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workoutPlans');
        toast.success('Session updated successfully!');
        setSessionDialogOpen(false);
      },
      onError: () => {
        toast.error('Failed to update session');
      },
    }
  );

  const regeneratePlanMutation = useMutation(
    (planId: number) => workoutApi.createWorkoutPlan({ plan_id: planId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('workoutPlans');
        toast.success('Workout plan regenerated!');
      },
      onError: () => {
        toast.error('Failed to regenerate plan');
      },
    }
  );

  const handleSessionUpdate = (session: any, status: string) => {
    setSelectedSession(session);
    setSessionNotes(session.notes || '');
    setSessionDialogOpen(true);
  };

  const confirmSessionUpdate = () => {
    if (selectedSession) {
      updateSessionMutation.mutate({
        sessionId: selectedSession.id,
        status: selectedSession.status,
        notes: sessionNotes,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'missed':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'missed':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <Typography>Loading workout plans...</Typography>
    </Box>
    );
  }

  if (!workoutPlans || workoutPlans.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <FitnessCenter sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            No Workout Plans Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Complete your user constraints to generate your first personalized workout plan.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            }}
          >
            Generate Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        {workoutPlans.map((plan, index) => (
          <Grid item xs={12} key={plan.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      {plan.weeks}-Week Workout Plan
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => regeneratePlanMutation.mutate(plan.id)}
                        disabled={regeneratePlanMutation.isLoading}
                        size="small"
                      >
                        Regenerate
                      </Button>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start Date: {dayjs(plan.start_date).format('MMMM DD, YYYY')}
                  </Typography>

                  {plan.rationale && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Plan Rationale:
                      </Typography>
                      <Typography variant="body2">
                        {plan.rationale}
                      </Typography>
                    </Alert>
                  )}

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Workout Sessions
                  </Typography>

                  {plan.sessions && plan.sessions.length > 0 ? (
                    <Box>
                      {plan.sessions.map((session: any, sessionIndex: number) => (
                        <Accordion key={session.id} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                                  {dayjs(session.date).format('MMMM DD, YYYY')}
                                </Typography>
                                <Chip
                                  label={session.status}
                                  color={getStatusColor(session.status) as any}
                                  size="small"
                                  icon={getStatusIcon(session.status)}
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={8}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                  Exercises:
                                </Typography>
                                {session.exercises && session.exercises.length > 0 ? (
                                  <List dense>
                                    {session.exercises.map((exercise: any, exIndex: number) => (
                                      <ListItem key={exIndex}>
                                        <ListItemIcon>
                                          <FitnessCenter color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={exercise.name}
                                          secondary={`${exercise.sets} sets × ${exercise.reps} reps${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No exercises planned for this session.
                                  </Typography>
                                )}
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleSessionUpdate(session, 'completed')}
                                    disabled={session.status === 'completed'}
                                  >
                                    Mark Complete
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Cancel />}
                                    onClick={() => handleSessionUpdate(session, 'missed')}
                                    disabled={session.status === 'missed'}
                                  >
                                    Mark Missed
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="warning"
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={() => handleSessionUpdate(session, 'rescheduled')}
                                  >
                                    Reschedule
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No sessions planned for this workout plan.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Session Update Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Workout Session</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Session Notes"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Add any notes about this session..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmSessionUpdate}
            variant="contained"
            disabled={updateSessionMutation.isLoading}
          >
            {updateSessionMutation.isLoading ? 'Updating...' : 'Update Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default WorkoutPlansDisplay;
