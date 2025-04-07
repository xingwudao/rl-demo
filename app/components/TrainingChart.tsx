'use client';

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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrainingChartProps {
  history: { steps: number; reward: number }[];
  episode: number;
  currentSteps: number;
  bestSteps: number | null;
  averageSteps: number;
  totalReward: number;
}

export default function TrainingChart({ 
  history,
  episode,
  currentSteps,
  bestSteps,
  averageSteps,
  totalReward
}: TrainingChartProps) {
  const data = {
    labels: history.length > 0 ? history.map((_, index) => `回合 ${index + 1}`) : [''],
    datasets: [
      {
        label: '到达目标所需步数',
        data: history.length > 0 ? history.map(h => h.steps) : [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false  // 隐藏图例
      },
      title: {
        display: true,
        text: '训练进度',
        padding: {
          bottom: 10
        },
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: history.length > 0 ? undefined : 50,
        title: {
          display: true,
          text: '步数',
          font: {
            size: 14
          }
        }
      },
      x: {
        title: {
          display: true,
          text: '训练回合',
          font: {
            size: 14
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-lg flex flex-col">
      {/* 图表 */}
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-center mt-2 px-8 text-sm">
        {/* 状态信息 */}
        <div className="flex items-center justify-between w-[1000px] text-gray-600">
          <span>训练回合:{episode}</span>
          <span>当前步数:{currentSteps}</span>
          {bestSteps !== null && <span>最佳步数:<span className="text-green-500">{bestSteps}</span></span>}
          <span>平均步数:<span className="text-blue-500">{averageSteps}</span></span>
          <span>累计奖励:{totalReward}</span>
        </div>
      </div>
    </div>
  );
} 