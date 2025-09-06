export interface PlotlyFigure {
  data: any[];
  layout: any;
}

export interface Visualization {
  id: string;
  figure: PlotlyFigure;
  type: string;
  config_used: Record<string, any>;
  generated_at: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  visualization?: Visualization;
  timestamp: string;
}

export interface AppState {
  isUploaded: boolean;
  chatMessages: ChatMessage[];
  visualizations: Visualization[];
  activeTab: 'chat' | 'dashboard';
  isLoading: boolean;
}

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}