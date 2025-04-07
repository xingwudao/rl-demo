export type CellType = 'empty' | 'wall' | 'start' | 'goal';
export type Action = 'up' | 'down' | 'left' | 'right';
export type Position = { x: number; y: number };

export interface StepResult {
  nextPos: Position;
  reward: number;
  isDone: boolean;
}

export class Environment {
  private grid: CellType[][];
  private currentPos: Position;
  private startPos: Position = { x: 0, y: 0 };
  private goalPos: Position = { x: 4, y: 4 };

  constructor(grid: CellType[][]) {
    this.grid = grid;
    this.currentPos = { ...this.startPos };
  }

  public reset(): Position {
    this.currentPos = { ...this.startPos };
    return this.currentPos;
  }

  private isValidMove(pos: Position): boolean {
    return (
      pos.x >= 0 && pos.x < 5 &&
      pos.y >= 0 && pos.y < 5 &&
      this.grid[pos.y][pos.x] !== 'wall'
    );
  }

  private getNextPosition(action: Action): Position {
    const nextPos = { ...this.currentPos };
    
    switch (action) {
      case 'up':
        nextPos.y -= 1;
        break;
      case 'down':
        nextPos.y += 1;
        break;
      case 'left':
        nextPos.x -= 1;
        break;
      case 'right':
        nextPos.x += 1;
        break;
    }

    return nextPos;
  }

  public step(action: Action): StepResult {
    const nextPos = this.getNextPosition(action);
    let reward = -1; // 基础移动惩罚
    let isDone = false;

    // 检查是否撞墙
    if (!this.isValidMove(nextPos)) {
      reward = -5; // 撞墙惩罚
      return {
        nextPos: this.currentPos, // 保持原位
        reward,
        isDone: false
      };
    }

    // 更新位置
    this.currentPos = nextPos;

    // 检查是否到达目标
    if (
      this.currentPos.x === this.goalPos.x && 
      this.currentPos.y === this.goalPos.y
    ) {
      reward = 10; // 到达目标奖励
      isDone = true;
    }

    return {
      nextPos: this.currentPos,
      reward,
      isDone
    };
  }

  public getCurrentPosition(): Position {
    return { ...this.currentPos };
  }

  public getGrid(): CellType[][] {
    return this.grid;
  }
} 