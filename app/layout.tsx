import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '强化学习演示 - 格子迷宫',
  description: '一个简单的Q-learning演示，展示智能体如何在格子世界中学习最优路径。',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="zh" className="h-full">
      <body className="h-full overflow-auto">{children}</body>
    </html>
  );
};

export default RootLayout; 