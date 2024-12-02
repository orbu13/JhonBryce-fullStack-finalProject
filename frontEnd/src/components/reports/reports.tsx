import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { saveAs } from "file-saver"; 
import { useAuth } from "../../context/authProvider";
import "./reports.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false, 
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Vacation Followers Report",
    },
  },
};

interface Vacation {
  _id: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  image?: string;
  followers: string[];
}

function VacationReports() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [vacationStats, setVacationStats] = useState<Vacation[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate()


  useEffect(() => {
    if (isAdmin) {
      fetch("http://localhost:5500/admin/reports", {
        headers: {
          loggedIn: isAuthenticated.toString(),
          role: isAdmin ? "admin" : "",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch vacation reports");
          }
          return res.json();
        })
        .then((data) => {
          setVacationStats(data);
        })
        .catch((err) => {
          setError(err.message || "An error occurred while fetching reports");
        })
       
    }
  }, [isAdmin, isAuthenticated]);


const generateCSV = () => {
  if (vacationStats.length === 0) {
    setError("No data available to export.")
    return;
  }

  const formatAsExcelText = (value: any) => {
    return `="${String(value)}     "`; 
  };

  const headers = [
    "Destination     ",
    "Followers     ",
    "Start Date     ",
    "End Date     ",
  ];

  const csvRows = vacationStats.map((vacation) => [
    formatAsExcelText(vacation.destination), 
    vacation.followers.length, 
    formatAsExcelText(new Date(vacation.startDate).toLocaleDateString("en-US")), 
    formatAsExcelText(new Date(vacation.endDate).toLocaleDateString("en-US")), 
  ]);

  const csvContent =
    [headers.join(",")] 
      .concat(csvRows.map((row) => row.join(",")))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  saveAs(blob, "vacation_reports.csv");
};


  const chartData = {
    labels: vacationStats.map((vac) => vac.destination),
    datasets: [
      {
        label: "Followers",
        data: vacationStats.map((vac) => vac.followers.length),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };
  useEffect(()=>{
setTimeout(()=>{
 if(!isAdmin) {
  navigate("/login")
 }
},500)
  },[isAdmin])

 if(isAdmin && isAuthenticated) {
  return (
    <div className="reports-container">
      <h1>Vacation Reports</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {vacationStats.length > 0 ? (
        <div style={{ width: "80%", height: "400px", margin: "0 auto" }}>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <p>No data available for reports.</p>
      )}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={generateCSV} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Download CSV
        </button>
      </div>
    </div>
  );
 }

}

export default VacationReports;
