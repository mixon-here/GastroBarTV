import { AppConfig, User } from '../types';
import { DEFAULT_CONFIG } from '../constants';

const STORAGE_KEY = 'gastroboard_data_v1';

export const getData = (): AppConfig => {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      
      // Migration: If users array is missing (old version), add it
      if (!data.users || !Array.isArray(data.users)) {
        data.users = DEFAULT_CONFIG.users;
      }

      // Migration: Add footerText to existing PROMO screens if missing
      if (data.screens && Array.isArray(data.screens)) {
        data.screens = data.screens.map((s: any) => {
          if (s.type === 'PROMO' && typeof s.footerText === 'undefined') {
            return { ...s, footerText: 'Наведите камеру телефона' };
          }
          return s;
        });
      }
      
      return data;
    }
  } catch (e) {
    console.error('Failed to parse data', e);
  }
  return DEFAULT_CONFIG;
};

export const saveData = (data: AppConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};