import { AppConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

const STORAGE_KEY = 'gastroboard_data_v1';

export const getData = (): AppConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
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
