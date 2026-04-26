export interface Novel {
  id: string;
  title: string;
  content: string;
  status: 'uploaded' | 'analyzing' | 'ready' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyLocation {
  name: string;
  description: string;
}

export interface KeyEvent {
  name: string;
  description: string;
}

export interface WorldSetting {
  id: string;
  novelId: string;
  worldName: string;
  worldType: string;
  timePeriod: string;
  geography: string;
  socialStructure: string;
  rules: string[];
  mainConflict: string;
  themes: string[];
  tone: string;
  keyLocations: KeyLocation[];
  keyEvents: KeyEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryOutline {
  id: string;
  novelId: string;
  title: string;
  description: string;
  order: number;
  keyPoints: string[];
}
