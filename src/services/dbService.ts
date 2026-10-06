import { supabase, Service, Booking, User, Payment } from '@/lib/supabase';

// ==============================================================================
// 1. USERS SERVICE HELPERS
// ==============================================================================
export const usersService = {
  /**
   * Fetch user by internal database ID
   */
  async getUserById(id: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching user by ID:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch user by Supabase Auth UID
   */
  async getUserByAuthId(authUserId: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching user by Auth ID:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch user profile by phone number (used for customer lookup & loyalty)
   */
  async getUserByPhone(phone: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const cleanPhone = phone.trim();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching user by phone:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch user profile by email address
   */
  async getUserByEmail(email: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error fetching user by email:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Create or update user profile
   */
  async upsertUser(userData: {
    id?: string;
    auth_user_id?: string | null;
    role?: 'customer' | 'admin' | 'staff' | 'technician';
    full_name: string;
    phone?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    loyalty_points?: number;
    is_active?: boolean;
  }): Promise<{ data: User | null; error: Error | null }> {
    try {
      const payload: any = {
        full_name: userData.full_name,
        role: userData.role || 'customer',
        loyalty_points: userData.loyalty_points ?? 0,
        is_active: userData.is_active ?? true,
        updated_at: new Date().toISOString(),
      };

      if (userData.id) payload.id = userData.id;
      if (userData.auth_user_id) payload.auth_user_id = userData.auth_user_id;
      if (userData.phone) payload.phone = userData.phone.trim();
      if (userData.email) payload.email = userData.email.trim().toLowerCase();
      if (userData.avatar_url) payload.avatar_url = userData.avatar_url;

      const { data, error } = await supabase
        .from('users')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error upserting user profile:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Fetch all users with optional role filtering
   */
  async getAllUsers(role?: 'customer' | 'admin' | 'staff' | 'technician'): Promise<{ data: User[]; error: Error | null }> {
    try {
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('Error fetching users:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Update loyalty points for a user
   */
  async updateLoyaltyPoints(userId: string, pointsDelta: number): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data: user, error: fetchErr } = await usersService.getUserById(userId);
      if (fetchErr || !user) throw fetchErr || new Error('User not found');

      const newPoints = Math.max(0, (user.loyalty_points || 0) + pointsDelta);
      const { data, error } = await supabase
        .from('users')
        .update({ loyalty_points: newPoints, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating loyalty points:', err);
      return { data: null, error: err };
    }
  },
};

// ==============================================================================
// 2. SERVICES SERVICE HELPERS & SEED DATA
// ==============================================================================

export const INITIAL_SERVICES_DATA: Omit<Service, 'created_at'>[] = [
  {
    id: 'classic-mani',
    name: 'Classic Manicure',
    category: 'basic',
    description: 'Essential nail care with shaping, cuticle treatment, light hand massage, and premium polish.',
    price_inr: 499,
    duration_minutes: 45,
    image_url: 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
  },
  {
    id: 'classic-pedi',
    name: 'Classic Pedicure',
    category: 'basic',
    description: 'Relaxing foot soak, gentle heel exfoliation, soothing foot massage, and precision nail shaping.',
    price_inr: 699,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1629198735700-610c0e49aab2?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
  },
  {
    id: 'gel-mani',
    name: 'Gel Manicure',
    category: 'premium',
    description: 'Long-lasting high-gloss gel polish cured with UV/LED lamp. Chip-free shine lasting up to 3 weeks.',
    price_inr: 899,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'gel-pedi',
    name: 'Gel Pedicure Deluxe',
    category: 'premium',
    description: 'Luxury foot spa treatment with callus removal, scrub, massage, and chip-free gel polish.',
    price_inr: 1099,
    duration_minutes: 75,
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'french-mani',
    name: 'French Manicure & Tips',
    category: 'premium',
    description: 'Timeless French manicure with clean natural pink base and crisp white smile lines.',
    price_inr: 799,
    duration_minutes: 50,
    image_url: 'https://images.unsplash.com/photo-1606789674925-58a94bf6d1e8?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'nail-art-simple',
    name: 'Accent Nail Art (2-4 Nails)',
    category: 'art',
    description: 'Hand-painted accent designs, chrome powder mirror finish, gold foil flakes, or crystal rhinestones.',
    price_inr: 649,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
  },
  {
    id: 'nail-art-complex',
    name: 'Full Set 3D Nail Art & Extensions',
    category: 'art',
    description: 'Full acrylic or polygel nail extensions with intricate 3D sculpted hand art, pearls, and crystals.',
    price_inr: 1599,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: false,
  },
  {
    id: 'mehndi-bridal',
    name: 'Bridal Henna & Mehndi Design',
    category: 'mehndi',
    description: 'Full bridal arms and feet ornate mehndi using 100% organic dark-stain henna cone.',
    price_inr: 3499,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'bridal-package',
    name: 'Complete Bridal Glow Package',
    category: 'bridal',
    description: 'Gel nail extensions, custom bridal nail art, luxury pedicure, hand spa, and glow facial treatment.',
    price_inr: 4999,
    duration_minutes: 240,
    image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'facial-glow',
    name: 'Gold Glow Facial & Clean-up',
    category: 'beauty',
    description: 'Deep pore cleansing, skin rejuvenating fruit peel, gold mask, and relaxing face massage.',
    price_inr: 1299,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
  },
  {
    id: 'russian-manicure',
    name: 'Russian Dry Manicure & Cuticle Realignment',
    category: 'basic',
    description: 'Precision electric-file e-manicure with seamless cuticle alignment, deep clean pocket, and strengthening builder base.',
    price_inr: 799,
    duration_minutes: 55,
    image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'spa-pedicure-jelly',
    name: 'Ice Cream & Jelly Foot Spa Pedicure',
    category: 'spa',
    description: 'Aromatherapeutic crystalline jelly foot soak, volcanic scrub exfoliation, cooling mask wrap, and hot stone reflexology.',
    price_inr: 1199,
    duration_minutes: 75,
    image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'soft-gel-extensions',
    name: 'Soft Gel (Gel-X) Full Cover Extensions',
    category: 'premium',
    description: 'Non-damaging soft gel tips bonded seamlessly to the natural nail for instant flawless length, shape, and 4-week durability.',
    price_inr: 1499,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: false,
  },
  {
    id: 'chrome-glazed-nails',
    name: 'Glazed Donut & Mirror Chrome Polish',
    category: 'art',
    description: 'Ultra-reflective pearl or metallic mirror chrome powder buffed over gel base for the iconic luminous glaze.',
    price_inr: 999,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'bridal-3d-crystals',
    name: 'Royal Bridal 3D Crystal & Pearl Nail Set',
    category: 'bridal',
    description: 'Extravagant bridal nail design with hand-sculpted acrylic florals, Swarovski crystal clusters, and intricate pearl inlays.',
    price_inr: 2199,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'mehndi-arabic',
    name: 'Arabic & Indo-Western Designer Mehndi',
    category: 'mehndi',
    description: 'Modern floral trails, shading, mandala wristbands, and delicate back-hand patterns using pure organic henna cone.',
    price_inr: 1299,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: false,
    home_service_allowed: true,
  },
  {
    id: 'hydra-glow-facial',
    name: 'Hydra Glow Dermabrasion & Deep Infusion',
    category: 'beauty',
    description: 'Hydro-suction pore vacuuming, salicylic exfoliation, hyaluronic serum infusion, and ultrasound skin lifting.',
    price_inr: 1999,
    duration_minutes: 75,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
  {
    id: 'aromatherapy-spa-ritual',
    name: 'Aromatherapy Luxury Hand & Foot Spa Ritual',
    category: 'spa',
    description: 'Complete restorative wellness session with lavender salt bath, organic sugar polish, paraffin hand dip, and deep massage.',
    price_inr: 1699,
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1629198735700-610c0e49aab2?w=800&h=600&fit=crop&q=80',
    is_active: true,
    is_premium: true,
    home_service_allowed: true,
  },
];

/**
 * Seed initial services into Supabase database
 * @param overwrite If true, existing records will be updated; if false, only missing records are inserted
 */
export async function seedServices(overwrite: boolean = false): Promise<{
  success: boolean;
  insertedCount: number;
  error: Error | null;
  message: string;
}> {
  try {
    const servicesToInsert = INITIAL_SERVICES_DATA.map((s) => ({
      ...s,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (!overwrite) {
      // Check existing services first
      const { data: existing, error: checkError } = await supabase
        .from('services')
        .select('id');

      if (checkError) throw checkError;

      const existingIds = new Set((existing || []).map((e: any) => e.id));
      const missingServices = servicesToInsert.filter((s) => !existingIds.has(s.id));

      if (missingServices.length === 0) {
        return {
          success: true,
          insertedCount: 0,
          error: null,
          message: 'Services table is already fully seeded. No new records needed.',
        };
      }

      const { data, error } = await supabase
        .from('services')
        .insert(missingServices)
        .select();

      if (error) throw error;

      return {
        success: true,
        insertedCount: data?.length || missingServices.length,
        error: null,
        message: `Successfully seeded ${data?.length || missingServices.length} initial services.`,
      };
    } else {
      // Upsert all services
      const { data, error } = await supabase
        .from('services')
        .upsert(servicesToInsert, { onConflict: 'id' })
        .select();

      if (error) throw error;

      return {
        success: true,
        insertedCount: data?.length || servicesToInsert.length,
        error: null,
        message: `Successfully seeded/updated ${data?.length || servicesToInsert.length} services.`,
      };
    }
  } catch (err: any) {
    console.error('Error seeding services table:', err);
    return {
      success: false,
      insertedCount: 0,
      error: err,
      message: err.message || 'Failed to seed services table.',
    };
  }
}

export const servicesService = {
  /**
   * Seed the services table with initial data
   */
  seedInitialServices: seedServices,

  /**
   * Fetch all services with category and active filters
   */
  async getAllServices(options?: {
    category?: string;
    activeOnly?: boolean;
  }): Promise<{ data: Service[]; error: Error | null }> {
    try {
      let query = supabase.from('services').select('*').order('name');

      if (options?.activeOnly ?? true) {
        query = query.eq('is_active', true);
      }

      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('Error fetching services:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Fetch a single service by ID
   */
  async getServiceById(id: string): Promise<{ data: Service | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error fetching service ${id}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Create a new service
   */
  async createService(serviceData: Omit<Service, 'created_at'>): Promise<{ data: Service | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating service:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update an existing service
   */
  async updateService(id: string, updates: Partial<Service>): Promise<{ data: Service | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error updating service ${id}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Soft delete or toggle active state of service
   */
  async toggleServiceActive(id: string, isActive: boolean): Promise<{ data: Service | null; error: Error | null }> {
    return servicesService.updateService(id, { is_active: isActive });
  },

  /**
   * Permanently delete a service
   */
  async deleteService(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      console.error(`Error deleting service ${id}:`, err);
      return { success: false, error: err };
    }
  },
};

// ==============================================================================
// 3. BOOKINGS SERVICE HELPERS
// ==============================================================================
export const bookingsService = {
  /**
   * Fetch bookings with multi-criteria filtering
   */
  async getBookings(options?: {
    phone?: string;
    status?: Booking['booking_status'];
    date?: string;
    limit?: number;
  }): Promise<{ data: Booking[]; error: Error | null }> {
    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

      if (options?.phone) {
        query = query.eq('customer_phone', options.phone.trim());
      }

      if (options?.status) {
        query = query.eq('booking_status', options.status);
      }

      if (options?.date) {
        query = query.eq('appointment_date', options.date);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Fetch a single booking by ID or public booking reference
   */
  async getBookingById(identifier: string): Promise<{ data: Booking | null; error: Error | null }> {
    try {
      // Check if identifier matches booking_id or UUID
      const isBookingCode = identifier.startsWith('UMA-') || identifier.includes('-');
      const column = isBookingCode && !identifier.includes('0000') ? 'booking_id' : 'id';

      let { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq(column, identifier)
        .maybeSingle();

      if (!data && column === 'booking_id') {
        const fallback = await supabase.from('bookings').select('*').eq('id', identifier).maybeSingle();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error fetching booking ${identifier}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Create a new booking
   */
  async createBooking(bookingData: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    service_id: string;
    service_name: string;
    category: string;
    visit_type: 'salon' | 'home';
    address?: string;
    distance_km?: number;
    home_service_charge: number;
    appointment_date: string;
    appointment_time: string;
    total_price: number;
    advance_amount: number;
    remaining_amount: number;
    booking_status?: Booking['booking_status'];
    technician_id?: string | null;
    technician_name?: string | null;
    coupon_code?: string | null;
    coupon_discount?: number | null;
  }): Promise<{ data: Booking | null; error: Error | null }> {
    try {
      const generatedBookingId = `UMA-${Date.now().toString().slice(-6)}`;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          booking_id: generatedBookingId,
          booking_status: bookingData.booking_status || 'pending_verification',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating booking:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: Booking['booking_status']
  ): Promise<{ data: Booking | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          booking_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error updating status for booking ${bookingId}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Assign a technician to a booking
   */
  async assignTechnician(
    bookingId: string,
    technicianId: string,
    technicianName: string
  ): Promise<{ data: Booking | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          technician_id: technicianId,
          technician_name: technicianName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error assigning technician for booking ${bookingId}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Get dashboard metrics for bookings
   */
  async getBookingMetrics(): Promise<{
    data: {
      totalBookings: number;
      pendingVerification: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      totalRevenue: number;
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: bookings, error } = await supabase.from('bookings').select('*');
      if (error) throw error;

      const list = bookings || [];
      const metrics = {
        totalBookings: list.length,
        pendingVerification: list.filter((b) => b.booking_status === 'pending_verification').length,
        confirmed: list.filter((b) => b.booking_status === 'confirmed').length,
        completed: list.filter((b) => b.booking_status === 'completed').length,
        cancelled: list.filter((b) => b.booking_status === 'cancelled').length,
        totalRevenue: list
          .filter((b) => b.booking_status !== 'cancelled')
          .reduce((sum, b) => sum + (b.total_price || 0), 0),
      };

      return { data: metrics, error: null };
    } catch (err: any) {
      console.error('Error calculating booking metrics:', err);
      return { data: null, error: err };
    }
  },
};

// ==============================================================================
// 4. PAYMENTS SERVICE HELPERS
// ==============================================================================
export const paymentsService = {
  /**
   * Create payment record for a booking
   */
  async createPayment(paymentData: {
    booking_id: string;
    upi_transaction_id: string;
    payment_screenshot_url: string;
    amount: number;
    payment_status?: Payment['payment_status'];
  }): Promise<{ data: Payment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          payment_status: paymentData.payment_status || 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating payment record:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update payment verification status
   */
  async verifyPayment(
    paymentId: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    rejectionReason?: string
  ): Promise<{ data: Payment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          payment_status: status,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? rejectionReason : null,
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error verifying payment ${paymentId}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(bookingId: string): Promise<{ data: Payment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error fetching payment for booking ${bookingId}:`, err);
      return { data: null, error: err };
    }
  },
};
