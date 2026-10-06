import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

const MAX_RETRIES = 3;

/**
 * Utility to wait for a specified amount of time (ms)
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Centralized wrapper for Supabase queries with retry logic and error logging.
 * 
 * @param queryFn - A function that returns the Supabase query promise
 * @param retries - Number of retry attempts (default 3)
 */
export async function safeQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: PostgrestError | null }>,
  retries = MAX_RETRIES
): Promise<T> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const { data, error } = await queryFn();

      if (error) {
        throw error;
      }

      // Return data if successful
      return data as T;
      
    } catch (err: any) {
      attempt++;
      
      console.error(`Database query attempt ${attempt} failed:`, err);

      if (attempt >= retries) {
        // Final attempt failed, re-throw for the component to handle
        throw err;
      }

      // Exponential backoff before retrying
      await wait(attempt * 500);
    }
  }

  throw new Error('Unexpected database error');
}

/**
 * Example Usage:
 * 
 * const data = await safeQuery(() => 
 *   supabase.from('promotions').select('*').eq('website_id', tenantId)
 * );
 */
