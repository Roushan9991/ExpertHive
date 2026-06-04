import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Querying raw record counts per year...');
  const { data, error } = await supabase
    .from('crop_data')
    .select('year')
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const counts = {};
  data.forEach(r => {
    counts[r.year] = (counts[r.year] || 0) + 1;
  });
  console.log('Counts per year:', counts);

  console.log('\nQuerying sum of area/production for 2021-22...');
  const { data: sumData, error: sumError } = await supabase
    .from('crop_data')
    .select('year, area, production')
    .eq('year', '2021-22')
    .limit(10);
  console.log('Sample 2021-22 rows:', sumData);
}
test();
