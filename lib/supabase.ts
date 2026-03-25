import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if both values are properly configured
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'tu_supabase_url_aqui' && supabaseAnonKey !== 'tu_supabase_anon_key_aqui'

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
