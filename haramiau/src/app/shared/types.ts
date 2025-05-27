export interface GameSettings {
  turn: number;
  isShowTip: boolean;
  hintTime: number;
  tipTime: number;
  chooseWordTime: number;
  showWordTime: number;
  evaluateTipsTime: number;
  wordMinusPoint: number;
  haramiauiMinusPoint: number;
  ownWords: string[];
}

export interface Player {
  name: string;
  score: number;
  avatar: number;
}
