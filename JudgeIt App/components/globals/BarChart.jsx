import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ gradeData }) => {
  const data = {
    labels: Object.keys(gradeData),
    datasets: [
      {
        label: 'Count',
        data: Object.values(gradeData),
        backgroundColor: 'rgba(144, 202, 249, 0.6)',
        borderColor: 'rgba(144, 202, 249, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Grade Distribution',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Grade',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        beginAtZero: true,  // Start the y-axis at 0
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;