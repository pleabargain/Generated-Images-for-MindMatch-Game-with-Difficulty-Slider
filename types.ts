export enum GameState {
  SETUP = 'SETUP',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum DifficultyLevel {
  A1 = 'A1 (Beginner)',
  A2 = 'A2 (Elementary)',
  B1 = 'B1 (Intermediate)',
  B2 = 'B2 (Upper Intermediate)',
  C1 = 'C1 (Advanced)',
  C2 = 'C2 (Mastery)'
}

export interface GameConfig {
  style: string;
  palette: string;
  level: DifficultyLevel;
  pairCount: number;
}

export interface CardData {
  id: string;
  imageUrl: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}
