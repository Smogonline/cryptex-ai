import { useState, useEffect, useCallback, useRef } from "react";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
];

const fmtPrice = (p) => {
  if (!p && p !== 0) return "—";
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (p >= 1) return "$" + p.toFixed(4);
  return "$" + p.toFixed(6);
};
const fmtPct = (p) => { if (p == null) return "—"; return (p >= 0 ? "+" : "") + p.toFixed(2) + "%"; };
const fmtMcap = (v) => { if (!v) return "—"; if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T"; if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B"; if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M"; return "$" + v.toLocaleString(); };

function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const color = positive ? "#00ff88" : "#ff4466";
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
}

function PriceChart({ data }) {
  if (!data || data.length < 2) return <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: 12 }}>Loading chart...</div>;
  const w = 600, h = 160;
  const prices = data.map(d => d[1]);
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const positive = prices[prices.length - 1] >= prices[0];
  const color = positive ? "#00ff88" : "#ff4466";
  const step = Math.max(1, Math.floor(data.length / 80));
  const sampled = data.filter((_, i) => i % step === 0);
  const sp = sampled.map(d => d[1]);
  const st = sampled.map(d => d[0]);
  const toX = (i) => 40 + (i / (sp.length - 1)) * (w - 55);
  const toY = (v) => 8 + ((max - v) / range) * (h - 24);
  const linePts = sp.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const areaPath = `M${toX(0)},${toY(sp[0])} ` + sp.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") + ` L${toX(sp.length-1)},${h} L${toX(0)},${h} Z`;
  const pLabels = [0,1,2,3].map(i => { const val = min + (range*i)/3; return {val, y:toY(val)}; }).reverse();
  const tLabels = [0, Math.floor(sp.length/2), sp.length-1].map(i => ({ x:toX(i), label:new Date(st[i]).toLocaleDateString("en-US",{month:"short",day:"numeric"}) }));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h+18}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {pLabels.map((l,i) => <g key={i}><line x1={40} y1={l.y} x2={w-5} y2={l.y} stroke="#1a2535" strokeWidth="1"/><text x={36} y={l.y+4} textAnchor="end" fill="#4a6070" fontSize="8" fontFamily="monospace">{l.val>=1000?"$"+(l.val/1000).toFixed(1)+"k":"$"+l.val.toFixed(l.val<1?4:2)}</text></g>)}
      <path d={areaPath} fill="url(#ag)"/>
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.8" filter="url(#glow)"/>
      <circle cx={toX(sp.length-1)} cy={toY(sp[sp.length-1])} r="4" fill={color} filter="url(#glow)"/>
      {tLabels.map((l,i) => <text key={i} x={l.x} y={h+13} textAnchor="middle" fill="#4a6070" fontSize="8" fontFamily="monospace">{l.label}</text>)}
    </svg>
  );
}

function RSIGauge({ value }) {
  if (!value) return null;
  const angle = ((value/100)*180)-90;
  const zone = value<30?"#00ff88":value>70?"#ff4466":"#f59e0b";
  return <div style={{textAlign:"center"}}><svg width="80" height="44" viewBox="0 0 80 44"><path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="#1a2535" strokeWidth="6" strokeLinecap="round"/><path d="M8 40 A32 32 0 0 1 40 8" fill="none" stroke="#1a4a2a" strokeWidth="4" strokeLinecap="round"/><path d="M40 8 A32 32 0 0 1 72 40" fill="none" stroke="#4a1a1a" strokeWidth="4" strokeLinecap="round"/><g transform={`rotate(${angle},40,40)`}><line x1="40" y1="40" x2="40" y2="14" stroke={zone} strokeWidth="2" strokeLinecap="round"/><circle cx="40" cy="40" r="3" fill={zone}/></g></svg><div style={{fontSize:11,fontFamily:"monospace",color:zone,marginTop:-4}}>{value?.toFixed(1)}</div></div>;
}

