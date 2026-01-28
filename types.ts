export interface Dish {
  id: string;
  name: string;
  weight: string;
  price: number;
  isHalfPortion: boolean;
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
  duration: number;
  contentScale?: number;
  rotation?: 0 | 90 | 180 | 270;
  displayFrequency?: number; // 1 = every loop, 2 = every 2nd loop, etc.
}

export interface MenuScreen extends BaseScreen {
  type: 'MENU';
  categories: Category[];
}

export interface PromoScreen extends BaseScreen {
  type: 'PROMO';
  text: string;
  qrUrl: string;
}

export type ScreenItem = MenuScreen | PromoScreen;

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface AppConfig {
  screens: ScreenItem[];
  defaultDuration: number;
  users: User[];
}