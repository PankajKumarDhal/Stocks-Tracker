const apiKey = "cs9mgb1r01qoa9gc5790cs9mgb1r01qoa9gc579g";
const stockSearch = document.getElementById("stockSearch");
const searchButton = document.getElementById("searchButton");
const stockDetails = document.getElementById("stockDetails");
const stockTable = document.getElementById("stockTable").getElementsByTagName("tbody")[0];
const ctx = document.getElementById("stockChart").getContext("2d");
let stockChart;

const stockDropdown = document.getElementById("stockDropdown");
const loadStockButton = document.getElementById("loadStockButton");

async function getStockData(stockSymbol) {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`);
    const data = await response.json();
    
    if (!data || data.error) {
      console.error("Error fetching stock data:", data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

function generateSimulatedHistoricalData(currentPrice) {
  const dates = [];
  const prices = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toLocaleDateString());
    
    // Generate a random price fluctuation between -5% and 5%
    const fluctuation = (Math.random() - 0.5) * 0.1;
    const price = currentPrice * (1 + fluctuation);
    prices.push(price.toFixed(2));
  }
  
  return { dates, prices };
}

async function getTrendingStocks() {
  return [
    "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA",
    "META", "NFLX", "NVDA", "BABA", "INTC"
  ];
}

async function populateDropdown() {
  const trendingStocks = await getTrendingStocks();
  trendingStocks.forEach((stock) => {
    const option = document.createElement("option");
    option.value = stock;
    option.text = stock;
    stockDropdown.appendChild(option);
  });
}

function displayStockDetails(stockData, symbol) {
  const price = stockData.c.toFixed(2);
  const change = stockData.d.toFixed(2);
  const percentChange = stockData.dp.toFixed(2);
  const highPrice = stockData.h.toFixed(2);
  const lowPrice = stockData.l.toFixed(2);
  const openPrice = stockData.o.toFixed(2);
  const prevClosePrice = stockData.pc.toFixed(2);
  const volume = stockData.v ? stockData.v.toLocaleString() : "N/A"; // Handle cases where volume might be missing

  stockDetails.innerHTML = `
    <h3>${symbol}</h3>
    <p>Current Price: $${price}</p>
    <p>Change: $${change} (${percentChange}%)</p>
    <p>High: $${highPrice}</p>
    <p>Low: $${lowPrice}</p>
    <p>Open: $${openPrice}</p>
    <p>Previous Close: $${prevClosePrice}</p>
    <p>Volume: ${volume}</p>
  `;

  updateStockTable(symbol, price, change, percentChange, volume);
}

function updateStockTable(symbol, price, change, percentChange, volume) {
  const existingRow = Array.from(stockTable.rows).find(row => row.cells[0].textContent === symbol);

  if (existingRow) {
    existingRow.cells[1].textContent = `$${price}`;
    existingRow.cells[2].textContent = `$${change} (${percentChange}%)`;
    existingRow.cells[3].textContent = volume;
  } else {
    const newRow = stockTable.insertRow();
    newRow.innerHTML = `
      <td>${symbol}</td>
      <td>$${price}</td>
      <td>$${change} (${percentChange}%)</td>
      <td>${volume}</td>
    `;
  }
}

function displayStockGraph(historicalData, symbol) {
  if (stockChart) {
    stockChart.destroy();
  }

  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicalData.dates,
      datasets: [{
        label: `${symbol} Stock Price (Simulated)`,
        data: historicalData.prices,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price (USD)'
          }
        }
      }
    }
  });
}

async function loadStockData(stockSymbol) {
  const stockData = await getStockData(stockSymbol);

  if (stockData) {
    displayStockDetails(stockData, stockSymbol);
    const simulatedHistoricalData = generateSimulatedHistoricalData(stockData.c);
    displayStockGraph(simulatedHistoricalData, stockSymbol);
  } else {
    stockDetails.innerHTML = `<p>Stock data not available for ${stockSymbol}.</p>`;
    if (stockChart) {
      stockChart.destroy();
      stockChart = null;
    }
  }
}

searchButton.addEventListener("click", () => {
  const stockSymbol = stockSearch.value.toUpperCase();
  loadStockData(stockSymbol);
});

loadStockButton.addEventListener("click", () => {
  const selectedStock = stockDropdown.value;
  loadStockData(selectedStock);
});

populateDropdown();