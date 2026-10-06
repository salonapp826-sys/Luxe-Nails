import { TimeSlot } from '@/types';

export const generateTimeSlots = (date: string): TimeSlot[] => {
  // Mock time slots - in a real app, this would check actual availability
  const slots: TimeSlot[] = [];
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  
  hours.forEach(time => {
    // Randomly make some slots unavailable for demo purposes
    const available = Math.random() > 0.3;
    slots.push({ time, available });
  });
  
  return slots;
};
