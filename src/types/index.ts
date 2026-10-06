export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  buffer_minutes?: number;
  price_inr: number;
  image_url?: string;
  is_premium?: boolean;
  home_service_allowed?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  booking_id?: string;
  service_id?: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  total_price: number;
  advance_amount?: number;
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  visit_type?: 'in_salon' | 'home_service';
  branch?: 'mansarovar' | 'doorstep';
  technician_name?: string;
  payment_method?: 'upi' | 'cash' | 'card';
  notes?: string;
  address?: string;
  service_photo_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WaitlistEntry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  preferred_service: string;
  preferred_date: string;
  preferred_time_slot: string;
  branch: 'mansarovar' | 'doorstep';
  status: 'pending' | 'notified' | 'scheduled';
  notes?: string;
  created_at: string;
  notified_at?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  branch: 'mansarovar' | 'doorstep' | 'all';
  station_number?: string;
  shift_hours: string;
  commission_rate: number;
  active_services: string[];
  is_active: boolean;
  rating?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  upi_id?: string;
  total_spent_inr: number;
  visit_count: number;
  loyalty_points: number;
  preferred_branch?: string;
  preferences_notes?: string;
  last_visit_date?: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  customer_name: string;
  amount_inr: number;
  advance_deposit_inr: number;
  payment_method: 'upi' | 'cash' | 'card';
  payment_status: 'pending' | 'verified' | 'failed';
  upi_ref_no?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface StudioSettings {
  opening_time: string;
  closing_time: string;
  whatsapp_notifications_enabled: boolean;
  whatsapp_reminders_enabled: boolean;
  waitlist_auto_alert_enabled: boolean;
  advance_deposit_required: boolean;
  advance_deposit_amount: number;
  gst_enabled: boolean;
  gst_rate: number;
  gstin?: string;
  home_service_enabled: boolean;
}
