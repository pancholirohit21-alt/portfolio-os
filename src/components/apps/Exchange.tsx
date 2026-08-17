'use client';
import React, { useState, useEffect } from 'react';
import { ArrowDownUp, TrendingUp, RefreshCcw, DollarSign, Bitcoin, Coins } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

// Definitions
const FIAT_CURRENCIES = [
  { id: 'USD', name: 'US Dollar', symbol: '$', unit: 'USD' },
  { id: 'EUR', name: 'Euro', symbol: '€', unit: 'EUR' },
  { id: 'GBP', name: 'British Pound', symbol: '£', unit: 'GBP' },
  { id: 'INR', name: 'Indian Rupee', symbol: '₹', unit: 'INR' },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥', unit: 'JPY' },
  { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', unit: 'AUD' },
  { id: 'CAD', name: 'Canadian Dollar', symbol: 'C$', unit: 'CAD' },
  { id: 'CHF', name: 'Swiss Franc', symbol: 'Fr', unit: 'CHF' },
  { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', unit: 'CNY' },
];

const CRYPTO_CURRENCIES = [
  { id: 'BTC', cgId: 'bitcoin', name: 'Bitcoin', symbol: '₿', unit: 'BTC' },
  { id: 'ETH', cgId: 'ethereum', name: 'Ethereum', symbol: 'Ξ', unit: 'ETH' },
  { id: 'SOL', cgId: 'solana', name: 'Solana', symbol: 'SOL', unit: 'SOL' },
  { id: 'XRP', cgId: 'ripple', name: 'Ripple', symbol: 'XRP', unit: 'XRP' },
  { id: 'ADA', cgId: 'cardano', name: 'Cardano', symbol: 'ADA', unit: 'ADA' },
];

const METALS = [
  { id: 'XAU', cgId: 'pax-gold', name: 'Gold (Gram)', symbol: 'Au', unit: 'g', multiplier: 1 / 31.1034768 },
  { id: 'XAG', cgId: 'kinesis-silver', name: 'Silver (Gram)', symbol: 'Ag', unit: 'g', multiplier: 1 / 31.1034768 },
];

const ALL_ASSETS = [...FIAT_CURRENCIES, ...CRYPTO_CURRENCIES, ...METALS];

export default function Exchange() {
  const { themeMode } = useSettingsStore();
  const isLight = themeMode === 'light';

  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Converter State
  const [amount1, setAmount1] = useState<string>('1');
  const [asset1, setAsset1] = useState<string>('USD');
  const [amount2, setAmount2] = useState<string>('');
  const [asset2, setAsset2] = useState<string>('BTC');
  const [activeInput, setActiveInput] = useState<1 | 2>(1);

  // Fetch all rates and peg them to USD
  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const newRates: Record<string, number> = {};
      const timestamp = new Date().getTime();
      // 1. Fetch Fiat (Base: USD)
      const fiatRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD?_t=${timestamp}`);
      if (!fiatRes.ok) throw new Error('Failed to fetch fiat rates');
      const fiatData = await fiatRes.json();
      
      for (const fiat of FIAT_CURRENCIES) {
        if (fiatData.rates[fiat.id]) {
          newRates[fiat.id] = fiatData.rates[fiat.id]; // e.g. 1 USD = 83.5 INR
        }
      }
      newRates['USD'] = 1;

      // 2. Fetch Crypto & Metals (Prices in USD)
      const cryptoIds = [...CRYPTO_CURRENCIES, ...METALS].map(c => c.cgId).join(',');
      const cryptoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&_t=${timestamp}`);
      if (!cryptoRes.ok) throw new Error('Failed to fetch crypto rates');
      const cryptoData = await cryptoRes.json();

      [...CRYPTO_CURRENCIES, ...METALS].forEach(c => {
        if (cryptoData[c.cgId] && cryptoData[c.cgId].usd) {
          const usdPrice = cryptoData[c.cgId].usd;
          const mult = (c as any).multiplier || 1;
          newRates[c.id] = 1 / (usdPrice * mult); // 1 USD = (1 / Price) Asset
        }
      });

      setRates(newRates);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load live market data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 60 seconds
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // Conversion Logic
  useEffect(() => {
    if (Object.keys(rates).length === 0) return;
    
    if (activeInput === 1) {
      const val = parseFloat(amount1);
      if (isNaN(val)) {
        setAmount2('');
        return;
      }
      // Convert to USD first, then to target
      const usdValue = val / rates[asset1];
      let result = usdValue * rates[asset2];
      
      // Formatting
      if (result < 0.0001) setAmount2(result.toFixed(8));
      else if (result < 1) setAmount2(result.toFixed(4));
      else setAmount2(result.toFixed(2));
    } else {
      const val = parseFloat(amount2);
      if (isNaN(val)) {
        setAmount1('');
        return;
      }
      const usdValue = val / rates[asset2];
      let result = usdValue * rates[asset1];
      
      if (result < 0.0001) setAmount1(result.toFixed(8));
      else if (result < 1) setAmount1(result.toFixed(4));
      else setAmount1(result.toFixed(2));
    }
  }, [amount1, amount2, asset1, asset2, rates, activeInput]);

  const handleSwap = () => {
    setAsset1(asset2);
    setAsset2(asset1);
    setAmount1(amount2);
    setActiveInput(1);
  };

  const renderMarketItem = (assetId: string, name: string) => {
    if (!rates[assetId]) return null;
    // Price in USD = 1 / rates[assetId]
    const priceUsd = 1 / rates[assetId];
    return (
      <div key={assetId} className={`flex justify-between items-center p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-white/10 text-white'}`}>
            {ALL_ASSETS.find(a => a.id === assetId)?.symbol || assetId}
          </div>
          <div>
            <p className="font-semibold">{assetId}</p>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${priceUsd < 0.01 ? priceUsd.toFixed(6) : priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-emerald-500 text-xs flex items-center justify-end gap-1"><TrendingUp size={10} /> Live</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col overflow-y-auto ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-black/80 text-white'}`}>
      {/* Header */}
      <div className={`p-6 border-b sticky top-0 z-10 backdrop-blur-md ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/50 border-white/10'}`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="text-emerald-500" />
              Global Exchange
            </h1>
            <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Real-time Fiat, Crypto & Precious Metals</p>
          </div>
          <button 
            onClick={fetchRates}
            disabled={loading}
            className={`p-2 rounded-full transition-all ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'} ${loading ? 'animate-spin opacity-50' : ''}`}
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Converter Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ArrowDownUp className="text-indigo-500" size={20} />
              Instant Converter
            </h2>

            {error ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            ) : (
              <>
                <div className={`p-6 rounded-3xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  {/* Input 1 */}
                <div className={`p-4 rounded-2xl transition-colors ${isLight ? (activeInput === 1 ? 'bg-indigo-50/50 border border-indigo-200' : 'bg-slate-50 border border-transparent') : (activeInput === 1 ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-black/20 border border-transparent')}`}>
                  <div className="flex justify-between mb-2">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>You Pay</label>
                  </div>
                  <div className="flex gap-4 items-center">
                    <select 
                      value={asset1} 
                      onChange={(e) => setAsset1(e.target.value)}
                      className={`text-lg font-bold bg-transparent outline-none cursor-pointer w-24`}
                    >
                      <optgroup label="Fiat">
                        {FIAT_CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.id} - {c.symbol}</option>)}
                      </optgroup>
                      <optgroup label="Crypto">
                        {CRYPTO_CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.id} - {c.symbol}</option>)}
                      </optgroup>
                      <optgroup label="Metals">
                        {METALS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                      </optgroup>
                    </select>
                    <div className="flex-1 flex items-center justify-end">
                      <input 
                        type="number" 
                        value={amount1}
                        onChange={(e) => { setAmount1(e.target.value); setActiveInput(1); }}
                        placeholder="0.00"
                        className="bg-transparent text-right text-3xl font-bold outline-none w-full min-w-[50px]"
                      />
                      <span className={`ml-2 text-sm font-bold uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {ALL_ASSETS.find(a => a.id === asset1)?.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="relative flex justify-center -my-3 z-10">
                  <button 
                    onClick={handleSwap}
                    className={`p-2 rounded-full border shadow-sm hover:scale-110 transition-transform ${isLight ? 'bg-white border-slate-200 text-indigo-500' : 'bg-slate-800 border-white/10 text-indigo-400'}`}
                  >
                    <ArrowDownUp size={16} />
                  </button>
                </div>

                {/* Input 2 */}
                <div className={`p-4 rounded-2xl transition-colors ${isLight ? (activeInput === 2 ? 'bg-indigo-50/50 border border-indigo-200' : 'bg-slate-50 border border-transparent') : (activeInput === 2 ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-black/20 border border-transparent')}`}>
                  <div className="flex justify-between mb-2">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>You Get</label>
                  </div>
                  <div className="flex gap-4 items-center">
                    <select 
                      value={asset2} 
                      onChange={(e) => setAsset2(e.target.value)}
                      className={`text-lg font-bold bg-transparent outline-none cursor-pointer w-24`}
                    >
                      <optgroup label="Fiat">
                        {FIAT_CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.id} - {c.symbol}</option>)}
                      </optgroup>
                      <optgroup label="Crypto">
                        {CRYPTO_CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.id} - {c.symbol}</option>)}
                      </optgroup>
                      <optgroup label="Metals">
                        {METALS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                      </optgroup>
                    </select>
                    <div className="flex-1 flex items-center justify-end">
                      <input 
                        type="number" 
                        value={amount2}
                        onChange={(e) => { setAmount2(e.target.value); setActiveInput(2); }}
                        placeholder="0.00"
                        className="bg-transparent text-right text-3xl font-bold outline-none w-full min-w-[50px]"
                      />
                      <span className={`ml-2 text-sm font-bold uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {ALL_ASSETS.find(a => a.id === asset2)?.unit}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`mt-4 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {rates[asset1] && rates[asset2] ? (
                    <p>1 {asset1} = {((1 / rates[asset1]) * rates[asset2]).toLocaleString(undefined, { maximumSignificantDigits: 6 })} {asset2}</p>
                  ) : 'Loading live rates...'}
                </div>
              </div>
              
              {/* Info Label */}
              <div className={`mt-4 flex gap-6 text-xs font-medium justify-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> XAU = Gold</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> XAG = Silver</span>
              </div>
            </>
            )}
          </div>

          {/* Market Overview Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Coins className="text-amber-500" size={20} />
              Market Overview (USD)
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Top Cryptocurrencies</h3>
                <div className="space-y-2">
                  {CRYPTO_CURRENCIES.map(c => renderMarketItem(c.id, c.name))}
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 mt-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Precious Metals</h3>
                <div className="space-y-2">
                  {METALS.map(c => renderMarketItem(c.id, c.name))}
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 mt-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Global Fiat (Top 5)</h3>
                <div className="space-y-2">
                  {FIAT_CURRENCIES.slice(1, 6).map(c => renderMarketItem(c.id, c.name))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
