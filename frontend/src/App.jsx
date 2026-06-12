import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [livePrices, setLivePrices] = useState({ btc: 'Loading...', eth: 'Loading...' });
  const [marketData, setMarketData] = useState([]);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  
  // Sets default view to Top 10 Table
  const [showTop10Only, setShowTop10Only] = useState(true);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeGraphCoin, setActiveGraphCoin] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);

  // Calculator Form now uses a specific coin selection
  const [formData, setFormData] = useState({ initialInvestment: 1000, durationYears: 5, selectedCoinId: 'bitcoin' });
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s === 'BTCUSDT') setLivePrices(prev => ({ ...prev, btc: parseFloat(data.c).toFixed(2) }));
      else if (data.s === 'ETHUSDT') setLivePrices(prev => ({ ...prev, eth: parseFloat(data.c).toFixed(2) }));
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const coinRes = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        const coinData = await coinRes.json();
        setMarketData(coinData);
        setIsMarketLoading(false);

        // Fallback News Array in case Ad-Blockers block the API
        const fallbackNews = [
          { id: 1, url: "#", imageurl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500", source_info: { name: "Market Update" }, title: "Global Crypto Adoption Reaches All-Time High" },
          { id: 2, url: "#", imageurl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500", source_info: { name: "Tech Daily" }, title: "Ethereum Network Upgrade Successfully Deployed" },
          { id: 3, url: "#", imageurl: "https://images.unsplash.com/photo-1622630998477-20b41cd0e025?w=500", source_info: { name: "Finance Weekly" }, title: "Bitcoin ETFs See Record Inflows This Quarter" },
          { id: 4, url: "#", imageurl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500", source_info: { name: "Web3 News" }, title: "Solana Ecosystem Expands with New DeFi Partnerships" }
        ];

        try {
          const newsRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
          const newsJson = await newsRes.json();
          if(newsJson && newsJson.Data && newsJson.Data.length > 0) {
            setNewsList(newsJson.Data.slice(0, 4));
          } else { setNewsList(fallbackNews); }
        } catch (e) { setNewsList(fallbackNews); } // Triggers if blocked

      } catch (error) {
        console.error("Error fetching data:", error);
        setIsMarketLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!activeGraphCoin) return;
    const fetchGraphData = async () => {
      setIsGraphLoading(true);
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${activeGraphCoin.id}/market_chart?vs_currency=usd&days=7`);
        const data = await res.json();
        const formattedData = data.prices.map(item => ({ date: new Date(item[0]).toLocaleDateString(), price: item[1] }));
        setGraphData(formattedData);
        setIsGraphLoading(false);
      } catch (error) { setIsGraphLoading(false); }
    };
    fetchGraphData();
  }, [activeGraphCoin]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // 1. Find the exact coin the user selected
    const targetCoin = marketData.find(c => c.id === formData.selectedCoinId) || marketData[0];
    
    // 2. Extrapolate an annual return based on its live 24-hour performance
    let rawAnnualRate = targetCoin ? (targetCoin.price_change_percentage_24h * 5) / 100 : 0.10; 
    
    // 3. Cap the rate so the math doesn't spiral into infinity if a coin pumped 500% today
    const cappedRate = Math.min(Math.max(rawAnnualRate, -0.80), 3.00); 

    try {
      const response = await fetch('https://crypto-dashboard-backend-da0u.onrender.com/api/analytics/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: parseFloat(formData.initialInvestment),
          durationYears: parseInt(formData.durationYears),
          annualGrowthRate: cappedRate // Send the dynamic rate to Java!
        })
      });
      if (response.ok) setCalculationResult(await response.json());
    } catch (error) {
      console.error("Error with Java Backend:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title-row">
          <h1>Predictive Investment Engine</h1>
          <button className="info-btn" onClick={() => setShowInfoModal(true)}>ℹ️</button>
        </div>
      </header>

      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>What is Cryptocurrency?</h2>
            <p>Cryptocurrency is a digital or virtual currency secured by cryptography, which makes it nearly impossible to counterfeit. Most cryptocurrencies exist on decentralized networks using blockchain technology.</p>
            <p><strong>Key terms:</strong></p>
            <ul>
              <li><strong>Market Cap:</strong> The total value of all coins currently in existence.</li>
              <li><strong>24h Change:</strong> The percentage the price has moved in the last day.</li>
            </ul>
            <a href="https://en.wikipedia.org/wiki/Cryptocurrency" target="_blank" rel="noreferrer" className="wiki-link">Read more on Wikipedia</a>
            <button className="close-btn" onClick={() => setShowInfoModal(false)}>Close</button>
          </div>
        </div>
      )}

      {activeGraphCoin && (
        <div className="modal-overlay" onClick={() => setActiveGraphCoin(null)}>
          <div className="modal-content graph-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{activeGraphCoin.name} - 7 Day Trend</h2>
            {isGraphLoading ? <p>Loading chart data...</p> : (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={graphData}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937' }} itemStyle={{ color: '#10b981' }}/>
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <button className="close-btn" onClick={() => setActiveGraphCoin(null)}>Close Graph</button>
          </div>
        </div>
      )}

      <section className="stream-section">
        <div className="card ticker-card">
          <h3>BITCOIN / USD (Live)</h3>
          <p className="price-stream">${livePrices.btc}</p>
        </div>
        <div className="card ticker-card">
          <h3>ETHEREUM / USD (Live)</h3>
          <p className="price-stream">${livePrices.eth}</p>
        </div>
      </section>

      <section className="market-section card">
        <div className="market-header-row">
          <h2>Global Market Overview</h2>
          <button className="toggle-btn" onClick={() => setShowTop10Only(!showTop10Only)}>
            {showTop10Only ? "Explore All 100 Coins (Slide View)" : "Show Top 10 Table"}
          </button>
        </div>

        {isMarketLoading ? (
          <p>Loading market data...</p>
        ) : showTop10Only ? (
          <div className="table-container">
            <table className="crypto-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Price (USD)</th>
                  <th>24h Change</th>
                  <th>Market Cap</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {marketData.slice(0, 10).map((coin) => (
                  <tr key={coin.id}>
                    <td className="coin-name">
                      <img src={coin.image} alt={coin.name} className="coin-icon" />
                      {coin.name} <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                    </td>
                    <td>${coin.current_price.toLocaleString()}</td>
                    <td className={coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td>${coin.market_cap.toLocaleString()}</td>
                    <td><button className="graph-btn" onClick={() => setActiveGraphCoin({ id: coin.id, name: coin.name })}>📈 Graph</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="horizontal-slider">
            {marketData.map((coin) => (
               <div className="coin-card" key={coin.id}>
                  <div className="coin-card-header">
                     <img src={coin.image} alt={coin.name} className="coin-icon" />
                     <h4>{coin.name} <span>{coin.symbol.toUpperCase()}</span></h4>
                  </div>
                  <div className="coin-card-body">
                     <p className="coin-price">${coin.current_price.toLocaleString()}</p>
                     <p className={coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}>
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                     </p>
                  </div>
                  <button className="graph-btn" onClick={() => setActiveGraphCoin({ id: coin.id, name: coin.name })}>📈 View Graph</button>
               </div>
            ))}
          </div>
        )}
      </section>

      <section className="processor-section">
        <div className="card form-card">
          <h2>Coin-Specific Trajectory Tool</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Select Asset to Simulate</label>
              <select name="selectedCoinId" value={formData.selectedCoinId} onChange={handleInputChange}>
                {marketData.slice(0, 50).map(coin => (
                  <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol.toUpperCase()})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Initial Investment Principal ($)</label>
              <input type="number" name="initialInvestment" value={formData.initialInvestment} onChange={handleInputChange} min="1" />
            </div>
            <div className="form-group">
              <label>Simulation Timeframe (Years)</label>
              <input type="number" name="durationYears" value={formData.durationYears} onChange={handleInputChange} min="1" max="50" />
            </div>
            <button type="submit" className="submit-btn">Calculate</button>
          </form>
        </div>

        {calculationResult && (
          <div className="card result-card">
            <h2>Calculations Output</h2>
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="label">Future Value</span>
                <span className="value">${calculationResult.finalProjectedValue}</span>
              </div>
              <div className="metric-box">
                <span className="label">Net Gain/Loss</span>
                <span className={`value ${calculationResult.netProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                  ${calculationResult.netProfitLoss}
                </span>
              </div>
            </div>
            <div className="projection-trajectory">
              <h3>Yearly Compound History</h3>
              <ul>
                {calculationResult.annualProjections.map((amt, idx) => (
                  <li key={idx}>Year {idx}: <strong>${amt}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="news-section">
        <h2>Latest Industry News</h2>
        <div className="news-grid">
          {newsList.map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="news-card card">
              <img src={article.imageurl} alt="News thumbnail" className="news-image" />
              <div className="news-content">
                <span className="news-source">{article.source_info.name}</span>
                <h4>{article.title}</h4>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;