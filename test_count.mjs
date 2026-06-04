import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { count, error } = await supabase
    .from('crop_data')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching count:', error);
  } else {
    console.log('Total rows in crop_data:', count);
  }

  const { data: years, error: yearsError } = await supabase
    .from('unique_years')
    .select('*');

  if (yearsError) {
    console.error('Error fetching unique_years:', yearsError);
  } else {
    console.log('Unique years in database:', years.map(y => y.year));
  }
}
test();
