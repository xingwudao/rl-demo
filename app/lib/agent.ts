import { Environment, Action } from './environment';

type State = string; // "x,y" format
type QTable = { [state: string]: { [action in Action]: number } };

export class Agent {
  private qTable: QTable = {};
  private learningRate: number = 0.2;
  private discountFactor: number = 0.9;
  private epsilon: number = 0.3;
  private minEpsilon: number = 0.01;
  private epsilonDecay: number = 0.95;

  constructor(private environment: Environment) {
    this.initQTable();
  }

  private initQTable() {
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const state = `${x},${y}`;
        this.qTable[state] = {
          up: Math.random() * 0.1,
          down: Math.random() * 0.1,
          left: Math.random() * 0.1,
          right: Math.random() * 0.1
        };
      }
    }
  }

  private getState(x: number, y: number): State {
    return `${x},${y}`;
  }

  private getRandomAction(): Action {
    const actions: Action[] = ['up', 'down', 'left', 'right'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  public getBestActionForState(state: State): Action {
    if (!this.qTable[state]) {
      return this.getRandomAction();
    }

    const actions = this.qTable[state];
    const maxQ = Math.max(...Object.values(actions));
    const bestActions = Object.entries(actions)
      .filter(([_, value]) => value === maxQ)
      .map(([action, _]) => action as Action);
    
    if (bestActions.length === 0) {
      return this.getRandomAction();
    }
    
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }

  public chooseAction(x: number, y: number): Action {
    const state = this.getState(x, y);
    
    if (Math.random() < this.epsilon) {
      return this.getRandomAction();
    }
    return this.getBestActionForState(state);
  }

  public getBestAction(x: number, y: number): Action {
    const state = this.getState(x, y);
    return this.getBestActionForState(state);
  }

  public learn(
    currentX: number, 
    currentY: number,
    action: Action,
    reward: number,
    nextX: number,
    nextY: number
  ) {
    const currentState = this.getState(currentX, currentY);
    const nextState = this.getState(nextX, nextY);

    const currentQ = this.qTable[currentState][action];
    const nextMaxQ = Math.max(...Object.values(this.qTable[nextState]));
    
    this.qTable[currentState][action] = currentQ + 
      this.learningRate * (reward + this.discountFactor * nextMaxQ - currentQ);

    this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.epsilonDecay);
  }

  public getQValue(x: number, y: number, action: Action): number {
    const state = this.getState(x, y);
    return this.qTable[state][action];
  }
} 