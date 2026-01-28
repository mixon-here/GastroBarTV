export interface Dish {
  id: string;
  name: string;
  weight: string;
  price: number;
  isHalfPortion: boolean; // If true, display logic calculates /2
}

export interface Category {
  id: string;
  title: string;
  dishes: Dish[];
}

export type ScreenType = 'MENU' | 'PROMO';

export interface BaseScreen {
  id: string;
  type: ScreenType;
  duration: number; // Duration in seconds
  frequency?: number; // 1 = Every loop (default), 2 = Every 2nd loop, etc.
}

export interface MenuScreen extends BaseScreen {
  type: 'MENU';
  categories: Category[];
}

export interface PromoScreen extends BaseScreen {
  type: 'PROMO';
  text: string;
  qrUrl: string; // URL to generate QR for
}

export type ScreenItem = MenuScreen | PromoScreen;

export interface AppConfig {
  screens: ScreenItem[];
  defaultDuration: number;
  adminPassword?: string; // Stored in localstorage for simple auth
}
