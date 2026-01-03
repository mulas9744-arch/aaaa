
export enum AppMode {
  CHAT = 'CHAT',
  BOOK = 'BOOK',
  SCRIPT = 'SCRIPT',
  PROMPT = 'PROMPT',
  ADMIN = 'ADMIN',
  PRICING = 'PRICING',
  LOGIN = 'LOGIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Simüle edilmiş auth için (normalde client'ta saklanmaz)
  plan: 'FREE' | 'PREMIUM';
  avatar?: string;
  isAdmin: boolean;
  registeredAt?: number;
  dailyUsage: {
    count: number;
    date: string; // YYYY-MM-DD
  };
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  mode: AppMode;
  messages: Message[];
  updatedAt: number;
}

export interface SystemLog {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  timestamp: number;
  userId?: string;
}

export interface PromptFeedback {
  id: string;
  userId: string;
  originalInput: string;
  generatedPrompt: string;
  rating: 'up' | 'down';
  comment?: string;
  timestamp: number;
}

export interface AdConfig {
  isEnabled: boolean;
  leftAdSlots: string[];  // Array of 6 HTML strings
  rightAdSlots: string[]; // Array of 6 HTML strings
  mobileAdSlots: string[]; // Array of 3 HTML strings (Top, Middle, Bottom)
}

export interface ShopierConfig {
  apiKey: string;
  apiSecret: string;
  websiteIndex: string;
  isEnabled: boolean;
}

export interface GoogleAuthConfig {
  clientId: string;
  isEnabled: boolean;
}

export interface PaymentPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isPopular: boolean;
}

export interface SystemPrompts {
  book: string;
  script: string;
  chat: string;
}

export interface AppConfig {
  freeDailyLimit: number; 
  maintenanceMode: boolean; // Yeni: Bakım modu
  adConfig: AdConfig;
  shopierConfig: ShopierConfig;
  googleAuthConfig: GoogleAuthConfig;
  packages: PaymentPackage[];
  systemPrompts: SystemPrompts;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface VideoGenerationState {
  status: 'idle' | 'generating' | 'polling' | 'completed' | 'error' | 'checking_key';
  videoUri?: string;
  error?: string;
}
