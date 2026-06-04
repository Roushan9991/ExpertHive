import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Calling get_crop_data_summary RPC...');
  const { data, error } = await supabase.rpc('get_crop_data_summary', {
    p_state: 'All India',
    p_district: 'All Districts',
    p_crops: ['Rice', 'Wheat', 'Maize', 'Barley', 'Jowar'],
    p_seasons: ['Kharif', 'Rabi', 'Summer', 'Total']
  });

  if (error) {
    console.error('❌ RPC Error:', error);
  } else {
    console.log('✅ RPC Success! Data returned:', JSON.stringify(data, null, 2));
  }
}
test();
