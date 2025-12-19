import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Upload, AlertTriangle, TrendingUp, TrendingDown, 
  PieChart, Activity, Search, Filter, X, FileSpreadsheet, 
  RefreshCw, ArrowUp, Sun, Moon, Printer,
  Download, Briefcase, Shield, Gauge, BarChart3,
  Wand2, Trash2, ArrowRightLeft, Target, Layers, Wallet,
  Trophy, AlertCircle
} from 'lucide-react';
import { 
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, 
  Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, ComposedChart, Line
} from 'recharts';

/**
 * Portfolio Analyzer Pro (Modern UI Edition)
 * Features:
 * - Premium Fintech UI Design
 * - "Portfolio Detox" Simulator
 * - Consolidation Engine
 * - Smart Benchmarking
 * - AMC Analysis & Dark Mode
 * - PDF Export Support
 */

// --- UI Components ---

const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden ${className}`}>
    <div className={noPadding ? "" : "p-6"}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, type = "neutral", className = "" }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    neutral: "bg-slate-50 text-slate-600 border border-slate-100",
    blue: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    purple: "bg-violet-50 text-violet-700 border border-violet-100"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[type] || styles.neutral} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-700",
    ghost: "text-slate-500 hover:bg-slate-100",
    outline: "border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// --- Utilities ---

const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatNumber = (val, decimals = 2) => {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(val);
};

const downloadCSV = (data, filename) => {
  if (!data || !data.length) return;
  try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            let val = row[fieldName];
            if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
            return val;
        }).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } catch (e) {
      console.error("Download failed", e);
  }
};

// --- Constants ---

const BENCHMARKS = {
  'Large Cap': { name: 'Nifty 50', return: 13.5 },
  'Mid Cap': { name: 'Nifty Midcap 150', return: 16.5 },
  'Small Cap': { name: 'Nifty Smallcap 250', return: 19.0 },
  'Flexi Cap': { name: 'Nifty 500', return: 15.0 },
  'ELSS': { name: 'Nifty 500', return: 15.0 },
  'Debt': { name: 'FD / Debt Index', return: 7.0 },
  'Liquid': { name: 'Liquid Index', return: 6.0 },
  'Sectoral': { name: 'Nifty 500', return: 15.0 },
  'Other': { name: 'Inflation', return: 6.0 }
};

const SAMPLE_DATA = [
    { 'Scheme Name': 'HDFC Top 100 Fund', 'Category': 'Equity', 'Sub-category': 'Large Cap', 'AMC': 'HDFC Mutual Fund', 'Units': 500, 'Invested Value': 50000, 'Current Value': 75000, 'Returns': 25000, 'XIRR': 15.5 },
    { 'Scheme Name': 'SBI Small Cap Fund', 'Category': 'Equity', 'Sub-category': 'Small Cap', 'AMC': 'SBI Mutual Fund', 'Units': 200, 'Invested Value': 40000, 'Current Value': 65000, 'Returns': 25000, 'XIRR': 22.1 },
    { 'Scheme Name': 'Axis Midcap Fund', 'Category': 'Equity', 'Sub-category': 'Mid Cap', 'AMC': 'Axis Mutual Fund', 'Units': 300, 'Invested Value': 45000, 'Current Value': 55000, 'Returns': 10000, 'XIRR': 14.2 },
    { 'Scheme Name': 'Parag Parikh Flexi Cap', 'Category': 'Equity', 'Sub-category': 'Flexi Cap', 'AMC': 'PPFAS Mutual Fund', 'Units': 400, 'Invested Value': 80000, 'Current Value': 110000, 'Returns': 30000, 'XIRR': 18.5 },
    { 'Scheme Name': 'HDFC Balanced Advantage', 'Category': 'Hybrid', 'Sub-category': 'Dynamic Asset Allocation', 'AMC': 'HDFC Mutual Fund', 'Units': 100, 'Invested Value': 10000, 'Current Value': 12000, 'Returns': 2000, 'XIRR': 9.5 },
    { 'Scheme Name': 'Nippon India Small Cap', 'Category': 'Equity', 'Sub-category': 'Small Cap', 'AMC': 'Nippon India Mutual Fund', 'Units': 50, 'Invested Value': 4000, 'Current Value': 4500, 'Returns': 500, 'XIRR': 12.0 }, // Clutter example
    { 'Scheme Name': 'UTI Nifty 50 Index', 'Category': 'Equity', 'Sub-category': 'Large Cap', 'AMC': 'UTI Mutual Fund', 'Units': 100, 'Invested Value': 15000, 'Current Value': 14000, 'Returns': -1000, 'XIRR': -5.0 }, // Loss example
    { 'Scheme Name': 'ICICI Prudential Bluechip', 'Category': 'Equity', 'Sub-category': 'Large Cap', 'AMC': 'ICICI Prudential', 'Units': 150, 'Invested Value': 30000, 'Current Value': 38000, 'Returns': 8000, 'XIRR': 13.0 },
    { 'Scheme Name': 'SBI Bluechip Fund', 'Category': 'Equity', 'Sub-category': 'Large Cap', 'AMC': 'SBI Mutual Fund', 'Units': 120, 'Invested Value': 25000, 'Current Value': 29000, 'Returns': 4000, 'XIRR': 11.0 } // Consolidation candidate with HDFC/ICICI/UTI
];

// --- Parsing Logic ---

const processRawRows = (rows) => {
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    try {
        const rowStr = JSON.stringify(rows[i]).toLowerCase();
        if (rowStr.includes('scheme name') && rowStr.includes('current value')) {
          headerIndex = i;
          break;
        }
    } catch(e) { continue; }
  }

  if (headerIndex === -1) return [];

  const rawHeaders = rows[headerIndex];
  const headers = (Array.isArray(rawHeaders) ? rawHeaders : Object.values(rawHeaders))
    .map(h => String(h).trim().replace(/^"|"$/g, ''));

  const data = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || (Array.isArray(row) && row.length < 2)) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
        let val;
        if (Array.isArray(row)) val = row[index];
        else val = row[index];

        if (typeof val === 'string') val = val.trim().replace(/^"|"$/g, '');

        if (['Invested Value', 'Current Value', 'Returns', 'Units'].includes(header)) {
             if (val !== undefined && val !== null && val !== '') {
                 if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                 else val = parseFloat(val);
             } else val = 0;
        }
        if (header === 'XIRR') {
             if (val !== undefined && val !== null && val !== '') {
                 if (typeof val === 'string') {
                     val = parseFloat(val.replace(/%/g, '').replace(/,/g, ''));
                 } else {
                     val = parseFloat(val);
                 }
             } else val = 0;
        }

        rowObj[header] = val;
    });

    if (rowObj['Scheme Name']) data.push(rowObj);
  }
  return data;
};

const parseCSVText = (text) => {
    const lines = text.split('\n');
    const rows = [];
    for (let line of lines) {
        const row = [];
        let inQuotes = false;
        let currentValue = '';
        for (let char of line) {
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === ',' && !inQuotes) { row.push(currentValue); currentValue = ''; }
            else { currentValue += char; }
        }
        row.push(currentValue);
        rows.push(row);
    }
    return processRawRows(rows);
};

// --- Main Component ---

export default function PortfolioAnalyzer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [excelReady, setExcelReady] = useState(false);
  const [simulateCleanup, setSimulateCleanup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const scriptLoaded = useRef(false);

  // Dark Mode Toggle Logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (window.XLSX) {
        setExcelReady(true);
        scriptLoaded.current = true;
        return;
    }
    if (scriptLoaded.current) return;
    if (document.querySelector('script[src*="xlsx.full.min.js"]')) {
        scriptLoaded.current = true;
        const interval = setInterval(() => { if (window.XLSX) { setExcelReady(true); clearInterval(interval); } }, 500);
        return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    script.onload = () => setExcelReady(true);
    document.body.appendChild(script);
    scriptLoaded.current = true;
  }, []);

  const loadSampleData = () => {
      setLoading(true);
      setTimeout(() => {
          setData(SAMPLE_DATA);
          setLoading(false);
      }, 800);
  };

  const handlePrint = () => {
      window.print();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
        if (!window.XLSX) {
            setError("Excel engine is not ready. Please use a CSV file or refresh.");
            setLoading(false);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const jsonSheet = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
                const parsedData = processRawRows(jsonSheet);
                if (parsedData.length === 0) setError("No valid data found.");
                else setData(parsedData);
            } catch (err) { setError("Error reading Excel file."); }
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsedData = parseCSVText(e.target.result);
                if (parsedData.length === 0) setError("No data found.");
                else setData(parsedData);
            } catch (err) { setError("CSV parse failed."); }
            setLoading(false);
        };
        reader.readAsText(file);
    }
  };

  // --- Analytics Engine ---
  const analysis = useMemo(() => {
    if (!data) return null;

    let processedData = data.map(item => {
        const units = item['Units'] || 0;
        const currVal = item['Current Value'] || 0;
        const invVal = item['Invested Value'] || 0;
        
        return {
            ...item,
            _currentNAV: units > 0 ? currVal / units : 0,
            _avgBuyNAV: units > 0 ? invVal / units : 0,
            _absReturn: invVal > 0 ? ((currVal - invVal) / invVal) * 100 : 0
        };
    });

    const originalCount = processedData.length;
    const originalTotalVal = processedData.reduce((acc, c) => acc + c['Current Value'], 0);
    const clutterItems = processedData.filter(i => i['Current Value'] < 5000);
    const clutterVal = clutterItems.reduce((acc, c) => acc + c['Current Value'], 0);

    if (simulateCleanup) {
        processedData = processedData.filter(i => i['Current Value'] >= 5000);
    }

    const totalInv = processedData.reduce((acc, curr) => acc + (curr['Invested Value'] || 0), 0);
    const totalCurr = processedData.reduce((acc, curr) => acc + (curr['Current Value'] || 0), 0);
    const totalReturns = totalCurr - totalInv;
    const absReturn = totalInv > 0 ? (totalReturns / totalInv) * 100 : 0;

    const byCategory = {};
    const subCategoryCounts = {};
    const byAMC = {};
    const lossMakers = [];
    const clutter = [];
    const categoryXIRR = {}; 

    const smartGroups = {};

    processedData.forEach(item => {
      const cat = item['Category'] || 'Other';
      const subCat = item['Sub-category'] || 'Other';
      const amc = item['AMC'] || 'Other';
      const schemeName = item['Scheme Name'];
      const xirr = item['XIRR'] || 0;
      const currVal = item['Current Value'];

      byCategory[cat] = (byCategory[cat] || 0) + currVal;
      byAMC[amc] = (byAMC[amc] || 0) + currVal;
      subCategoryCounts[subCat] = (subCategoryCounts[subCat] || 0) + 1;

      if (!categoryXIRR[subCat]) categoryXIRR[subCat] = { sumProduct: 0, sumWeight: 0 };
      if (xirr && !isNaN(xirr) && xirr !== 0) {
          categoryXIRR[subCat].sumProduct += (xirr * currVal);
          categoryXIRR[subCat].sumWeight += currVal;
      }

      if (item['Returns'] < 0) lossMakers.push(item);
      if (currVal < 5000) clutter.push(item);

      if (!smartGroups[cat]) smartGroups[cat] = {};
      if (!smartGroups[cat][subCat]) smartGroups[cat][subCat] = { totalVal: 0, totalInv: 0, funds: {} };

      const group = smartGroups[cat][subCat];
      group.totalVal += item['Current Value'];
      group.totalInv += item['Invested Value'];

      if (!group.funds[schemeName]) {
          group.funds[schemeName] = { ...item, count: 1 };
      } else {
          const existing = group.funds[schemeName];
          existing['Invested Value'] += item['Invested Value'];
          existing['Current Value'] += item['Current Value'];
          existing['Returns'] += item['Returns'];
          existing['Units'] += item['Units'];
          existing.count += 1;
          existing._absReturn = existing['Invested Value'] > 0 
            ? ((existing['Current Value'] - existing['Invested Value']) / existing['Invested Value']) * 100 
            : 0;
      }
    });

    const comparisonData = [];
    Object.keys(categoryXIRR).forEach(subCat => {
        const { sumProduct, sumWeight } = categoryXIRR[subCat];
        if (sumWeight > 0) {
            const myXIRR = sumProduct / sumWeight;
            let benchKey = 'Other';
            if (BENCHMARKS[subCat]) benchKey = subCat;
            else if (subCat.includes('Large')) benchKey = 'Large Cap';
            else if (subCat.includes('Small')) benchKey = 'Small Cap';
            else if (subCat.includes('Mid')) benchKey = 'Mid Cap';
            else if (subCat.includes('Flexi')) benchKey = 'Flexi Cap';
            else if (subCat.includes('Debt')) benchKey = 'Debt';

            const bench = BENCHMARKS[benchKey];

            comparisonData.push({
                category: subCat,
                myXIRR: parseFloat(myXIRR.toFixed(2)),
                benchXIRR: bench.return,
                benchName: bench.name,
                alpha: parseFloat((myXIRR - bench.return).toFixed(2)),
                weight: sumWeight
            });
        }
    });
    comparisonData.sort((a,b) => b.weight - a.weight);

    const categoryTree = Object.keys(smartGroups).map(catKey => {
        const subCats = Object.keys(smartGroups[catKey]).map(subKey => {
            const group = smartGroups[catKey][subKey];
            const fundList = Object.values(group.funds).sort((a,b) => b['Current Value'] - a['Current Value']);
            return {
                name: subKey,
                totalVal: group.totalVal,
                totalInv: group.totalInv,
                funds: fundList,
                fundCount: fundList.length
            };
        }).sort((a,b) => b.totalVal - a.totalVal);
        return { name: catKey, totalVal: subCats.reduce((acc, s) => acc + s.totalVal, 0), subCategories: subCats };
    }).sort((a,b) => b.totalVal - a.totalVal);

    const consolidationPlan = [];
    categoryTree.forEach(cat => {
        cat.subCategories.forEach(sub => {
            if (sub.fundCount > 2) {
                const sortedFunds = [...sub.funds].sort((a,b) => (b.XIRR || b._absReturn) - (a.XIRR || a._absReturn));
                const winner = sortedFunds[0];
                const others = sortedFunds.slice(1);
                consolidationPlan.push({
                    category: sub.name,
                    winner: winner,
                    others: others,
                    potentialMoveValue: others.reduce((acc, c) => acc + c['Current Value'], 0)
                });
            }
        });
    });

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const amcData = Object.entries(byAMC).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 7); // Top 7 AMCs

    let score = 100;
    score -= Math.min(20, clutterItems.length * 2);
    score -= Math.min(15, lossMakers.length * 1.5);
    if (processedData.length > 20) score -= 10;
    if (processedData.length > 40) score -= 10;
    score = Math.max(0, Math.round(score));
    
    let healthLabel = score < 40 ? "Critical" : score < 60 ? "Poor" : score < 80 ? "Good" : "Excellent";
    
    // Get unique categories for filter
    const categories = ['All', ...new Set(processedData.map(d => d['Category']).filter(Boolean))];

    // Highs and Lows for Dashboard
    const topGainers = [...processedData].sort((a,b) => b._absReturn - a._absReturn).slice(0, 3);
    const bottomLaggards = [...processedData].sort((a,b) => a._absReturn - b._absReturn).slice(0, 3);

    return {
      totalInv, totalCurr, totalReturns, absReturn,
      lossMakers, clutter, categoryData, amcData, processedData, categoryTree,
      healthScore: { score, label: healthLabel },
      comparisonData,
      simStats: { originalCount, originalTotalVal, clutterCount: clutterItems.length, clutterVal },
      consolidationPlan,
      categories,
      topGainers,
      bottomLaggards
    };
  }, [data, simulateCleanup]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-sans transition-colors duration-300">
        <div className="max-w-2xl w-full">
            <div className="absolute top-6 right-6">
                <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all">
                    {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                </button>
            </div>

          <div className="text-center mb-12">
            <div className="bg-indigo-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30 rotate-3 transition-transform hover:rotate-6">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Vivek Narkhede's <span className="text-indigo-600">Portfolio Analyzer</span></h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Advanced wealth analytics in your browser. <br/>Drag & drop your broker statement (.csv or .xlsx) to begin.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="relative z-0 flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {loading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div> : <Upload className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upload Holdings File</h3>
                <p className="text-slate-400 mt-2 text-sm">Supports Groww, Zerodha, CAMS, Karvy formats</p>
                <p className="text-slate-400 mt-1 text-xs">(PDF statements? Please convert to Excel/CSV first)</p>
                
                <div className="mt-8 flex gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3"/> .XLSX</span>
                    <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3"/> .CSV</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> Private & Secure</span>
                </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
              <button 
                onClick={loadSampleData} 
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2"
              >
                  Or try with sample data <ArrowRightLeft className="w-3 h-3"/>
              </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div><p className="font-bold">Error</p><p>{error}</p></div>
            </div>
          )}
          <div className="mt-12 text-center text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
             Disclaimer: I am not registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor nor registered with the Association of Mutual Funds in India (AMFI) as a Mutual Fund Distributor. Any information shared is purely for educational purposes and does not constitute investment advice, recommendation, or solicitation. Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-24 transition-colors duration-300">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block tracking-tight text-slate-800 dark:text-white">Vivek Narkhede's <span className="text-indigo-600">Portfolio Analyzer</span></span>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {['dashboard', 'optimize', 'performance', 'holdings'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors" title="Save as PDF">
                <Printer className="w-5 h-5"/>
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors">
                {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
            </button>
             <button onClick={() => setData(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Close File"><X className="w-5 h-5" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Value Card */}
            <div className="md:col-span-6 lg:col-span-5 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-30 blur group-hover:opacity-50 transition duration-500"></div>
                <div className="relative h-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Wallet className="w-5 h-5 text-indigo-600"/></div>
                        <span className="font-semibold text-sm uppercase tracking-wider">Net Worth</span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
                        {formatCurrency(analysis.totalCurr)}
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${analysis.totalReturns >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {analysis.totalReturns >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                            {formatCurrency(analysis.totalReturns)}
                        </div>
                        <span className="text-sm text-slate-400 font-medium">Total Profit</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-4">
                <Card className="flex flex-col justify-between hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="text-slate-500 text-sm font-medium">Invested</div>
                        <Briefcase className="w-5 h-5 text-slate-300"/>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{formatCurrency(analysis.totalInv)}</div>
                </Card>
                <Card className="flex flex-col justify-between hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="text-slate-500 text-sm font-medium">Absolute Return</div>
                        <Activity className="w-5 h-5 text-emerald-400"/>
                    </div>
                    <div className={`text-2xl font-bold mt-2 ${analysis.absReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{analysis.absReturn.toFixed(2)}%</div>
                </Card>
                <Card className="flex flex-col justify-between hover:border-indigo-200 transition-colors bg-slate-50 dark:bg-slate-800/50 border-none">
                    <div className="flex justify-between items-start">
                        <div className="text-slate-500 text-sm font-medium">Active Funds</div>
                        <Layers className="w-5 h-5 text-slate-300"/>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{analysis.processedData.length}</div>
                </Card>
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 ${analysis.healthScore.score > 70 ? 'bg-emerald-500' : 'bg-amber-500'} opacity-20`}></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="text-slate-300 text-sm font-medium flex items-center gap-1"><Shield className="w-3 h-3"/> Health Score</div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10`}>{analysis.healthScore.label}</div>
                        </div>
                        <div className="text-3xl font-bold mt-2">{analysis.healthScore.score}<span className="text-lg text-slate-400 font-normal">/100</span></div>
                    </div>
                </Card>
            </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* AMC Exposure Chart (Expanded) */}
             <Card className="min-h-[400px] lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white"><BarChart3 className="w-5 h-5 text-indigo-500" /> Top AMC Exposure</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis.amcData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} />
                            <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </Card>

             {/* Performance Highlights Section (Replaces Treemap) */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Top Gainers */}
                 <Card className="border-t-4 border-t-emerald-500">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white"><Trophy className="w-5 h-5 text-emerald-500" /> Top Gainers</h3>
                         <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Leaders</span>
                     </div>
                     <div className="space-y-4">
                         {analysis.topGainers.map((fund, idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                 <div>
                                     <div className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={fund['Scheme Name']}>{fund['Scheme Name']}</div>
                                     <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(fund['Current Value'])}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-sm font-bold text-emerald-600">+{fund._absReturn.toFixed(2)}%</div>
                                     <div className="text-[10px] text-slate-400 uppercase font-medium">Return</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </Card>

                 {/* Bottom Laggards */}
                 <Card className="border-t-4 border-t-rose-500">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white"><AlertCircle className="w-5 h-5 text-rose-500" /> Concern Areas</h3>
                         <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">Laggards</span>
                     </div>
                     <div className="space-y-4">
                         {analysis.bottomLaggards.map((fund, idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                 <div>
                                     <div className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={fund['Scheme Name']}>{fund['Scheme Name']}</div>
                                     <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(fund['Current Value'])}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className={`text-sm font-bold ${fund._absReturn >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                         {fund._absReturn > 0 ? '+' : ''}{fund._absReturn.toFixed(2)}%
                                     </div>
                                     <div className="text-[10px] text-slate-400 uppercase font-medium">Return</div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </Card>
             </div>

             {/* Action Items Row */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><Filter className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Clutter Alert</h3>
                                <p className="text-slate-500 text-sm mt-1"><strong>{analysis.clutter.length} funds</strong> are less than ₹5,000 in value.</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={() => downloadCSV(analysis.clutter, 'cleanup_list.csv')} icon={Download}>Export</Button>
                    </div>
                </Card>

                <Card className="border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className="p-3 bg-rose-100 rounded-xl text-rose-600"><TrendingDown className="w-6 h-6" /></div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Underperformers</h3>
                                <p className="text-slate-500 text-sm mt-1"><strong>{analysis.lossMakers.length} funds</strong> are currently in the red.</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={() => downloadCSV(analysis.lossMakers, 'loss_makers.csv')} icon={Download}>Export</Button>
                    </div>
                </Card>
             </div>
          </div>
        )}

        {/* --- OPTIMIZATION TAB --- */}
        {activeTab === 'optimize' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                
                {/* Simulator Banner */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-indigo-500/30 text-indigo-200 border-none">Portfolio Detox</Badge>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                    <Wand2 className="w-8 h-8 text-indigo-400"/> Cleanup Simulator
                                </h2>
                                <p className="text-indigo-200 mt-2 max-w-xl text-lg">
                                    Visualize your portfolio without the small "clutter" funds.
                                </p>
                            </div>
                            <button 
                                onClick={() => setSimulateCleanup(!simulateCleanup)}
                                className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${simulateCleanup ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}
                            >
                                {simulateCleanup ? <><RefreshCw className="w-5 h-5"/> Reset View</> : <><Trash2 className="w-5 h-5"/> Simulate Cleanup</>}
                            </button>
                        </div>

                        {simulateCleanup && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                                <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10">
                                    <div className="text-indigo-300 text-sm font-medium mb-1">Funds Removed</div>
                                    <div className="text-3xl font-bold">{analysis.simStats.clutterCount}</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10">
                                    <div className="text-indigo-300 text-sm font-medium mb-1">Cash Freed Up</div>
                                    <div className="text-3xl font-bold">{formatCurrency(analysis.simStats.clutterVal)}</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10">
                                    <div className="text-indigo-300 text-sm font-medium mb-1">Clutter Impact</div>
                                    <div className="text-3xl font-bold">{((analysis.simStats.clutterVal/analysis.simStats.originalTotalVal)*100).toFixed(1)}%</div>
                                    <div className="text-xs text-indigo-400 mt-1">of total wealth</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Consolidation Suggestions */}
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-500"/> Consolidation Opportunities
                        </h3>
                     </div>
                     
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analysis.consolidationPlan.map((plan, idx) => (
                            <Card key={idx} className="border-t-4 border-t-amber-400" noPadding>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-white">{plan.category}</h4>
                                            <p className="text-sm text-slate-500">Multiple funds overlapping</p>
                                        </div>
                                        <Badge type="warning">{plan.others.length + 1} Funds</Badge>
                                    </div>
                                    
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-4 mb-6">
                                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                                        <div>
                                            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Primary Fund (Keep)</div>
                                            <div className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{plan.winner['Scheme Name']}</div>
                                            <div className="text-sm text-emerald-600 mt-1 font-medium">Best Performer</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wide pl-1">Merge these into Primary</div>
                                        {plan.others.map((fund, fIdx) => (
                                            <div key={fIdx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700 group hover:border-amber-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <ArrowRightLeft className="w-4 h-4 text-slate-300 group-hover:text-amber-400"/>
                                                    <div className="truncate max-w-[180px] font-medium text-slate-600 dark:text-slate-300" title={fund['Scheme Name']}>{fund['Scheme Name']}</div>
                                                </div>
                                                <div className="font-mono font-medium">{formatCurrency(fund['Current Value'])}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Potential Value to Move</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(plan.potentialMoveValue)}</span>
                                </div>
                            </Card>
                        ))}
                     </div>
                </div>
            </div>
        )}

        {/* --- PERFORMANCE TAB --- */}
        {activeTab === 'performance' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-start gap-4">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl"><Gauge className="w-6 h-6"/></div>
                    <div>
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-200">Smart Benchmark Analysis</h3>
                        <p className="text-indigo-700 dark:text-indigo-300 mt-1 max-w-3xl">
                            Comparison of your <strong>Weighted XIRR</strong> against standard indices (Nifty 50, Midcap 150, etc.). 
                            <span className="inline-flex items-center mx-1 bg-white/50 px-2 rounded text-emerald-700 font-bold"><ArrowUp className="w-3 h-3 mr-1"/>Positive Alpha</span> means you are beating the market.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Chart */}
                    <Card className="lg:col-span-8 min-h-[400px]">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800"><BarChart3 className="w-5 h-5 text-indigo-500" /> Performance vs Benchmark (XIRR %)</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={analysis.comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="category" scale="point" padding={{ left: 30, right: 30 }} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                    <YAxis label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="myXIRR" name="Your Portfolio" fill="#6366f1" barSize={40} radius={[6, 6, 0, 0]} />
                                    <Line type="monotone" dataKey="benchXIRR" name="Benchmark Index" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Breakdown List */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Category Alpha</h3>
                        {analysis.comparisonData.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.alpha >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{item.category}</h4>
                                        <div className="text-xs text-slate-400">{item.benchName}</div>
                                    </div>
                                    <div className={`text-right ${item.alpha >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        <div className="text-lg font-bold">{item.alpha > 0 ? '+' : ''}{item.alpha}%</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider">Alpha</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm pt-3 border-t border-slate-50 dark:border-slate-700">
                                    <div><span className="text-slate-400 mr-2">You</span> <span className="font-semibold">{item.myXIRR}%</span></div>
                                    <div><span className="text-slate-400 mr-2">Index</span> <span className="font-semibold">{item.benchXIRR}%</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- HOLDINGS TAB --- */}
        {activeTab === 'holdings' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card noPadding>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">All Holdings</h3>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Category Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full sm:w-40 pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer text-slate-700 dark:text-slate-300 font-medium"
                                >
                                    {analysis.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search funds..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                />
                            </div>
                            <Button variant="secondary" onClick={() => downloadCSV(analysis.processedData, 'full_holdings.csv')} icon={Download}>Export</Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Scheme Name</th>
                                    <th className="px-4 py-4 text-right">Units</th>
                                    <th className="px-4 py-4 text-right">Invested</th>
                                    <th className="px-4 py-4 text-right">Current Value</th>
                                    <th className="px-6 py-4 text-right">Net Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {analysis.processedData
                                    .filter(i => categoryFilter === 'All' || i['Category'] === categoryFilter)
                                    .filter(i => i['Scheme Name'].toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white truncate max-w-sm" title={item['Scheme Name']}>{item['Scheme Name']}</div>
                                            <div className="flex gap-2 mt-1">
                                                <Badge type="neutral" className="text-[10px] py-0 px-2">{item['Category']}</Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-500 font-mono">{formatNumber(item['Units'], 3)}</td>
                                        <td className="px-4 py-4 text-right text-slate-600 font-medium">{formatNumber(item['Invested Value'], 0)}</td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white">{formatNumber(item['Current Value'], 0)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-bold ${item['Returns'] >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item['Returns'] >= 0 ? '+' : ''}{formatNumber(item['Returns'], 0)}
                                            </div>
                                            <div className={`text-xs mt-0.5 font-medium ${item._absReturn >= 0 ? 'text-emerald-600/70' : 'text-rose-600/70'}`}>
                                                {item._absReturn.toFixed(2)}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        )}
      </main>
      
      {/* Footer added below main content */}
      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-xs pb-8 leading-relaxed">
        Disclaimer: I am not registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor nor registered with the Association of Mutual Funds in India (AMFI) as a Mutual Fund Distributor. Any information shared is purely for educational purposes and does not constitute investment advice, recommendation, or solicitation. Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing
      </footer>
    </div>
  );
}
