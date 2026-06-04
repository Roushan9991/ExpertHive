import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statesList as staticStatesList, districtsMap as staticDistrictsMap } from '../data/cropData';
import { supabase } from '../lib/supabase';
import { 
  Download, 
  Filter, 
  X, 
  ChevronRight, 
  Wheat, 
  AlertCircle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const DataInsights = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Supabase states
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Dynamic lists from DB (with initial defaults)
  const [statesList, setStatesList] = useState(['All India']);
  const [districtsMap, setDistrictsMap] = useState({ 'All India': ['All Districts'] });
  const [allYears, setAllYears] = useState(['2021-22', '2022-23', '2023-24', '2024-25', '2025-26']);
  const [allCrops, setAllCrops] = useState(['Rice', 'Wheat', 'Maize', 'Barley', 'Jowar']);
  const [allSeasons, setAllSeasons] = useState(['Kharif', 'Rabi', 'Summer', 'Total']);
  const allMetrics = ['Area', 'Production', 'Yield'];

  // Filters State
  const [tempState, setTempState] = useState('All India');
  const [tempDistrict, setTempDistrict] = useState('All Districts');
  const [tempFromYear, setTempFromYear] = useState('2021-22');
  const [tempToYear, setTempToYear] = useState('2025-26');
  const [tempCrops, setTempCrops] = useState(['Rice', 'Wheat', 'Maize', 'Barley', 'Jowar']);
  const [tempSeasons, setTempSeasons] = useState(['Kharif', 'Rabi', 'Summer', 'Total']);
  const [tempMetrics, setTempMetrics] = useState(['Area', 'Production', 'Yield']);

  const [appliedState, setAppliedState] = useState('All India');
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts');
  const [appliedFromYear, setAppliedFromYear] = useState('2021-22');
  const [appliedToYear, setAppliedToYear] = useState('2025-26');
  const [appliedCrops, setAppliedCrops] = useState(['Rice', 'Wheat', 'Maize', 'Barley', 'Jowar']);
  const [appliedSeasons, setAppliedSeasons] = useState(['Kharif', 'Rabi', 'Summer', 'Total']);
  const [appliedMetrics, setAppliedMetrics] = useState(['Area', 'Production', 'Yield']);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch unique states and districts
        const { data: sdData, error: sdError } = await supabase
          .from('unique_states_districts')
          .select('*');

        if (sdError) throw sdError;

        if (sdData && sdData.length > 0) {
          const uniqueStates = new Set(['All India']);
          const map = { 'All India': ['All Districts'] };
          
          sdData.forEach(row => {
            if (row.state) {
              uniqueStates.add(row.state);
              if (!map[row.state]) {
                map[row.state] = ['All Districts'];
              }
              if (row.district && row.district !== 'All Districts') {
                map[row.state].push(row.district);
              }
            }
          });
          
          setStatesList(Array.from(uniqueStates));
          setDistrictsMap(map);
        }
      } catch (err) {
        console.warn('Failed to load dynamic states/districts, using fallback static data:', err);
        setStatesList(staticStatesList);
        setDistrictsMap(staticDistrictsMap);
      }

      try {
        // Fetch unique crops, seasons, and years
        const [cropsRes, seasonsRes, yearsRes] = await Promise.all([
          supabase.from('unique_crops').select('crop'),
          supabase.from('unique_seasons').select('season'),
          supabase.from('unique_years').select('year')
        ]);

        if (cropsRes.data && cropsRes.data.length > 0) {
          const cropsList = cropsRes.data.map(r => r.crop);
          setAllCrops(cropsList);
          setTempCrops(cropsList);
          setAppliedCrops(cropsList);
        }
        if (seasonsRes.data && seasonsRes.data.length > 0) {
          const seasonsList = seasonsRes.data.map(r => r.season);
          setAllSeasons(seasonsList);
          setTempSeasons(seasonsList);
          setAppliedSeasons(seasonsList);
        }
        if (yearsRes.data && yearsRes.data.length > 0) {
          const yearsList = yearsRes.data.map(r => r.year).sort();
          setAllYears(yearsList);
          setTempFromYear(yearsList[0]);
          setTempToYear(yearsList[yearsList.length - 1]);
          setAppliedFromYear(yearsList[0]);
          setAppliedToYear(yearsList[yearsList.length - 1]);
        }
      } catch (err) {
        console.warn('Failed to load dynamic crops/seasons/years, using fallback static data:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch aggregated data from Supabase
  useEffect(() => {
    const fetchCropData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const { data, error } = await supabase.rpc('get_crop_data_summary', {
          p_state: appliedState,
          p_district: appliedDistrict,
          p_crops: appliedCrops,
          p_seasons: appliedSeasons,
          p_from_year: appliedFromYear,
          p_to_year: appliedToYear
        });

        if (error) throw error;

        if (data) {
          const grouped = {};
          data.forEach(row => {
            const key = `${row.state}|${row.district}|${row.crop}|${row.season}`;
            if (!grouped[key]) {
              grouped[key] = {
                state: row.state,
                district: row.district,
                crop: row.crop,
                season: row.season,
                area: {},
                production: {},
                yield: {}
              };
            }
            
            grouped[key].area[row.year] = row.total_area !== null ? parseFloat(row.total_area.toFixed(2)) : 0;
            grouped[key].production[row.year] = row.total_production !== null ? parseFloat(row.total_production.toFixed(2)) : 0;
            grouped[key].yield[row.year] = row.avg_yield !== null ? Math.round(row.avg_yield) : 0;
          });

          setCropData(Object.values(grouped));
        } else {
          setCropData([]);
        }
      } catch (err) {
        console.error('Error fetching crop data:', err);
        setFetchError('Unable to fetch data, please try after sometime');
        toast.error('Unable to fetch data, please try after sometime');
      } finally {
        setLoading(false);
      }
    };

    fetchCropData();
  }, [appliedState, appliedDistrict, appliedCrops, appliedSeasons, appliedFromYear, appliedToYear]);

  const handleStateChange = (state) => {
    setTempState(state);
    setTempDistrict('All Districts');
  };

  const handleFromYearChange = (year) => {
    const fromIdx = allYears.indexOf(year);
    const toIdx = allYears.indexOf(tempToYear);
    if (fromIdx > toIdx) {
      setTempToYear(year);
    }
    setTempFromYear(year);
  };

  const handleToYearChange = (year) => {
    const fromIdx = allYears.indexOf(tempFromYear);
    const toIdx = allYears.indexOf(year);
    if (toIdx < fromIdx) {
      setTempFromYear(year);
    }
    setTempToYear(year);
  };

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter(x => x !== item));
      } else {
        toast.error('Select at least one option.');
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleApplyFilters = () => {
    setAppliedState(tempState);
    setAppliedDistrict(tempDistrict);
    setAppliedFromYear(tempFromYear);
    setAppliedToYear(tempToYear);
    setAppliedCrops(tempCrops);
    setAppliedSeasons(tempSeasons);
    setAppliedMetrics(tempMetrics);
    setSidebarOpen(false);
    toast.success('Filters applied successfully!');
  };

  const handleResetFilters = () => {
    setTempState('All India');
    setTempDistrict('All Districts');
    
    const defaultFromYear = allYears[0] || '2021-22';
    const defaultToYear = allYears[allYears.length - 1] || '2025-26';
    setTempFromYear(defaultFromYear);
    setTempToYear(defaultToYear);
    setTempCrops(allCrops);
    setTempSeasons(allSeasons);
    setTempMetrics(allMetrics);

    setAppliedState('All India');
    setAppliedDistrict('All Districts');
    setAppliedFromYear(defaultFromYear);
    setAppliedToYear(defaultToYear);
    setAppliedCrops(allCrops);
    setAppliedSeasons(allSeasons);
    setAppliedMetrics(allMetrics);
    
    toast.success('Filters reset to default.');
  };

  // Active Year Selection
  const fromIdx = allYears.indexOf(appliedFromYear);
  const toIdx = allYears.indexOf(appliedToYear);
  const activeYears = allYears.slice(fromIdx, toIdx + 1);

  // Filter Data
  const filteredData = cropData;

  // Export CSV/Excel Helper
  const triggerDownload = (type) => {
    if (!user) {
      toast.error(`Mandatory: Sign in or register to download crop data ${type === 'excel' ? 'Excel' : 'CSV'} files!`);
      // Redirect to login with current page state so they return back here
      navigate('/login', { state: { from: '/data-insights' } });
      return;
    }

    // Compile CSV Content
    let csvContent = '';
    // Header rows
    csvContent += 'State,District,Crop,Season';
    
    // Add columns for selected metrics and years
    appliedMetrics.forEach(metric => {
      activeYears.forEach(year => {
        csvContent += `,${metric} (${year})`;
      });
    });
    csvContent += '\n';

    // Data rows
    filteredData.forEach(row => {
      let rowStr = `"${row.state}","${row.district}","${row.crop}","${row.season}"`;
      appliedMetrics.forEach(metric => {
        const metricKey = metric.toLowerCase();
        activeYears.forEach(year => {
          const val = row[metricKey][year] !== undefined ? row[metricKey][year] : '-';
          rowStr += `,${val}`;
        });
      });
      csvContent += rowStr + '\n';
    });

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crop_data_insights_${Date.now()}.${type === 'excel' ? 'xls' : 'csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded statistics successfully!`);
  };

  return (
    <main className="flex-grow bg-slate-50 overflow-x-hidden pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Headline Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-700">
              <Wheat className="h-3.5 w-3.5 text-emerald-600" />
              <span>Free Time Series Repository</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {appliedState === 'All India' ? 'All India' : appliedState}{appliedDistrict !== 'All Districts' ? ` (${appliedDistrict})` : ''}: Crop-wise Area, Production & Yield
            </h1>
            <p className="text-slate-500 text-sm">
              Area in Lakh Ha, Production in Lakh Tonnes & Yield in Kg/Ha | Source: Department of Agriculture & Farmers Welfare (DA&FW)
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <button 
              onClick={() => triggerDownload('excel')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors px-4 py-3 rounded-2xl shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              EXCEL
            </button>
            <button 
              onClick={() => triggerDownload('csv')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors px-4 py-3 rounded-2xl shadow-sm cursor-pointer"
            >
              <FileDown className="h-4 w-4 text-emerald-600" />
              CSV
            </button>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all duration-200 px-5 py-3 rounded-2xl shadow-md shadow-emerald-700/10 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              FILTERS
            </button>
          </div>
        </div>

        {/* Main Data Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75">
                  <th rowSpan="2" className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 min-w-[120px]">State</th>
                  <th rowSpan="2" className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 min-w-[120px]">District</th>
                  <th rowSpan="2" className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 min-w-[120px]">Crop</th>
                  <th rowSpan="2" className="p-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 min-w-[100px]">Season</th>
                  
                  {/* Metric Headers */}
                  {appliedMetrics.includes('Area') && (
                    <th colSpan={activeYears.length} className="p-3 text-center text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-500/5 border-r border-slate-100">
                      Area (Lakh Ha)
                    </th>
                  )}
                  {appliedMetrics.includes('Production') && (
                    <th colSpan={activeYears.length} className="p-3 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-500/5 border-r border-slate-100">
                      Production (Lakh Tonnes)
                    </th>
                  )}
                  {appliedMetrics.includes('Yield') && (
                    <th colSpan={activeYears.length} className="p-3 text-center text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-500/5">
                      Yield (Kg/Ha)
                    </th>
                  )}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {/* Area Years */}
                  {appliedMetrics.includes('Area') && activeYears.map(year => (
                    <th key={`area-${year}`} className="p-2 text-center text-[11px] font-semibold text-slate-500 bg-amber-500/5 border-r border-slate-100 last:border-r-emerald-100">{year}</th>
                  ))}
                  {/* Production Years */}
                  {appliedMetrics.includes('Production') && activeYears.map(year => (
                    <th key={`prod-${year}`} className="p-2 text-center text-[11px] font-semibold text-slate-500 bg-emerald-500/5 border-r border-slate-100 last:border-r-indigo-100">{year}</th>
                  ))}
                  {/* Yield Years */}
                  {appliedMetrics.includes('Yield') && activeYears.map((year, idx) => (
                    <th key={`yield-${year}`} className={`p-2 text-center text-[11px] font-semibold text-slate-500 bg-indigo-500/5 ${idx < activeYears.length - 1 ? 'border-r border-slate-100' : ''}`}>{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4 + (appliedMetrics.length * activeYears.length)} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3 justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <p className="font-semibold text-sm text-slate-500">Fetching live statistics from database...</p>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={4 + (appliedMetrics.length * activeYears.length)} className="p-12 text-center text-red-500 bg-red-50/50">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <p className="font-bold text-sm">{fetchError}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={`${row.state}-${row.district}-${row.crop}-${row.season}-${index}`} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors last:border-b-0">
                      <td className="p-4 text-sm font-semibold text-slate-700 border-r border-slate-100">{row.state}</td>
                      <td className="p-4 text-sm text-slate-600 border-r border-slate-100 font-medium">{row.district}</td>
                      <td className="p-4 text-sm font-bold text-slate-900 border-r border-slate-100">{row.crop}</td>
                      <td className="p-4 text-sm text-slate-600 border-r border-slate-100 font-medium">{row.season}</td>
                      
                      {/* Area values */}
                      {appliedMetrics.includes('Area') && activeYears.map(year => (
                        <td key={`area-val-${year}`} className="p-3 text-center text-sm text-slate-700 bg-amber-500/[0.01] border-r border-slate-100">
                          {row.area[year] !== undefined ? row.area[year].toLocaleString() : '-'}
                        </td>
                      ))}

                      {/* Production values */}
                      {appliedMetrics.includes('Production') && activeYears.map(year => (
                        <td key={`prod-val-${year}`} className="p-3 text-center text-sm text-slate-700 bg-emerald-500/[0.01] border-r border-slate-100">
                          {row.production[year] !== undefined ? row.production[year].toLocaleString() : '-'}
                        </td>
                      ))}

                      {/* Yield values */}
                      {appliedMetrics.includes('Yield') && activeYears.map((year, idx) => (
                        <td key={`yield-val-${year}`} className={`p-3 text-center text-sm text-slate-700 bg-indigo-500/[0.01] ${idx < activeYears.length - 1 ? 'border-r border-slate-100' : ''}`}>
                          {row.yield[year] !== undefined ? row.yield[year].toLocaleString() : '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4 + (appliedMetrics.length * activeYears.length)} className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <AlertCircle className="h-8 w-8 text-slate-300" />
                        <p className="font-semibold text-sm">No statistics match the applied filter query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Banner */}
        <div className="rounded-3xl bg-emerald-950 text-white p-6 border border-emerald-800/20 shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c382a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-bold text-sm sm:text-base">Viewing is completely free for everyone</p>
              <p className="text-xs text-slate-300">Authentication is only required when exporting files (Excel/CSV).</p>
            </div>
          </div>
          {!user && (
            <button 
              onClick={() => navigate('/login', { state: { from: '/data-insights' } })}
              className="relative z-10 text-xs font-bold text-[#012d1d] bg-white hover:bg-slate-100 px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Sign In to unlock downloads
            </button>
          )}
        </div>

      </div>

      {/* Slide-out Filters Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200/50"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  Table Filters
                </span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-grow p-6 space-y-8 overflow-y-auto">
                {/* State Selection */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">State</h3>
                  <select 
                    value={tempState} 
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:border-slate-300 outline-none cursor-pointer"
                  >
                    {statesList.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* District Selection */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">District</h3>
                  <select 
                    value={tempDistrict} 
                    onChange={(e) => setTempDistrict(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:border-slate-300 outline-none cursor-pointer"
                  >
                    {(districtsMap[tempState] || ['All Districts']).map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>

                {/* Year Range Selection */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Year Range</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                      <select 
                        value={tempFromYear} 
                        onChange={(e) => handleFromYearChange(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white outline-none cursor-pointer"
                      >
                        {allYears.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                      <select 
                        value={tempToYear} 
                        onChange={(e) => handleToYearChange(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white outline-none cursor-pointer"
                      >
                        {allYears.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Metrics</h3>
                  <div className="flex flex-wrap gap-2">
                    {allMetrics.map(metric => {
                      const active = tempMetrics.includes(metric);
                      return (
                        <button
                          key={metric}
                          onClick={() => toggleFilter(tempMetrics, setTempMetrics, metric)}
                          className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${active ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                          {metric} {active && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Crops */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Crops</h3>
                  <div className="flex flex-col gap-2">
                    {allCrops.map(crop => {
                      const active = tempCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          onClick={() => toggleFilter(tempCrops, setTempCrops, crop)}
                          className={`flex items-center justify-between text-left text-xs font-bold p-3 rounded-xl border transition-all cursor-pointer ${active ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                          <span>{crop}</span>
                          {active && <span className="text-emerald-600 text-[10px] font-bold">SELECTED</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seasons */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Seasons</h3>
                  <div className="flex flex-col gap-2">
                    {allSeasons.map(season => {
                      const active = tempSeasons.includes(season);
                      return (
                        <button
                          key={season}
                          onClick={() => toggleFilter(tempSeasons, setTempSeasons, season)}
                          className={`flex items-center justify-between text-left text-xs font-bold p-3 rounded-xl border transition-all cursor-pointer ${active ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                          <span>{season}</span>
                          {active && <span className="text-emerald-600 text-[10px] font-bold">SELECTED</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply / Reset Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 font-bold text-center text-slate-500 hover:text-slate-700 bg-white border border-slate-200 py-3.5 rounded-2xl text-xs tracking-wide cursor-pointer"
                >
                  RESET
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 font-bold text-center text-white bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-2xl text-xs tracking-wide shadow-md shadow-emerald-700/10 cursor-pointer"
                >
                  APPLY
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};
