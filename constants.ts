import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  defaultDuration: 20,
  users: [
    { id: 'u1', username: 'admin', password: '123', role: 'ADMIN' },
    { id: 'u2', username: 'operator', password: '123', role: 'OPERATOR' }
  ],
  screens: [
    {
      id: 'screen-1',
      type: 'MENU',
      duration: 20,
      contentScale: 1,
      categories: [
        {
          id: 'cat-1',
          title: 'САЛАТЫ',
          dishes: [
            { id: 'd-1', name: 'Цезарь с курицей', weight: '250г', price: 350, isHalfPortion: false },
            { id: 'd-2', name: 'Греческий', weight: '200г', price: 280, isHalfPortion: false },
            { id: 'd-3', name: 'Оливье', weight: '200г', price: 220, isHalfPortion: false },
          ]
        },
        {
          id: 'cat-2',
          title: 'ВЫПЕЧКА',
          dishes: [
            { id: 'd-4', name: 'Круассан', weight: '80г', price: 150, isHalfPortion: false },
            { id: 'd-5', name: 'Пирожок с мясом', weight: '100г', price: 90, isHalfPortion: false },
          ]
        }
      ]
    },
    {
      id: 'screen-2',
      type: 'MENU',
      duration: 20,
      contentScale: 1,
      categories: [
        {
          id: 'cat-3',
          title: 'ПЕРВЫЕ БЛЮДА',
          dishes: [
            { id: 'd-6', name: 'Борщ домашний', weight: '350г', price: 300, isHalfPortion: true },
            { id: 'd-7', name: 'Солянка сборная', weight: '350г', price: 350, isHalfPortion: true },
            { id: 'd-8', name: 'Крем-суп грибной', weight: '300г', price: 280, isHalfPortion: false },
          ]
        },
        {
          id: 'cat-4',
          title: 'ГАРНИРЫ',
          dishes: [
            { id: 'd-9', name: 'Картофельное пюре', weight: '150г', price: 120, isHalfPortion: false },
            { id: 'd-10', name: 'Гречка с маслом', weight: '150г', price: 100, isHalfPortion: false },
          ]
        }
      ]
    },
    {
      id: 'screen-3',
      type: 'PROMO',
      duration: 20,
      contentScale: 1,
      text: 'ВСТУПИТЬ В ГРУППУ TELEGRAM\nГДЕ ВЫХОДЯТ ВСЕ ОБНОВЛЕНИЯ',
      qrUrl: 'https://t.me/your_restaurant_channel'
    }
  ]
};