// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dncdjmxcuxrolxvpoehp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuY2RqbXhjdXhyb2x4dnBvZWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNzQ3ODcsImV4cCI6MjA2MTY1MDc4N30.iTg4k84Y76kem6zYakdYZXf4MQLx_pVeV_Cg2jZhcV8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);