'use client';

import { useState, useEffect, useRef } from 'react';
import { Agent } from '../lib/agent';
import { Environment, CellType, Action, Position, StepResult } from '../lib/environment';
import TrainingChart from './TrainingChart';

// 初始化地图
const initialGrid: CellType[][] = [
  ['start', 'empty', 'wall', 'empty', 'empty'],
  ['empty', 'wall', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'wall', 'empty'],
  ['empty', 'wall', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'goal'],
];

const ANIMATION_DELAY = 300; // ms

export default function GridWorld() {
  const [grid, setGrid] = useState(initialGrid);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 0 });
  const [isTraining, setIsTraining] = useState(false);
  const [episode, setEpisode] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [bestSteps, setBestSteps] = useState<number | null>(null);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState<{steps: number, reward: number}[]>([]);
  const shouldStopTrainingRef = useRef(false);
  const [optimalActions, setOptimalActions] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill(''))
  );

  const environmentRef = useRef(new Environment(initialGrid));
  const agentRef = useRef(new Agent(environmentRef.current));

  const getCellColor = (type: CellType) => {
    switch (type) {
      case 'wall': return 'bg-gray-800';
      case 'start': return 'bg-blue-200';
      case 'goal': return 'bg-green-200';
      default: return 'bg-white';
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getActionArrow = (action: string) => {
    switch (action) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'left': return '←';
      case 'right': return '→';
      default: return '';
    }
  };

  const runEpisode = async (isTrainingMode: boolean = true) => {
    const env = environmentRef.current;
    const agent = agentRef.current;
    let currentPos = env.reset();
    setAgentPos(currentPos);
    let episodeReward = 0;
    let steps = 0;
    let isDone = false;
    
    while (!isDone && steps < 50) {
      if (isTrainingMode && shouldStopTrainingRef.current) {
        return { steps, reward: episodeReward };
      }

      // 保存当前状态，用于后续学习
      const prevPos = { ...currentPos };
      
      const action = isTrainingMode 
        ? agent.chooseAction(currentPos.x, currentPos.y)
        : agent.getBestAction(currentPos.x, currentPos.y);
      
      const stepResult = env.step(action);
      currentPos = stepResult.nextPos;
      episodeReward += stepResult.reward;
      isDone = stepResult.isDone;
      steps++;
      
      // 更新UI
      setAgentPos(currentPos);
      setCurrentSteps(steps);
      if (isTrainingMode) {
        setTotalReward(prev => prev + stepResult.reward);
      }

      if (isTrainingMode) {
        // 更新Q值，使用正确的前后状态
        agent.learn(
          prevPos.x,
          prevPos.y,
          action,
          stepResult.reward,
          currentPos.x,
          currentPos.y
        );
      }
      
      // 动画延迟
      await sleep(ANIMATION_DELAY);
    }

    // 更新最佳记录
    if (isDone && (bestSteps === null || steps < bestSteps)) {
      setBestSteps(steps);
    }

    if (isTrainingMode) {
      console.log('Episode completed:', { steps, reward: episodeReward });
      setTrainingHistory(prev => {
        const newHistory = [...prev, { steps, reward: episodeReward }];
        console.log('Updated training history:', newHistory);
        return newHistory;
      });
    }

    return { steps, reward: episodeReward };
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingHistory([]);
    shouldStopTrainingRef.current = false;
    const numEpisodes = 50;
    
    for (let i = 0; i < numEpisodes; i++) {
      if (shouldStopTrainingRef.current) {
        break;
      }
      setEpisode(i + 1);
      const result = await runEpisode(true);
      
      if (result.steps < 8) {
        break;
      }
    }
    
    setIsTraining(false);
    shouldStopTrainingRef.current = false;
  };

  const handleStopTraining = () => {
    shouldStopTrainingRef.current = true;
  };

  const handleEvaluate = async () => {
    if (!agentRef.current || isEvaluating) return;
    
    setIsEvaluating(true);
    const env = environmentRef.current;
    const agent = agentRef.current;
    
    // 清空之前的路径
    setOptimalActions(Array(5).fill(null).map(() => Array(5).fill('')));
    
    // 创建临时数组来存储路径
    const tempActions = Array(5).fill(null).map(() => Array(5).fill(''));
    
    // 演示移动过程并记录路径
    let currentPos = env.reset();
    setAgentPos(currentPos);
    let steps = 0;
    let isDone = false;
    
    // 记录已经访问过的状态，避免循环
    const visitedStates = new Set<string>();
    
    while (!isDone && steps < 50) {
      const state = `${currentPos.x},${currentPos.y}`;
      
      // 如果遇到循环，提前结束
      if (visitedStates.has(state)) {
        break;
      }
      visitedStates.add(state);
      
      const action = agent.getBestActionForState(state);
      
      // 记录当前位置的动作
      tempActions[currentPos.y][currentPos.x] = action;
      
      const stepResult = env.step(action);
      setAgentPos(stepResult.nextPos);
      currentPos = stepResult.nextPos;
      isDone = stepResult.isDone;
      steps++;
      
      // 更新箭头显示
      setOptimalActions([...tempActions]);
      
      // 添加延迟以便观察
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 确保在移动结束后才设置 isEvaluating 为 false
    setIsEvaluating(false);
  };

  const handleReset = () => {
    setAgentPos({ x: 0, y: 0 });
    setEpisode(0);
    setTotalReward(0);
    setCurrentSteps(0);
    setBestSteps(null);
    setIsTraining(false);
    setIsEvaluating(false);
    setTrainingHistory([]);
    setOptimalActions(Array(5).fill(null).map(() => Array(5).fill('')));
    environmentRef.current = new Environment(initialGrid);
    agentRef.current = new Agent(environmentRef.current);
  };

  // 计算平均步数
  const averageSteps = trainingHistory.length > 0
    ? Math.round(trainingHistory.reduce((sum, h) => sum + h.steps, 0) / trainingHistory.length)
    : 0;

  return (
    <div className="flex flex-col items-center justify-start gap-16 py-12">
      {/* 主要内容区域：网格、状态信息和训练曲线 */}
      <div className="w-full max-w-[1800px] flex items-start gap-12">
        {/* 左侧：网格世界和控制按钮 */}
        <div className="flex flex-col items-center gap-6">
          {/* 网格世界 */}
          <div className="grid grid-cols-5 gap-2 p-6 bg-gray-200 rounded-xl shadow-lg min-w-[400px] min-h-[400px]">
            {grid.map((row, y) => (
              <div key={`row-${y}`} className="contents">
                {row.map((cell, x) => (
                  <div 
                    key={`${x}-${y}`}
                    className={`
                      w-16 h-16 
                      ${getCellColor(cell)}
                      flex items-center justify-center
                      rounded-md border-2 border-gray-300
                      relative
                      shadow-md
                      transition-colors duration-300
                    `}
                  >
                    {/* 显示智能体 */}
                    {agentPos.x === x && agentPos.y === y && (
                      <div className="w-8 h-8 bg-yellow-400 rounded-full 
                        flex items-center justify-center
                        transition-all duration-300
                        text-xl
                        shadow-lg
                        z-10"
                      >
                        🤖
                      </div>
                    )}
                    {/* 显示起点和终点标识 */}
                    {cell === 'start' && (
                      <div className="absolute text-2xl" style={{ opacity: agentPos.x === x && agentPos.y === y ? 0.3 : 1 }}>
                        🏠
                      </div>
                    )}
                    {cell === 'goal' && (
                      <div className="absolute text-2xl">
                        🎯
                      </div>
                    )}
                    {/* 显示最优路径箭头 */}
                    {optimalActions[y][x] && (
                      <div className="absolute text-green-500 font-bold text-2xl" style={{ opacity: 0.8 }}>
                        {getActionArrow(optimalActions[y][x])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-4">
            {!isTraining ? (
              <button
                onClick={handleTrain}
                disabled={isEvaluating}
                className="px-6 py-3 bg-blue-500 text-white text-xl font-semibold rounded-lg
                  hover:bg-blue-600 disabled:bg-gray-400
                  transition-colors duration-200
                  shadow-md"
              >
                开始训练
              </button>
            ) : (
              <button
                onClick={handleStopTraining}
                className="px-6 py-3 bg-red-500 text-white text-xl font-semibold rounded-lg
                  hover:bg-red-600
                  transition-colors duration-200
                  shadow-md"
              >
                停止训练
              </button>
            )}
            <button
              onClick={handleEvaluate}
              disabled={isTraining || isEvaluating || episode === 0}
              className="px-6 py-3 bg-green-500 text-white text-xl font-semibold rounded-lg
                hover:bg-green-600 disabled:bg-gray-400
                transition-colors duration-200
                shadow-md"
            >
              {isEvaluating ? '演示中...' : '查看最优路径'}
            </button>
            <button
              onClick={handleReset}
              disabled={isTraining}
              className="px-6 py-3 bg-gray-500 text-white text-xl font-semibold rounded-lg
                hover:bg-gray-600 disabled:bg-gray-400
                transition-colors duration-200
                shadow-md"
            >
              重置
            </button>
          </div>
        </div>

        {/* 右侧训练曲线 */}
        <div className="flex-1">
          <TrainingChart 
            history={trainingHistory}
            episode={episode}
            currentSteps={currentSteps}
            bestSteps={bestSteps}
            averageSteps={averageSteps}
            totalReward={totalReward}
          />
        </div>
      </div>

      {/* 训练提示 */}
      {episode === 0 && (
        <div className="text-gray-600 text-xl text-center">
          点击"开始训练"让机器人学习如何找到最短路径
        </div>
      )}
      {episode > 0 && !isTraining && !isEvaluating && (
        <div className="text-gray-600 text-xl text-center">
          点击"查看最优路径"查看机器人学到的最佳路线
        </div>
      )}
    </div>
  );
} 