export default function App() {
  const [marketData, setMarketData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [coinDetail, setCoinDetail] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartDays, setChartDays] = useState(7);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aiSignal, setAiSignal] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertInput, setAlertInput] = useState({ coin:"BTC", price:"", direction:"above" });
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalData, setGlobalData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d");
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setMarketData(data);
      setLastUpdated(new Date());
      const triggered = [];
      alertsRef.current.forEach(a => {
        const coin = data.find(c => c.symbol.toUpperCase()===a.coin.toUpperCase());
        if (!coin) return;
        if (a.direction==="above"&&coin.current_price>=a.price) triggered.push({...a,currentPrice:coin.current_price});
        if (a.direction==="below"&&coin.current_price<=a.price) triggered.push({...a,currentPrice:coin.current_price});
      });
      if (triggered.length) setTriggeredAlerts(prev=>[...prev,...triggered].slice(-10));
    } catch(e){}
  }, []);

  const fetchGlobal = useCallback(async () => {
    try { const res=await fetch("https://api.coingecko.com/api/v3/global"); const data=await res.json(); setGlobalData(data.data); } catch(e){}
  }, []);

  const fetchCoinDetail = useCallback(async (id) => {
    try { const res=await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`); const data=await res.json(); setCoinDetail(data); } catch(e){}
  }, []);

  const fetchChart = useCallback(async (id, days) => {
    try { const res=await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`); const data=await res.json(); setChartData(data.prices); } catch(e){}
  }, []);

  useEffect(() => { fetchMarket(); fetchGlobal(); const i=setInterval(fetchMarket,60000); return()=>clearInterval(i); }, [fetchMarket,fetchGlobal]);
  useEffect(() => { fetchCoinDetail(selectedCoin); fetchChart(selectedCoin,chartDays); }, [selectedCoin,chartDays]);

  const getAISignal = async () => {
    if (!coinDetail||!marketData.length) return;
    setAiLoading(true); setAiSignal(null);
    const coin = marketData.find(c=>c.id===selectedCoin);
    const prompt = `You are a professional crypto trading analyst. Analyze this real-time data for ${coinDetail.name} (${coin?.symbol?.toUpperCase()}) and return ONLY a JSON object, no markdown.

Data: Price=${fmtPrice(coin?.current_price)}, 1h=${fmtPct(coin?.price_change_percentage_1h_in_currency)}, 24h=${fmtPct(coin?.price_change_percentage_24h)}, 7d=${fmtPct(coin?.price_change_percentage_7d_in_currency)}, MCap=${fmtMcap(coin?.market_cap)}, Vol=${fmtMcap(coin?.total_volume)}, ATH=${fmtPrice(coinDetail.market_data?.ath?.usd)}, ATH%=${coinDetail.market_data?.ath_change_percentage?.usd?.toFixed(2)}%, Rank=#${coin?.market_cap_rank}

Return this exact JSON (all numbers must be actual price values based on current price):
{"signal":"STRONG BUY|BUY|HOLD|SELL|STRONG SELL","confidence":0-100,"summary":"2-3 sentences","reasoning":"3-4 sentences","priceTargets":{"1h":{"low":0,"mid":0,"high":0},"24h":{"low":0,"mid":0,"high":0},"7d":{"low":0,"mid":0,"high":0},"30d":{"low":0,"mid":0,"high":0}},"supportLevel":0,"resistanceLevel":0,"rsi":0-100,"trend":"BULLISH|BEARISH|SIDEWAYS","riskLevel":"LOW|MEDIUM|HIGH|EXTREME","entryZone":{"from":0,"to":0},"stopLoss":0,"takeProfit":0,"keyInsight":"one sentence","technicalIndicators":{"macd":"BULLISH|BEARISH|NEUTRAL","bollingerBands":"UPPER|MIDDLE|LOWER","volumeTrend":"INCREASING|DECREASING|STABLE","momentum":"STRONG|WEAK|BUILDING"}}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setAiSignal(JSON.parse(text));
    } catch(e) { setAiSignal({error:"Analysis failed. Please try again."}); }
    setAiLoading(false);
  };

  const currentCoin = marketData.find(c=>c.id===selectedCoin);
  const top5 = [...marketData].filter(c=>c.price_change_percentage_24h!=null).sort((a,b)=>b.price_change_percentage_24h-a.price_change_percentage_24h).slice(0,5);
  const filteredCoins = marketData.filter(c=>c.name.toLowerCase().includes(searchQuery.toLowerCase())||c.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  const signalColor = (s)=>{ if(!s)return"#888"; if(s.includes("STRONG BUY"))return"#00ff88"; if(s.includes("BUY"))return"#00cc66"; if(s.includes("STRONG SELL"))return"#ff2244"; if(s.includes("SELL"))return"#ff4466"; return"#f59e0b"; };
  const addAlert = ()=>{ if(!alertInput.price||isNaN(alertInput.price))return; setAlerts(prev=>[...prev,{...alertInput,price:parseFloat(alertInput.price),id:Date.now()}]); setAlertInput(prev=>({...prev,price:""})); };
  const fearGreedVal = globalData?.market_cap_change_percentage_24h_usd!=null ? Math.min(100,Math.max(0,50+globalData.market_cap_change_percentage_24h_usd*5)) : null;
  const fgColor = (v)=>{ if(!v)return"#888"; if(v<25)return"#ff2244"; if(v<45)return"#ff8800"; if(v<55)return"#f59e0b"; if(v<75)return"#00cc66"; return"#00ff88"; };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
    body{background:#060d18;color:#c8d8e8;font-family:'Space Mono',monospace;font-size:13px;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
    .tab-content{animation:slideUp 0.25s ease;}
    .coin-btn:active,.nav-btn:active,.action-btn:active{transform:scale(0.96);}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:#060d18;}
    ::-webkit-scrollbar-thumb{background:#1a3050;border-radius:2px;}
    .ticker-scroll{overflow:hidden;white-space:nowrap;}
    @media(max-width:767px){
      .desktop-only{display:none!important;}
      .mobile-grid2{grid-template-columns:1fr!important;}
      .mobile-grid3{grid-template-columns:1fr 1fr!important;}
      .mobile-top5{grid-template-columns:repeat(2,1fr)!important;}
      .mobile-mktcols{grid-template-columns:40px 1fr 100px 70px!important;}
      .mobile-hide{display:none!important;}
      .mobile-full{width:100%!important;}
      .mobile-padding{padding:12px!important;}
      .mobile-font-sm{font-size:11px!important;}
    }
    @media(min-width:768px){
      .mobile-only{display:none!important;}
    }
  `;

  const S = {
    app:{background:"#060d18",minHeight:"100vh",color:"#c8d8e8",fontFamily:"'Space Mono',monospace",fontSize:13,paddingBottom:isMobile?70:0},
    hdr:{background:"linear-gradient(135deg,#0a1628,#0d1f35)",borderBottom:"1px solid #0f2540",padding:isMobile?"10px 14px":"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100},
    desktopNav:{display:"flex",gap:4,padding:"0 20px",background:"#08111e",borderBottom:"1px solid #0f2540"},
    mobileNav:{position:"fixed",bottom:0,left:0,right:0,background:"#08111e",borderTop:"1px solid #0f2540",display:"flex",zIndex:200,paddingBottom:"env(safe-area-inset-bottom,0px)"},
    mobileNavBtn:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px 8px",background:"none",border:"none",color:a?"#00ff88":"#3a5a80",cursor:"pointer",fontSize:9,fontFamily:"inherit",letterSpacing:1,gap:4,transition:"color 0.2s"}),
    desktopNavBtn:(a)=>({padding:"10px 16px",background:"none",border:"none",color:a?"#00ff88":"#5a7090",cursor:"pointer",fontSize:12,fontFamily:"inherit",letterSpacing:1,borderBottom:a?"2px solid #00ff88":"2px solid transparent",transition:"all 0.2s"}),
    main:{padding:isMobile?"12px 12px":"16px 20px",maxWidth:1400,margin:"0 auto"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?10:16},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:isMobile?10:16},
    card:{background:"linear-gradient(135deg,#0a1628,#0c1a2e)",border:"1px solid #0f2540",borderRadius:12,padding:isMobile?12:16},
    cTitle:{fontSize:10,letterSpacing:2,color:"#3a5a80",textTransform:"uppercase",marginBottom:isMobile?8:12,display:"flex",alignItems:"center",justifyContent:"space-between"},
    badge:(pos)=>({display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:10,background:pos?"rgba(0,255,136,0.1)":"rgba(255,68,102,0.1)",color:pos?"#00ff88":"#ff4466",border:`1px solid ${pos?"rgba(0,255,136,0.2)":"rgba(255,68,102,0.2)"}`}),
    btn:{background:"linear-gradient(135deg,#00ff88,#00aaff)",border:"none",borderRadius:8,padding:isMobile?"12px 16px":"10px 20px",color:"#060d18",fontWeight:"bold",cursor:"pointer",fontSize:12,fontFamily:"inherit",letterSpacing:1,width:"100%",transition:"opacity 0.2s"},
    btnO:(active,activeColor)=>({background:active?`${activeColor||"#00ff88"}18`:"none",border:`1px solid ${active?(activeColor||"#00ff88")+"55":"#0f2540"}`,borderRadius:6,padding:"6px 12px",color:active?(activeColor||"#00ff88"):"#5a7090",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}),
    input:{background:"#0c1a2e",border:"1px solid #0f2540",borderRadius:8,padding:"10px 12px",color:"#c8d8e8",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"},
    select:{background:"#0c1a2e",border:"1px solid #0f2540",borderRadius:8,padding:"10px 12px",color:"#c8d8e8",fontSize:12,fontFamily:"inherit",outline:"none",width:"100%"},
    sRow:{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0a1628"},
    sLabel:{color:"#3a5a80",fontSize:11},
  };

  const NAV_ITEMS = [
    {id:"dashboard",icon:"⬡",label:"HOME"},
    {id:"analysis",icon:"📈",label:"CHART"},
    {id:"markets",icon:"🔍",label:"MARKETS"},
    {id:"signals",icon:"⚡",label:"SIGNALS"},
    {id:"alerts",icon:"🔔",label:"ALERTS"},
  ];

  return (
    <div style={S.app}>
      <style>{css}</style>

      {/* HEADER */}
      <header style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#00ff88,#00aaff)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>⬡</div>
          <div>
            <div style={{fontSize:isMobile?14:16,fontWeight:"bold",background:"linear-gradient(90deg,#00ff88,#00aaff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:1}}>CRYPTEX AI</div>
            {!isMobile&&<div style={{fontSize:9,color:"#3a5a80",letterSpacing:2}}>PROFESSIONAL TRADING SUITE</div>}
          </div>
        </div>

        {/* Ticker - desktop */}
        {!isMobile && (
          <div style={{display:"flex",gap:16,overflow:"hidden",maxWidth:500}}>
            {marketData.slice(0,5).map(c=>(
              <div key={c.id} style={{display:"flex",gap:5,whiteSpace:"nowrap",fontSize:11}}>
                <span style={{color:"#5a7090"}}>{c.symbol?.toUpperCase()}</span>
                <span>{fmtPrice(c.current_price)}</span>
                <span style={{color:c.price_change_percentage_24h>=0?"#00ff88":"#ff4466"}}>{fmtPct(c.price_change_percentage_24h)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mobile: selected coin price */}
        {isMobile && currentCoin && (
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:"#e8f0f8",fontWeight:"bold"}}>{currentCoin.symbol?.toUpperCase()} {fmtPrice(currentCoin.current_price)}</div>
            <div style={{fontSize:10,color:currentCoin.price_change_percentage_24h>=0?"#00ff88":"#ff4466"}}>{fmtPct(currentCoin.price_change_percentage_24h)}</div>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isMobile&&globalData&&<div style={{fontSize:10,color:"#3a5a80",textAlign:"right"}}><div>MCAP: {fmtMcap(globalData.total_market_cap?.usd)}</div><div>BTC DOM: {globalData.market_cap_percentage?.btc?.toFixed(1)}%</div></div>}
          <div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88",animation:"pulse 2s infinite",flexShrink:0}}/>
        </div>
      </header>

      {/* DESKTOP NAV */}
      {!isMobile && (
        <nav style={S.desktopNav}>
          {NAV_ITEMS.map(t=><button key={t.id} style={S.desktopNavBtn(activeTab===t.id)} onClick={()=>setActiveTab(t.id)}>{t.label}</button>)}
          {lastUpdated&&<div style={{marginLeft:"auto",padding:"10px 0",fontSize:10,color:"#2a4060"}}>LIVE · {lastUpdated.toLocaleTimeString()}</div>}
        </nav>
      )}

      {/* MAIN CONTENT */}
      <main style={S.main} className="tab-content">

        {/* ═══ DASHBOARD ═══ */}
        {activeTab==="dashboard"&&(
          <div>
            {/* Stats row */}
            <div style={{...S.g3,marginBottom:isMobile?10:16}} className="mobile-grid3">
              <div style={S.card}>
                <div style={{...S.cTitle,marginBottom:6}}>Global MCap</div>
                <div style={{fontSize:isMobile?16:20,fontWeight:"bold",color:"#e8f0f8"}}>{globalData?fmtMcap(globalData.total_market_cap?.usd):"—"}</div>
                <div style={{fontSize:10,color:globalData?.market_cap_change_percentage_24h_usd>=0?"#00ff88":"#ff4466",marginTop:3}}>{globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}% 24h</div>
              </div>
              <div style={S.card}>
                <div style={{...S.cTitle,marginBottom:6}}>24h Vol</div>
                <div style={{fontSize:isMobile?16:20,fontWeight:"bold",color:"#e8f0f8"}}>{globalData?fmtMcap(globalData.total_volume?.usd):"—"}</div>
                <div style={{fontSize:10,color:"#3a5a80",marginTop:3}}>{globalData?.active_cryptocurrencies?.toLocaleString()} coins</div>
              </div>
              <div style={S.card}>
                <div style={{...S.cTitle,marginBottom:6}}>Sentiment</div>
                <div style={{fontSize:isMobile?13:17,fontWeight:"bold",color:fgColor(fearGreedVal)}}>{fearGreedVal?(fearGreedVal>75?"EXT. GREED":fearGreedVal>55?"GREED":fearGreedVal>45?"NEUTRAL":fearGreedVal>25?"FEAR":"EXT. FEAR"):"—"}</div>
                <div style={{fontSize:10,color:"#3a5a80",marginTop:3}}>BTC {globalData?.market_cap_percentage?.btc?.toFixed(1)}%</div>
              </div>
            </div>

            {/* Top 5 Bullish */}
            <div style={{...S.card,marginBottom:isMobile?10:16}}>
              <div style={S.cTitle}><span>🚀 TOP 5 BULLISH · 24H</span><span style={{fontSize:9,color:"#00ff88"}}>● LIVE</span></div>
              {marketData.length===0
                ? <div style={{color:"#3a5a80",textAlign:"center",padding:20,fontSize:12}}>Loading market data...</div>
                : <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:isMobile?8:12}} className="mobile-top5">
                    {top5.map((c,i)=>(
                      <div key={c.id} style={{background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.12)",borderRadius:10,padding:isMobile?10:12,cursor:"pointer"}} onClick={()=>{setSelectedCoin(c.id);setActiveTab("analysis");}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                          <img src={c.image} alt={c.symbol} style={{width:18,height:18,borderRadius:"50%"}}/>
                          <span style={{fontSize:10,fontWeight:"bold"}}>{c.symbol?.toUpperCase()}</span>
                        </div>
                        <div style={{fontSize:isMobile?11:13,color:"#e8f0f8",fontWeight:"bold"}}>{fmtPrice(c.current_price)}</div>
                        <div style={{fontSize:12,fontWeight:"bold",color:"#00ff88",marginTop:2}}>+{c.price_change_percentage_24h?.toFixed(2)}%</div>
                        <div style={{marginTop:5}}><Sparkline data={c.sparkline_in_7d?.price} positive={true}/></div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Market table */}
            <div style={S.card}>
              <div style={{...S.cTitle,marginBottom:8}}>
                <span>MARKET</span>
                <input style={{...S.input,width:isMobile?130:160,padding:"4px 10px",fontSize:11}} placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 70px 70px 70px",gap:8,padding:"4px 8px 8px",borderBottom:"1px solid #0a1628"}} className="mobile-mktcols">
                {["#","COIN","PRICE","1H","24H","7D"].map((h,i)=><div key={h} style={{fontSize:9,color:"#2a4060",letterSpacing:1}} className={i>3?"mobile-hide":""}>{h}</div>)}
              </div>
              {filteredCoins.slice(0,isMobile?15:20).map((c,i)=>(
                <div key={c.id} style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 70px 70px 70px",gap:8,padding:"9px 8px",borderRadius:6,background:i%2===0?"rgba(255,255,255,0.01)":"transparent",cursor:"pointer",alignItems:"center"}} className="mobile-mktcols" onClick={()=>{setSelectedCoin(c.id);setActiveTab("analysis");}}>
                  <div style={{color:"#3a5a80",fontSize:11}}>{c.market_cap_rank}</div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <img src={c.image} alt={c.symbol} style={{width:20,height:20,borderRadius:"50%",flexShrink:0}}/>
                    <div><div style={{fontSize:11,color:"#c8d8e8"}}>{c.symbol?.toUpperCase()}</div><div style={{fontSize:9,color:"#3a5a80"}}>{c.name}</div></div>
                  </div>
                  <div style={{fontWeight:"bold",color:"#e8f0f8",fontSize:11}}>{fmtPrice(c.current_price)}</div>
                  <div style={{color:(c.price_change_percentage_1h_in_currency||0)>=0?"#00ff88":"#ff4466",fontSize:10}} className="mobile-hide">{fmtPct(c.price_change_percentage_1h_in_currency)}</div>
                  <div style={{color:(c.price_change_percentage_24h||0)>=0?"#00ff88":"#ff4466",fontSize:10}}>{fmtPct(c.price_change_percentage_24h)}</div>
                  <div style={{color:(c.price_change_percentage_7d_in_currency||0)>=0?"#00ff88":"#ff4466",fontSize:10}} className="mobile-hide">{fmtPct(c.price_change_percentage_7d_in_currency)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ANALYSIS ═══ */}
        {activeTab==="analysis"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:isMobile?10:14,flexWrap:"wrap"}}>
              {COINS.map(c=><button key={c.id} style={S.btnO(selectedCoin===c.id,"#00ff88")} className="coin-btn" onClick={()=>setSelectedCoin(c.id)}>{c.symbol}</button>)}
            </div>
            {currentCoin&&<>
              <div style={{...S.card,marginBottom:isMobile?10:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <img src={currentCoin.image} alt={currentCoin.symbol} style={{width:40,height:40,borderRadius:"50%"}}/>
                    <div>
                      <div style={{fontSize:isMobile?15:18,color:"#e8f0f8",fontWeight:"bold"}}>{currentCoin.name}</div>
                      <div style={{fontSize:10,color:"#3a5a80"}}>#{currentCoin.market_cap_rank} · {currentCoin.symbol?.toUpperCase()}/USD</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:isMobile?20:26,fontWeight:"bold",color:"#e8f0f8"}}>{fmtPrice(currentCoin.current_price)}</div>
                    <div style={{display:"flex",gap:4,justifyContent:"flex-end",marginTop:4,flexWrap:"wrap"}}>
                      <span style={S.badge(currentCoin.price_change_percentage_1h_in_currency>=0)}>1H {fmtPct(currentCoin.price_change_percentage_1h_in_currency)}</span>
                      <span style={S.badge(currentCoin.price_change_percentage_24h>=0)}>24H {fmtPct(currentCoin.price_change_percentage_24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{...S.card,marginBottom:isMobile?10:14}}>
                <div style={{...S.cTitle,marginBottom:8}}>
                  <span>PRICE CHART</span>
                  <div style={{display:"flex",gap:4}}>
                    {[[1,"1D"],[7,"7D"],[30,"30D"],[90,"90D"],[365,"1Y"]].map(([d,l])=><button key={d} style={{...S.btnO(chartDays===d,"#00ff88"),padding:"3px 8px"}} onClick={()=>setChartDays(d)}>{l}</button>)}
                  </div>
                </div>
                <PriceChart data={chartData}/>
              </div>
              <div style={{...S.g2,marginBottom:isMobile?10:14}} className="mobile-grid2">
                <div style={S.card}>
                  <div style={S.cTitle}>MARKET STATS</div>
                  {[["Market Cap",fmtMcap(currentCoin.market_cap)],["24h Volume",fmtMcap(currentCoin.total_volume)],["ATH",fmtPrice(coinDetail?.market_data?.ath?.usd)],["ATH Change",`${coinDetail?.market_data?.ath_change_percentage?.usd?.toFixed(2)}%`],["Supply",currentCoin.circulating_supply?.toLocaleString()],["Max",currentCoin.max_supply?currentCoin.max_supply.toLocaleString():"∞"]].map(([l,v])=><div key={l} style={S.sRow}><span style={S.sLabel}>{l}</span><span style={{color:"#c8d8e8",fontWeight:"bold",fontSize:11}}>{v}</span></div>)}
                </div>
                <div style={S.card}>
                  <div style={S.cTitle}>PRICE RANGE</div>
                  {[["24h Low",fmtPrice(currentCoin.low_24h)],["24h High",fmtPrice(currentCoin.high_24h)],["7d Change",fmtPct(currentCoin.price_change_percentage_7d_in_currency)],["Vol/MCap",currentCoin.market_cap?(currentCoin.total_volume/currentCoin.market_cap*100).toFixed(2)+"%":"—"],["FDV",fmtMcap(coinDetail?.market_data?.fully_diluted_valuation?.usd)],["Rank","#"+currentCoin.market_cap_rank]].map(([l,v])=><div key={l} style={S.sRow}><span style={S.sLabel}>{l}</span><span style={{color:"#c8d8e8",fontWeight:"bold",fontSize:11}}>{v}</span></div>)}
                </div>
              </div>
            </>}
          </div>
        )}

        {/* ═══ MARKETS ═══ */}
        {activeTab==="markets"&&(
          <div style={S.card}>
            <div style={{...S.cTitle,marginBottom:8}}>
              <span>TOP 50 COINS</span>
              <input style={{...S.input,width:150,padding:"4px 10px",fontSize:11}} placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr 100px 68px 68px 78px 78px",gap:6,padding:"4px 8px 8px",borderBottom:"1px solid #0a1628"}} className="mobile-mktcols">
              {["#","COIN","PRICE","1H","24H","7D","MCAP"].map((h,i)=><div key={h} style={{fontSize:9,color:"#2a4060",letterSpacing:1}} className={i>3?"mobile-hide":""}>{h}</div>)}
            </div>
            {filteredCoins.map((c,i)=>(
              <div key={c.id} style={{display:"grid",gridTemplateColumns:"36px 1fr 100px 68px 68px 78px 78px",gap:6,padding:"9px 8px",borderRadius:6,background:i%2===0?"rgba(255,255,255,0.01)":"transparent",cursor:"pointer",alignItems:"center"}} className="mobile-mktcols" onClick={()=>{setSelectedCoin(c.id);setActiveTab("analysis");}}>
                <div style={{color:"#3a5a80",fontSize:10}}>{c.market_cap_rank}</div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <img src={c.image} alt={c.symbol} style={{width:18,height:18,borderRadius:"50%",flexShrink:0}}/>
                  <div><div style={{fontSize:11,color:"#c8d8e8"}}>{c.symbol?.toUpperCase()}</div><div style={{fontSize:9,color:"#3a5a80"}}>{c.name}</div></div>
                </div>
                <div style={{fontWeight:"bold",color:"#e8f0f8",fontSize:11}}>{fmtPrice(c.current_price)}</div>
                <div style={{color:(c.price_change_percentage_1h_in_currency||0)>=0?"#00ff88":"#ff4466",fontSize:10}} className="mobile-hide">{fmtPct(c.price_change_percentage_1h_in_currency)}</div>
                <div style={{color:(c.price_change_percentage_24h||0)>=0?"#00ff88":"#ff4466",fontSize:10}}>{fmtPct(c.price_change_percentage_24h)}</div>
                <div style={{color:(c.price_change_percentage_7d_in_currency||0)>=0?"#00ff88":"#ff4466",fontSize:10}} className="mobile-hide">{fmtPct(c.price_change_percentage_7d_in_currency)}</div>
                <div style={{color:"#8aa8c8",fontSize:10}} className="mobile-hide">{fmtMcap(c.market_cap)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ SIGNALS ═══ */}
        {activeTab==="signals"&&(
          <div>
            <div style={{...S.card,marginBottom:isMobile?10:14}}>
              <div style={S.cTitle}>⚡ AI SIGNAL GENERATOR</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {COINS.slice(0,8).map(c=><button key={c.id} style={S.btnO(selectedCoin===c.id,"#00aaff")} className="coin-btn" onClick={()=>setSelectedCoin(c.id)}>{c.symbol}</button>)}
              </div>
              {currentCoin&&<div style={{...S.sRow,marginBottom:12}}><span style={S.sLabel}>{currentCoin.symbol?.toUpperCase()} PRICE</span><span style={{color:"#00aaff",fontWeight:"bold"}}>{fmtPrice(currentCoin.current_price)}</span></div>}
              <button style={{...S.btn,opacity:aiLoading?0.6:1}} className="action-btn" onClick={getAISignal} disabled={aiLoading}>
                {aiLoading?"⚙  ANALYZING MARKET DATA...":"⚡  GENERATE AI SIGNAL"}
              </button>
              {aiLoading&&<div style={{textAlign:"center",marginTop:12,color:"#3a5a80",fontSize:11,animation:"pulse 1.5s infinite"}}>Processing price action, volume & momentum...</div>}
            </div>

            {aiSignal&&!aiSignal.error&&<>
              <div style={{...S.card,marginBottom:isMobile?10:14}}>
                <div style={{textAlign:"center",padding:isMobile?"14px 16px":"16px 24px",borderRadius:12,background:`${signalColor(aiSignal.signal)}11`,border:`2px solid ${signalColor(aiSignal.signal)}44`,marginBottom:12}}>
                  <div style={{fontSize:isMobile?20:26,fontWeight:"bold",color:signalColor(aiSignal.signal),letterSpacing:2}}>{aiSignal.signal}</div>
                  <div style={{fontSize:11,color:"#5a7090",marginTop:4}}>{aiSignal.trend} · CONFIDENCE {aiSignal.confidence}%</div>
                  <div style={{marginTop:8}}><div style={{background:"#0a1628",borderRadius:4,overflow:"hidden",height:4}}><div style={{height:"100%",width:`${aiSignal.confidence}%`,background:signalColor(aiSignal.signal),borderRadius:4,transition:"width 1s"}}/></div></div>
                </div>
                <div style={{fontSize:11,color:"#8aa8c8",lineHeight:1.6,marginBottom:8}}>{aiSignal.summary}</div>
                <div style={S.sRow}><span style={S.sLabel}>Risk Level</span><span style={{color:aiSignal.riskLevel==="LOW"?"#00ff88":aiSignal.riskLevel==="HIGH"||aiSignal.riskLevel==="EXTREME"?"#ff4466":"#f59e0b",fontWeight:"bold"}}>{aiSignal.riskLevel}</span></div>
                <div style={{marginTop:10,background:"rgba(0,255,136,0.05)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:8,padding:10}}>
                  <div style={{fontSize:9,color:"#3a5a80",letterSpacing:1,marginBottom:4}}>KEY INSIGHT</div>
                  <div style={{fontSize:11,color:"#a8c8d8",lineHeight:1.5}}>{aiSignal.keyInsight}</div>
                </div>
              </div>

              {/* Price targets */}
              <div style={{...S.card,marginBottom:isMobile?10:14}}>
                <div style={S.cTitle}>PRICE TARGETS</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[["1H","1h"],["24H","24h"],["7D","7d"],["30D","30d"]].map(([label,key])=>(
                    <div key={key} style={{background:"rgba(255,255,255,0.02)",border:"1px solid #0f2540",borderRadius:8,padding:isMobile?8:10,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#3a5a80",letterSpacing:1,marginBottom:6}}>{label}</div>
                      <div style={{fontSize:10,color:"#00ff88",marginBottom:3}}>▲ {fmtPrice(aiSignal.priceTargets?.[key]?.high)}</div>
                      <div style={{fontSize:11,color:"#c8d8e8",fontWeight:"bold",marginBottom:3}}>→ {fmtPrice(aiSignal.priceTargets?.[key]?.mid)}</div>
                      <div style={{fontSize:10,color:"#ff4466"}}>▼ {fmtPrice(aiSignal.priceTargets?.[key]?.low)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade setup */}
              <div style={{...S.g2,marginBottom:isMobile?10:14}} className="mobile-grid2">
                <div style={S.card}>
                  <div style={S.cTitle}>TRADE SETUP</div>
                  {[["Entry Zone",`${fmtPrice(aiSignal.entryZone?.from)} – ${fmtPrice(aiSignal.entryZone?.to)}`,"#c8d8e8"],["Stop Loss",fmtPrice(aiSignal.stopLoss),"#ff4466"],["Take Profit",fmtPrice(aiSignal.takeProfit),"#00ff88"],["Support",fmtPrice(aiSignal.supportLevel),"#c8d8e8"],["Resistance",fmtPrice(aiSignal.resistanceLevel),"#c8d8e8"]].map(([l,v,col])=><div key={l} style={S.sRow}><span style={S.sLabel}>{l}</span><span style={{color:col,fontWeight:"bold",fontSize:11}}>{v}</span></div>)}
                </div>
                <div style={S.card}>
                  <div style={S.cTitle}>INDICATORS</div>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:10,color:"#3a5a80",marginBottom:4}}>RSI</div><RSIGauge value={aiSignal.rsi}/><div style={{fontSize:9,color:"#5a7090",marginTop:2}}>{aiSignal.rsi<30?"OVERSOLD":aiSignal.rsi>70?"OVERBOUGHT":"NEUTRAL"}</div></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["MACD",aiSignal.technicalIndicators?.macd],["BB",aiSignal.technicalIndicators?.bollingerBands],["VOLUME",aiSignal.technicalIndicators?.volumeTrend],["MOMENTUM",aiSignal.technicalIndicators?.momentum]].map(([label,val])=>{
                      const bull=["BULLISH","INCREASING","STRONG","UPPER"].includes(val);
                      const bear=["BEARISH","DECREASING","LOWER"].includes(val);
                      return <div key={label} style={{background:bull?"rgba(0,255,136,0.08)":bear?"rgba(255,68,102,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${bull?"rgba(0,255,136,0.2)":bear?"rgba(255,68,102,0.2)":"rgba(245,158,11,0.2)"}`,borderRadius:6,padding:"6px 8px",textAlign:"center",color:bull?"#00ff88":bear?"#ff4466":"#f59e0b",fontSize:9,letterSpacing:1}}><div style={{marginBottom:2}}>{label}</div><div style={{fontWeight:"bold"}}>{val}</div></div>;
                    })}
                  </div>
                  <div style={{marginTop:10,fontSize:10,color:"#5a7090",lineHeight:1.6}}>{aiSignal.reasoning}</div>
                </div>
              </div>
            </>}
            {aiSignal?.error&&<div style={{...S.card,color:"#ff4466",textAlign:"center"}}>{aiSignal.error}</div>}
            {!aiSignal&&!aiLoading&&<div style={{...S.card,textAlign:"center",padding:32,color:"#2a4060",fontSize:12}}>Select a coin above and tap GENERATE AI SIGNAL</div>}
          </div>
        )}

        {/* ═══ ALERTS ═══ */}
        {activeTab==="alerts"&&(
          <div>
            {triggeredAlerts.length>0&&<div style={{marginBottom:10}}>
              {triggeredAlerts.map((a,i)=>(
                <div key={i} style={{...S.card,borderColor:"#ff880044",background:"rgba(255,136,0,0.05)",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><span style={{color:"#f59e0b",fontWeight:"bold"}}>🔔 </span><span>{a.coin} went {a.direction} ${a.price}</span></div>
                  <span style={{color:"#00ff88",fontSize:11}}>{fmtPrice(a.currentPrice)}</span>
                </div>
              ))}
            </div>}
            <div style={{...S.g2}} className="mobile-grid2">
              <div style={S.card}>
                <div style={S.cTitle}>SET ALERT</div>
                <div style={{marginBottom:10}}><div style={{fontSize:10,color:"#3a5a80",marginBottom:6}}>COIN</div><select style={S.select} value={alertInput.coin} onChange={e=>setAlertInput(p=>({...p,coin:e.target.value}))}>{COINS.map(c=><option key={c.id} value={c.symbol}>{c.symbol} — {c.name}</option>)}</select></div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#3a5a80",marginBottom:6}}>DIRECTION</div>
                  <div style={{display:"flex",gap:8}}>
                    {["above","below"].map(d=><button key={d} style={{...S.btnO(alertInput.direction===d,d==="above"?"#00ff88":"#ff4466"),flex:1,padding:"10px 8px",textAlign:"center"}} onClick={()=>setAlertInput(p=>({...p,direction:d}))}>{d==="above"?"▲ ABOVE":"▼ BELOW"}</button>)}
                  </div>
                </div>
                <div style={{marginBottom:14}}><div style={{fontSize:10,color:"#3a5a80",marginBottom:6}}>TARGET PRICE (USD)</div><input style={S.input} type="number" inputMode="decimal" placeholder="e.g. 50000" value={alertInput.price} onChange={e=>setAlertInput(p=>({...p,price:e.target.value}))}/></div>
                <button style={S.btn} className="action-btn" onClick={addAlert}>+ SET ALERT</button>
              </div>
              <div style={S.card}>
                <div style={S.cTitle}><span>ACTIVE ({alerts.length})</span>{alerts.length>0&&<button style={{...S.btnO(false),color:"#ff4466",fontSize:10}} onClick={()=>setAlerts([])}>CLEAR</button>}</div>
                {alerts.length===0?<div style={{textAlign:"center",padding:24,color:"#2a4060",fontSize:12}}>No alerts set.</div>:alerts.map(a=>{
                  const coin=marketData.find(c=>c.symbol.toUpperCase()===a.coin.toUpperCase());
                  return <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 10px",background:"rgba(255,255,255,0.02)",border:"1px solid #0f2540",borderRadius:8,marginBottom:8}}>
                    <div><div style={{fontWeight:"bold",color:"#c8d8e8"}}>{a.coin}</div><div style={{fontSize:10,color:"#3a5a80"}}>{a.direction} <span style={{color:a.direction==="above"?"#00ff88":"#ff4466"}}>${a.price.toLocaleString()}</span></div></div>
                    <div style={{textAlign:"right"}}>{coin&&<div style={{fontSize:10,color:"#8aa8c8",marginBottom:4}}>{fmtPrice(coin.current_price)}</div>}<button style={{...S.btnO(false),padding:"4px 10px",fontSize:9,color:"#ff4466"}} onClick={()=>setAlerts(prev=>prev.filter(x=>x.id!==a.id))}>✕</button></div>
                  </div>;
                })}
                {/* Quick prices */}
                <div style={{marginTop:14}}>
                  <div style={{fontSize:9,color:"#2a4060",letterSpacing:2,marginBottom:8}}>QUICK PRICES</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                    {marketData.slice(0,6).map(c=><div key={c.id} style={{textAlign:"center",padding:8,background:"rgba(255,255,255,0.01)",borderRadius:8}}>
                      <img src={c.image} alt={c.symbol} style={{width:18,height:18,borderRadius:"50%",marginBottom:3}}/>
                      <div style={{fontSize:9,color:"#5a7090"}}>{c.symbol?.toUpperCase()}</div>
                      <div style={{fontSize:10,color:"#c8d8e8",fontWeight:"bold"}}>{fmtPrice(c.current_price)}</div>
                      <div style={{fontSize:9,color:c.price_change_percentage_24h>=0?"#00ff88":"#ff4466"}}>{fmtPct(c.price_change_percentage_24h)}</div>
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&(
        <nav style={S.mobileNav}>
          {NAV_ITEMS.map(t=>(
            <button key={t.id} style={S.mobileNavBtn(activeTab===t.id)} className="nav-btn" onClick={()=>setActiveTab(t.id)}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {!isMobile&&<div style={{textAlign:"center",padding:"12px 20px",fontSize:9,color:"#1a3050",borderTop:"1px solid #0a1628",marginTop:20}}>⚠ CRYPTEX AI is for informational purposes only. AI signals are analytical estimates, not financial advice. Always do your own research.</div>}
    </div>
  );
}
