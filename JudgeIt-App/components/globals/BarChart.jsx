import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ gradeData }) => {
  const mapGradeToLabel = (grade) => {
    const mapping = {
      0: 'Incorrect',
      1: Object.keys(gradeData).length === 2 ? 'Correct' : 'Incorrect',
      2: 'Partially Correct',
      3: 'Correct'
    };
    return mapping[grade] || grade.toString();
  };

  const totalCount = Object.values(gradeData).reduce((sum, count) => sum + count, 0);

  const data = {
    labels: Object.keys(gradeData).map(mapGradeToLabel),
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
    maintainAspectRatio: false,
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
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.raw;
            const percentage = ((count / totalCount) * 100).toFixed(2);
            return `Count: ${count} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;