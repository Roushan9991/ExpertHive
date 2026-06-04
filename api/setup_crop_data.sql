-- 1. Create View for Unique States and Districts
CREATE OR REPLACE VIEW unique_states_districts AS
SELECT DISTINCT state, district 
FROM crop_data 
ORDER BY state, district;

-- 2. Create View for Unique Crops
CREATE OR REPLACE VIEW unique_crops AS
SELECT DISTINCT crop 
FROM crop_data 
ORDER BY crop;

-- 3. Create View for Unique Seasons
CREATE OR REPLACE VIEW unique_seasons AS
SELECT DISTINCT season 
FROM crop_data 
ORDER BY season;

-- 4. Create View for Unique Years
CREATE OR REPLACE VIEW unique_years AS
SELECT DISTINCT year 
FROM crop_data 
ORDER BY year;

-- 5. Create RPC function for dynamic aggregation
CREATE OR REPLACE FUNCTION get_crop_data_summary(
  p_state VARCHAR,
  p_district VARCHAR,
  p_crops VARCHAR[],
  p_seasons VARCHAR[],
  p_from_year VARCHAR,
  p_to_year VARCHAR
)
RETURNS TABLE (
  state VARCHAR,
  district VARCHAR,
  crop VARCHAR,
  season VARCHAR,
  year VARCHAR,
  total_area DOUBLE PRECISION,
  total_production DOUBLE PRECISION,
  avg_yield DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN p_state = 'All India' THEN 'All India' ELSE CD.state END as state,
    CASE WHEN p_district = 'All Districts' THEN 'All Districts' ELSE CD.district END as district,
    CD.crop,
    CD.season,
    CD.year,
    SUM(CD.area) as total_area,
    SUM(CD.production) as total_production,
    AVG(CD.yield) as avg_yield
  FROM 
    crop_data CD
  WHERE 
    (p_state = 'All India' OR CD.state = p_state)
    AND (p_district = 'All Districts' OR CD.district = p_district)
    AND CD.crop = ANY(p_crops)
    AND CD.season = ANY(p_seasons)
    AND CD.year >= p_from_year
    AND CD.year <= p_to_year
  GROUP BY 
    CASE WHEN p_state = 'All India' THEN 'All India' ELSE CD.state END,
    CASE WHEN p_district = 'All Districts' THEN 'All Districts' ELSE CD.district END,
    CD.crop,
    CD.season,
    CD.year;
END;
$$ LANGUAGE plpgsql;
