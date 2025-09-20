import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  weeklyAvailability: yup.object().required('Weekly availability is required'),
  equipment: yup.array().min(1, 'Please select at least one equipment type'),
  fatigueLevel: yup.number().min(1).max(10).required('Fatigue level is required'),
});

interface UserConstraintsFormProps {
  userProfile?: any;
  onUpdate: (data: any) => void;
  loading: boolean;
}

const equipmentOptions = [
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Squat Rack',
  'Cardio Machine',
  'Yoga Mat',
  'None',
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = [
  '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
  '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
  '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
];

const UserConstraintsForm: React.FC<UserConstraintsFormProps> = ({
  userProfile,
  onUpdate,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    userProfile?.equipment || []
  );
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, string[]>>(
    userProfile?.availability || {}
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: userProfile?.name || '',
      fatigueLevel: userProfile?.fatigue_log?.[userProfile.fatigue_log.length - 1]?.level || 5,
    },
  });

  const fatigueLevel = watch('fatigueLevel');

  const handleEquipmentChange = (equipment: string) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(e => e !== equipment)
      : [...selectedEquipment, equipment];
    setSelectedEquipment(newEquipment);
  };

  const handleTimeSlotToggle = (day: string, timeSlot: string) => {
    const currentSlots = weeklyAvailability[day] || [];
    const newSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter(slot => slot !== timeSlot)
      : [...currentSlots, timeSlot];
    
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: newSlots,
    }));
  };

  const onSubmit = (data: any) => {
    const formData = {
      ...data,
      equipment: selectedEquipment,
      availability: weeklyAvailability,
    };
    onUpdate(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                  User Constraints & Preferences
                </Typography>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Basic Information
                      </Typography>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Full Name"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Weekly Availability */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Weekly Availability
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select your available time slots for each day of the week
                      </Typography>
                      
                      {daysOfWeek.map((day) => (
                        <Box key={day} sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                            {day}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {timeSlots.map((timeSlot) => (
                              <Chip
                                key={timeSlot}
                                label={timeSlot}
                                onClick={() => handleTimeSlotToggle(day, timeSlot)}
                                color={weeklyAvailability[day]?.includes(timeSlot) ? 'primary' : 'default'}
                                variant={weeklyAvailability[day]?.includes(timeSlot) ? 'filled' : 'outlined'}
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Grid>

                    {/* Equipment Availability */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Equipment Availability
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select all equipment you have access to
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {equipmentOptions.map((equipment) => (
                          <Chip
                            key={equipment}
                            label={equipment}
                            onClick={() => handleEquipmentChange(equipment)}
                            color={selectedEquipment.includes(equipment) ? 'primary' : 'default'}
                            variant={selectedEquipment.includes(equipment) ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                    </Grid>

                    {/* Fatigue Level */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        Current Fatigue Level
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Rate your current energy/fatigue level (1 = very tired, 10 = very energetic)
                      </Typography>
                      
                      <Box sx={{ px: 2 }}>
                        <Controller
                          name="fatigueLevel"
                          control={control}
                          render={({ field }) => (
                            <Slider
                              {...field}
                              min={1}
                              max={10}
                              step={1}
                              marks={[
                                { value: 1, label: '1' },
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                              ]}
                              valueLabelDisplay="auto"
                              sx={{ mb: 2 }}
                            />
                          )}
                        />
                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          Current Level: {fatigueLevel}/10
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          }}
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default UserConstraintsForm;
