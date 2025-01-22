import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

// Register Chart.js components and plugins
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
);

const App = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/companies")
            .then((response) => response.json())
            .then((data) => setCompanies(data));
    }, []);

    const handleFetchTransactions = () => {
        if (selectedCompany) {
            setPredictions([]);
            fetch(`http://localhost:8080/api/transactions/${selectedCompany}`)
                .then((response) => response.json())
                .then((data) => {
                    const sortedTransactions = data.sort(
                        (a, b) => new Date(a.date) - new Date(b.date)
                    );
                    const filtered = fromDate && toDate
                        ? sortedTransactions.filter((transaction) => {
                            const transactionDate = new Date(transaction.date);
                            return (
                                transactionDate >= new Date(fromDate) &&
                                transactionDate <= new Date(toDate)
                            );
                        })
                        : sortedTransactions;
                    setFilteredTransactions(filtered);
                    setTransactions(sortedTransactions);
                    fetch(`http://localhost:8080/api/predict/${selectedCompany}`)
                        .then((response) => response.json())
                        .then((data) => setPredictions(data))
                        .catch((error) =>
                            console.error("Error fetching predictions:", error)
                        );
                });
        } else {
            alert("Please select a company.");
        }
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setFilteredTransactions(transactions);
        setPredictions([]);
    };

    const formatDate = (dateInput) => {
        const d = new Date(dateInput);
        return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${d.getFullYear()}`;
    };

    const transactionLabels = filteredTransactions.map((transaction) =>
        formatDate(transaction.date)
    );

    let predictedLabels = [];
    if (filteredTransactions.length > 0 && predictions.length > 0) {
        const lastDate = new Date(
            filteredTransactions[filteredTransactions.length - 1].date
        );
        predictedLabels = predictions.map((_, index) => {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + index + 1);
            return formatDate(d);
        });
    }
    const labels = [...transactionLabels, ...predictedLabels];

    const padData = (dataArray) => [
        ...dataArray,
        ...new Array(predictedLabels.length).fill(null),
    ];

    let predColor = "red";
    if (predictions.length > 0 && filteredTransactions.length > 0) {
        const lastPrice = parseFloat(
            filteredTransactions[filteredTransactions.length - 1].lastPrice
        );
        const firstPrediction = parseFloat(predictions[0]);
        if (firstPrediction > lastPrice) {
            predColor = "green";
        }
    }

    const chartData = {
        labels,
        datasets: [
            {
                label: "Transaction Price",
                data: padData(
                    filteredTransactions.map((transaction) =>
                        parseFloat(transaction.sma10)
                    )
                ),
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: "rgba(75,192,192,1)",
                fill: false,
            },
            {
                label: "Predicted Price",
                data: [
                    ...new Array(filteredTransactions.length).fill(null),
                    ...predictions.map((p) => parseFloat(p)),
                ],
                borderColor: predColor,
                backgroundColor: predColor,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: predColor,
                fill: false,
            },
        ].filter(Boolean),
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Transactions for ${selectedCompany}`,
                color: "white",
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: "x",
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: "x",
                },
            },
        },
        elements: {
            line: {
                tension: 0.2,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(255,255,255,0.1)",
                },
                ticks: {
                    color: "white",
                },
            },
            y: {
                grid: {
                    color: "rgba(255,255,255,0.1)",
                },
                ticks: {
                    color: "white",
                },
            },
        },
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#282c34" }}>
            <div style={{ width: "60%", backgroundColor: "#20232a", padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h1 style={{ color: "#61dafb", marginBottom: "20px" }}>Stock Transactions</h1>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <select
                        name="companies"
                        id="companies"
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        style={{
                            flex: 1,
                            marginRight: "10px",
                            padding: "10px",
                            fontSize: "16px",
                        }}
                    >
                        <option value="">Select a Company</option>
                        {companies.map((company, index) => (
                            <option key={index} value={company}>
                                {company}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={{ marginRight: "10px", padding: "10px", fontSize: "16px" }}
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={{ padding: "10px", fontSize: "16px" }}
                    />
                </div>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <button
                        onClick={handleFetchTransactions}
                        style={{
                            flex: 1,
                            marginRight: "10px",
                            backgroundColor: "#61dafb",
                            color: "#20232a",
                            padding: "10px",
                            fontSize: "16px",
                            border: "none",
                            cursor: "pointer",
                        }}
                        disabled={!selectedCompany}
                    >
                        View Transactions
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            backgroundColor: "#6a737d",
                            color: "white",
                            padding: "10px",
                            fontSize: "16px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Reset
                    </button>
                </div>
                {labels.length > 0 ? (
                    <Line data={chartData} options={chartOptions} style={{ width: "100%" }} />
                ) : (
                    <p style={{ color: "white" }}>No data available.</p>
                )}
            </div>
        </div>
    );
};

export default App;
