import GridWorld from './components/GridWorld';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8">强化学习演示 - 格子迷宫</h1>
        <p className="text-gray-600 text-center mb-12 text-xl">
          这是一个简单的Q-learning演示。智能体(小人)需要学会从起点到达终点,同时避开障碍物。
          <br />每一步会获得不同的奖励: 普通移动(-1), 撞墙(-5), 到达终点(+10)
        </p>
        <GridWorld />
      </div>
    </main>
  );
} 