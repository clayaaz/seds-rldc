import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [sensorData, setSensorData] = useState({
    temp: 0,
    humidity: 0,
    pressure: 0,
    x: 0,
    y: 0,
    z: 0,
    altitude: 0
  });

  const [showGraph, setShowGraph] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('temp');
  const [timeLabels, setTimeLabels] = useState([]);
  const [metricData, setMetricData] = useState([]);

  useEffect(() => {
    // Your Firebase configuration
    const firebaseConfig = {
      databaseURL: ""
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const sensorRef = ref(db, 'sensor');

    // Set up real-time listener
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
        
        // Update time labels and metric data
        setTimeLabels(prev => {
          const newLabels = [...prev, new Date().toLocaleTimeString()];
          return newLabels.slice(-20);
        });
  
        setMetricData(prev => {
          const newValue = selectedMetric === 'altitude' 
            ? data[selectedMetric] + 1324+836 
            : data[selectedMetric];
          const newData = [...prev, newValue];
          return newData.slice(-20);
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [selectedMetric]);

  const getMetricLabel = (metric) => {
    const labels = {
      temp: 'Temperature (°C)',
      humidity: 'Humidity (%)',
      pressure: 'Pressure (Pa)',
      x: 'X Acceleration (m/s²)',
      y: 'Y Acceleration (m/s²)',
      z: 'Z Acceleration (m/s²)',
      altitude: 'Altitude (m)'
    };
    return labels[metric];
  };

  const graphData = {
    labels: timeLabels,
    datasets: [
      {
        label: getMetricLabel(selectedMetric),
        data: metricData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value.toFixed(2);
          },
          color: '#ffffff'
        },
        grid: {
          color: '#444444'
        }
      },
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#444444'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff'
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Temperature Card */}
        <div className="sensor-card">
          <h2>Temperature</h2>
          <span className="sensor-value">{sensorData.temp}</span>
          <span className="sensor-unit">°C</span>
        </div>

        {/* Humidity Card */}
        <div className="sensor-card">
          <h2>Humidity</h2>
          <span className="sensor-value">{sensorData.humidity}</span>
          <span className="sensor-unit">%</span>
        </div>

        {/* Air Pressure Card */}
        <div className="sensor-card">
          <h2>Air Pressure</h2>
          <span className="sensor-value">{sensorData.pressure}</span>
          <span className="sensor-unit">Pa</span>
        </div>

        {/* Acceleration Card */}
        <div className="sensor-card">
          <h2>Acceleration</h2>
          <div className="acceleration-grid">
            <div className="acceleration-value">
              <div className="sensor-value">{sensorData.x}</div>
              <span className="sensor-unit">X-axis (m/s²)</span>
            </div>
            <div className="acceleration-value">
              <div className="sensor-value">{sensorData.y}</div>
              <span className="sensor-unit">Y-axis (m/s²)</span>
            </div>
            <div className="acceleration-value">
              <div className="sensor-value">{sensorData.z}</div>
              <span className="sensor-unit">Z-axis (m/s²)</span>
            </div>
          </div>
        </div>

        {/* Altitude Card */}
        <div className="sensor-card">
          <h2>Altitude</h2>
          <span className="sensor-value">{sensorData.altitude +1324+836}</span>
          <span className="sensor-unit">m</span>
        </div>
      </div>

      <div className="graph-controls">
        <button 
          onClick={() => setShowGraph(!showGraph)}
          className="graph-button"
        >
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </button>
        
        <select 
          value={selectedMetric}
          onChange={(e) => {
            setSelectedMetric(e.target.value);
            setTimeLabels([]);
            setMetricData([]);
          }}
          className="metric-select"
        >
          <option value="temp">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="pressure">Pressure</option>
          <option value="altitude">Altitude</option>
          <option value="x">X Acceleration</option>
          <option value="y">Y Acceleration</option>
          <option value="z">Z Acceleration</option>
        </select>
      </div>

      {showGraph && (
        <div className="graph-container">
          <Line data={graphData} options={graphOptions} />
        </div>
      )}
    </div>
  );
}

export default App;
