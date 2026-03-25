import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('=== SUPABASE CONFIG CHECK ===')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key starts with:', supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : 'N/A')
console.log('Is configured:', supabaseUrl && supabaseAnonKey && supabaseUrl !== 'tu_supabase_url_aqui' && supabaseAnonKey !== 'tu_supabase_anon_key_aqui')
console.log('==============================')

// Only create client if both values are properly configured
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'tu_supabase_url_aqui' && supabaseAnonKey !== 'tu_supabase_anon_key_aqui'

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
