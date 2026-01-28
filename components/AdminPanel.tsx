import React, { useState, useEffect } from 'react';
import { AppConfig, ScreenItem, MenuScreen, PromoScreen, Category, Dish } from '../types';
import { saveData, generateId } from '../services/dataService';

interface AdminPanelProps {
  initialConfig: AppConfig;
  onUpdate: (config: AppConfig) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialConfig, onUpdate, onLogout }) => {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto-save whenever config changes
    saveData(config);
    onUpdate(config);
  }, [config, onUpdate]);

  const addScreen = (type: 'MENU' | 'PROMO') => {
    const newScreen: ScreenItem = type === 'MENU' 
      ? {
          id: generateId(),
          type: 'MENU',
          duration: config.defaultDuration,
          categories: []
        }
      : {
          id: generateId(),
          type: 'PROMO',
          duration: config.defaultDuration,
          text: 'ЗАГОЛОВОК АКЦИИ',
          qrUrl: 'https://example.com'
        };

    setConfig(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));
    setActiveScreenIndex(config.screens.length);
  };

  const removeScreen = (index: number) => {
    if (window.confirm('Удалить этот экран?')) {
      const newScreens = [...config.screens];
      newScreens.splice(index, 1);
      setConfig(prev => ({ ...prev, screens: newScreens }));
      if (activeScreenIndex >= newScreens.length) {
        setActiveScreenIndex(Math.max(0, newScreens.length - 1));
      }
    }
  };

  const updateScreen = (index: number, updates: Partial<ScreenItem>) => {
    const newScreens = [...config.screens];
    newScreens[index] = { ...newScreens[index], ...updates } as ScreenItem;
    setConfig(prev => ({ ...prev, screens: newScreens }));
  };

  // --- Menu Specific Helpers ---

  const addCategory = (screenIndex: number) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCat: Category = { id: generateId(), title: 'НОВАЯ КАТЕГОРИЯ', dishes: [] };
    const newCats = [...screen.categories, newCat];
    updateScreen(screenIndex, { categories: newCats });
    toggleCategory(newCat.id);
  };

  const updateCategory = (screenIndex: number, catIndex: number, title: string) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCats = [...screen.categories];
    newCats[catIndex] = { ...newCats[catIndex], title };
    updateScreen(screenIndex, { categories: newCats });
  };

  const deleteCategory = (screenIndex: number, catIndex: number) => {
    if(!window.confirm('Удалить категорию?')) return;
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCats = screen.categories.filter((_, i) => i !== catIndex);
    updateScreen(screenIndex, { categories: newCats });
  };

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCategories(newSet);
  };

  const addDish = (screenIndex: number, catIndex: number) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCats = [...screen.categories];
    const newDish: Dish = { id: generateId(), name: 'Новое блюдо', weight: '200г', price: 0, isHalfPortion: false };
    newCats[catIndex].dishes.push(newDish);
    updateScreen(screenIndex, { categories: newCats });
  };

  const updateDish = (screenIndex: number, catIndex: number, dishIndex: number, updates: Partial<Dish>) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCats = [...screen.categories];
    newCats[catIndex].dishes[dishIndex] = { ...newCats[catIndex].dishes[dishIndex], ...updates };
    updateScreen(screenIndex, { categories: newCats });
  };

  const deleteDish = (screenIndex: number, catIndex: number, dishIndex: number) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCats = [...screen.categories];
    newCats[catIndex].dishes.splice(dishIndex, 1);
    updateScreen(screenIndex, { categories: newCats });
  };

  const moveScreen = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.screens.length - 1) return;
    
    const newScreens = [...config.screens];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newScreens[index], newScreens[swapIndex]] = [newScreens[swapIndex], newScreens[index]];
    
    setConfig(prev => ({ ...prev, screens: newScreens }));
    setActiveScreenIndex(swapIndex);
  };

  const currentScreen = config.screens[activeScreenIndex];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center z-10">
        <h1 className="text-xl font-bold text-yellow-500 tracking-wider">GastroBoard Admin</h1>
        <div className="flex items-center space-x-4">
           <a href="#/" target="_blank" className="text-blue-400 hover:underline text-sm">Открыть ТВ Вид</a>
           <button onClick={onLogout} className="bg-red-600 px-4 py-2 rounded text-sm hover:bg-red-700 transition">Выйти</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Screen List */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-sm uppercase text-gray-500 font-bold mb-2">Экраны</h2>
                <div className="flex space-x-2">
                    <button onClick={() => addScreen('MENU')} className="flex-1 bg-green-700 hover:bg-green-600 py-1 rounded text-xs">+ Меню</button>
                    <button onClick={() => addScreen('PROMO')} className="flex-1 bg-purple-700 hover:bg-purple-600 py-1 rounded text-xs">+ Промо</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto admin-scroll">
                {config.screens.map((screen, idx) => (
                    <div 
                        key={screen.id}
                        onClick={() => setActiveScreenIndex(idx)}
                        className={`p-3 border-b border-gray-700 cursor-pointer flex justify-between items-center group ${activeScreenIndex === idx ? 'bg-gray-700 border-l-4 border-yellow-500' : 'hover:bg-gray-700'}`}
                    >
                        <div className="truncate">
                            <span className="text-xs font-mono bg-black px-1 rounded mr-2 text-gray-400">{idx + 1}</span>
                            <span className="text-sm font-medium">{screen.type === 'MENU' ? 'Меню' : 'Промо'}</span>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'up'); }}
                                className="text-gray-400 hover:text-white px-1"
                             >↑</button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'down'); }}
                                className="text-gray-400 hover:text-white px-1"
                             >↓</button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6 admin-scroll">
            {currentScreen ? (
                <div className="max-w-4xl mx-auto">
                    {/* Screen Settings */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">Настройки Экрана {activeScreenIndex + 1}</h2>
                            <button onClick={() => removeScreen(activeScreenIndex)} className="text-red-400 text-sm hover:text-red-300">Удалить экран</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Тип</label>
                                <div className="py-2 px-3 bg-gray-700 rounded text-gray-300">{currentScreen.type}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Длительность (сек)</label>
                                <input 
                                    type="number" 
                                    min="5" 
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 focus:outline-none"
                                    value={currentScreen.duration}
                                    onChange={(e) => updateScreen(activeScreenIndex, { duration: parseInt(e.target.value) || 20 })}
                                />
                            </div>
                        </div>

                        {/* Promo Specific Fields */}
                        {currentScreen.type === 'PROMO' && (
                             <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1">Текст на экране (поддерживает перенос строки)</label>
                                    <textarea 
                                        className="w-full h-24 bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                        value={(currentScreen as PromoScreen).text}
                                        onChange={(e) => updateScreen(activeScreenIndex, { text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase mb-1">Ссылка для QR кода</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                        value={(currentScreen as PromoScreen).qrUrl}
                                        onChange={(e) => updateScreen(activeScreenIndex, { qrUrl: e.target.value })}
                                    />
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Menu Categories */}
                    {currentScreen.type === 'MENU' && (
                        <div>
                             <div className="flex justify-between items-end mb-4">
                                <h3 className="text-lg font-bold uppercase text-gray-400">Категории меню</h3>
                                <button onClick={() => addCategory(activeScreenIndex)} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded text-sm transition">
                                    + Добавить категорию
                                </button>
                             </div>

                             <div className="space-y-4">
                                {(currentScreen as MenuScreen).categories.map((cat, catIdx) => (
                                    <div key={cat.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                        <div 
                                            className="p-4 bg-gray-750 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition"
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            <div className="flex-1 mr-4">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-transparent border-b border-transparent hover:border-gray-500 focus:border-yellow-500 focus:outline-none text-xl font-bold uppercase text-yellow-500"
                                                    value={cat.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateCategory(activeScreenIndex, catIdx, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                 <span className="text-xs text-gray-500">{cat.dishes.length} блюд</span>
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteCategory(activeScreenIndex, catIdx); }}
                                                    className="text-gray-500 hover:text-red-500 px-2"
                                                 >✕</button>
                                                 <span className="text-gray-500 transform transition-transform duration-200" style={{ transform: expandedCategories.has(cat.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                            </div>
                                        </div>

                                        {expandedCategories.has(cat.id) && (
                                            <div className="p-4 bg-gray-900/50">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="text-gray-500 uppercase text-xs border-b border-gray-700">
                                                            <th className="pb-2 w-5/12">Название</th>
                                                            <th className="pb-2 w-2/12">Вес</th>
                                                            <th className="pb-2 w-2/12">Цена</th>
                                                            <th className="pb-2 w-2/12 text-center">½ Порции</th>
                                                            <th className="pb-2 w-1/12"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cat.dishes.map((dish, dishIdx) => (
                                                            <tr key={dish.id} className="group hover:bg-gray-800/50">
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-gray-800 focus:border-blue-500 focus:outline-none"
                                                                        value={dish.name}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { name: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-gray-800 focus:border-blue-500 focus:outline-none"
                                                                        value={dish.weight}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { weight: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full bg-transparent border-b border-gray-800 focus:border-blue-500 focus:outline-none"
                                                                        value={dish.price}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { price: parseFloat(e.target.value) || 0 })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={dish.isHalfPortion}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { isHalfPortion: e.target.checked })}
                                                                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600"
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    <button 
                                                                        onClick={() => deleteDish(activeScreenIndex, catIdx, dishIdx)}
                                                                        className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >✕</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {/* Add Dish Row */}
                                                        <tr>
                                                            <td colSpan={5} className="pt-3">
                                                                <button 
                                                                    onClick={() => addDish(activeScreenIndex, catIdx)}
                                                                    className="w-full py-2 border-2 border-dashed border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 rounded text-xs uppercase transition"
                                                                >
                                                                    + Добавить блюдо
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p className="text-xl">Выберите экран для редактирования или создайте новый.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;