import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { API_TYPE_RATING, API_TYPE_SIMILARITY, API_TYPE_MULTITURN } from "@/services/Config";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const BarChart = ({ gradeData, gradeType }) => {
  const totalCount = Object.values(gradeData).reduce((sum, count) => sum + count, 0);

  const mapGradeLabels = (label) => {
    const labelMaps = {
      [API_TYPE_RATING]: {
        '1': 'Incorrect',
        '2': 'Partially Correct',
        '3': 'Correct'
      },
      [API_TYPE_SIMILARITY]: {
        '0': 'Incorrect',
        '1': 'Correct'
      },
      [API_TYPE_MULTITURN]: {
        '0': 'Incorrect',
        '1': 'Correct'
      }
    };

    return labelMaps[gradeType]?.[label] || label;
  };

  const data = {
    labels: Object.keys(gradeData).map(mapGradeLabels),
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
          text: 'JudgeIt Score',
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
      datalabels: {
        color: 'black',          // Label color
        anchor: 'end',           // Positioning of the label
        align: 'top',            // Align the label at the top
        font: {
          weight: 'bold',
          size: 12,
        },
        formatter: (value) => "Count: " + value,  // Format the value as you want
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