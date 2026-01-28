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

  // CRITICAL FIX: Update local state when prop changes (from external updates or parent re-renders)
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

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
          frequency: 1,
          categories: []
        }
      : {
          id: generateId(),
          type: 'PROMO',
          duration: config.defaultDuration,
          frequency: 1,
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
    if (window.confirm('Вы уверены, что хотите удалить этот экран?')) {
      setConfig(prev => {
        const newScreens = prev.screens.filter((_, i) => i !== index);
        return { ...prev, screens: newScreens };
      });
      // Adjust active index if needed
      setActiveScreenIndex(prev => {
         if (prev >= index && prev > 0) return prev - 1;
         return 0;
      });
    }
  };

  const updateScreen = (index: number, updates: Partial<ScreenItem>) => {
    setConfig(prev => {
      const newScreens = prev.screens.map((s, i) => i === index ? { ...s, ...updates } as ScreenItem : s);
      return { ...prev, screens: newScreens };
    });
  };

  // --- Menu Specific Helpers (Immutable Patterns) ---

  const addCategory = (screenIndex: number) => {
    const newCat: Category = { id: generateId(), title: 'НОВАЯ КАТЕГОРИЯ', dishes: [] };
    
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = [...screen.categories, newCat];
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
    
    toggleCategory(newCat.id);
  };

  const updateCategory = (screenIndex: number, catIndex: number, title: string) => {
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = screen.categories.map((c, i) => i === catIndex ? { ...c, title } : c);
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
  };

  const deleteCategory = (screenIndex: number, catIndex: number) => {
    if(!window.confirm('Вы уверены, что хотите удалить эту категорию и все блюда в ней?')) return;
    
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = screen.categories.filter((_, i) => i !== catIndex);
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
  };

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCategories(newSet);
  };

  const addDish = (screenIndex: number, catIndex: number) => {
    const newDish: Dish = { id: generateId(), name: 'Новое блюдо', weight: '200г', price: 0, isHalfPortion: false };
    
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = screen.categories.map((c, i) => {
        if (i !== catIndex) return c;
        return { ...c, dishes: [...c.dishes, newDish] };
      });
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
  };

  const updateDish = (screenIndex: number, catIndex: number, dishIndex: number, updates: Partial<Dish>) => {
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = screen.categories.map((c, cIdx) => {
        if (cIdx !== catIndex) return c;
        const newDishes = c.dishes.map((d, dIdx) => dIdx === dishIndex ? { ...d, ...updates } : d);
        return { ...c, dishes: newDishes };
      });
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
  };

  const deleteDish = (screenIndex: number, catIndex: number, dishIndex: number) => {
    if(!window.confirm('Удалить это блюдо?')) return;
    
    setConfig(prev => {
      const newScreens = [...prev.screens];
      const screen = { ...newScreens[screenIndex] } as MenuScreen;
      screen.categories = screen.categories.map((c, cIdx) => {
        if (cIdx !== catIndex) return c;
        const newDishes = c.dishes.filter((_, dIdx) => dIdx !== dishIndex);
        return { ...c, dishes: newDishes };
      });
      newScreens[screenIndex] = screen;
      return { ...prev, screens: newScreens };
    });
  };

  const moveScreen = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.screens.length - 1) return;
    
    setConfig(prev => {
        const newScreens = [...prev.screens];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newScreens[index], newScreens[swapIndex]] = [newScreens[swapIndex], newScreens[index]];
        return { ...prev, screens: newScreens };
    });
    
    setActiveScreenIndex(prev => direction === 'up' ? prev - 1 : prev + 1);
  };

  const currentScreen = config.screens[activeScreenIndex];

  return (
    <div className="flex flex-col h-screen bg-stone-900 text-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-stone-800 p-4 shadow-md flex justify-between items-center z-10 border-b border-stone-700">
        <h1 className="text-xl font-heading font-bold text-yellow-500 tracking-wider">GastroBoard Admin</h1>
        <div className="flex items-center space-x-4">
           <a href="#/" target="_blank" className="text-stone-400 hover:text-white text-sm transition">Открыть ТВ Вид</a>
           <button onClick={onLogout} className="bg-red-700 px-4 py-2 rounded text-sm hover:bg-red-600 transition font-bold uppercase">Выйти</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Screen List */}
        <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
            <div className="p-4 border-b border-stone-800">
                <h2 className="text-xs uppercase text-stone-500 font-bold mb-3 tracking-widest">Список экранов</h2>
                <div className="flex space-x-2">
                    <button onClick={() => addScreen('MENU')} className="flex-1 bg-stone-800 border border-stone-700 hover:border-green-600 hover:text-green-500 py-2 rounded text-xs transition uppercase font-bold">+ Меню</button>
                    <button onClick={() => addScreen('PROMO')} className="flex-1 bg-stone-800 border border-stone-700 hover:border-purple-600 hover:text-purple-500 py-2 rounded text-xs transition uppercase font-bold">+ Промо</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto admin-scroll">
                {config.screens.map((screen, idx) => (
                    <div 
                        key={screen.id}
                        onClick={() => setActiveScreenIndex(idx)}
                        className={`p-4 border-b border-stone-800 cursor-pointer flex justify-between items-center group transition-colors ${activeScreenIndex === idx ? 'bg-stone-800 border-l-4 border-yellow-500' : 'hover:bg-stone-800/50'}`}
                    >
                        <div className="truncate flex items-center">
                            <span className="text-xs font-mono bg-stone-950 px-1.5 py-0.5 rounded mr-3 text-stone-500">{idx + 1}</span>
                            <span className="text-sm font-heading font-medium tracking-wide">{screen.type === 'MENU' ? 'МЕНЮ' : 'ПРОМО'}</span>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'up'); }}
                                className="text-stone-500 hover:text-white px-1"
                             >↑</button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'down'); }}
                                className="text-stone-500 hover:text-white px-1"
                             >↓</button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-stone-950 p-8 admin-scroll">
            {currentScreen ? (
                <div className="max-w-5xl mx-auto">
                    {/* Screen Settings */}
                    <div className="bg-stone-900 rounded-xl p-6 mb-8 border border-stone-800 shadow-xl">
                        <div className="flex justify-between items-start mb-6 border-b border-stone-800 pb-4">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-stone-200">Экран {activeScreenIndex + 1}: Настройки</h2>
                                <span className="text-xs text-stone-500 uppercase font-bold tracking-wide">ID: {currentScreen.id}</span>
                            </div>
                            <button onClick={() => removeScreen(activeScreenIndex)} className="text-red-500 text-xs uppercase font-bold hover:text-red-400 border border-red-900/30 px-3 py-2 rounded bg-red-900/10 transition">Удалить экран</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Тип контента</label>
                                <div className="py-2.5 px-3 bg-stone-800 rounded text-stone-300 border border-stone-700 font-medium">{currentScreen.type}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Длительность (сек)</label>
                                <input 
                                    type="number" 
                                    min="5" 
                                    className="w-full bg-stone-950 border border-stone-700 rounded p-2.5 focus:border-yellow-600 focus:outline-none text-white transition focus:ring-1 focus:ring-yellow-600/50"
                                    value={currentScreen.duration}
                                    onChange={(e) => updateScreen(activeScreenIndex, { duration: parseInt(e.target.value) || 20 })}
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-stone-500 uppercase font-bold mb-2" title="Показывать на каждом N-м круге">Частота показа (Круги)</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        className="w-full bg-stone-950 border border-stone-700 rounded p-2.5 focus:border-yellow-600 focus:outline-none text-white transition focus:ring-1 focus:ring-yellow-600/50"
                                        value={currentScreen.frequency || 1}
                                        onChange={(e) => updateScreen(activeScreenIndex, { frequency: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <p className="text-[10px] text-stone-600 mt-1">1 = Всегда, 2 = Через раз</p>
                            </div>
                        </div>

                        {/* Promo Specific Fields */}
                        {currentScreen.type === 'PROMO' && (
                             <div className="mt-6 space-y-4 pt-4 border-t border-stone-800">
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Текст на экране</label>
                                    <textarea 
                                        className="w-full h-32 bg-stone-950 border border-stone-700 rounded p-3 focus:border-yellow-600 focus:outline-none font-heading text-lg text-white"
                                        value={(currentScreen as PromoScreen).text}
                                        onChange={(e) => updateScreen(activeScreenIndex, { text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Ссылка (QR)</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-stone-950 border border-stone-700 rounded p-3 focus:border-yellow-600 focus:outline-none font-mono text-sm text-yellow-500"
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
                             <div className="flex justify-between items-end mb-6">
                                <h3 className="text-xl font-heading font-bold uppercase text-stone-400">Содержание меню</h3>
                                <button onClick={() => addCategory(activeScreenIndex)} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-wide transition shadow-lg shadow-yellow-900/20">
                                    + Добавить категорию
                                </button>
                             </div>

                             <div className="space-y-4">
                                {(currentScreen as MenuScreen).categories.map((cat, catIdx) => (
                                    <div key={cat.id} className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800">
                                        <div 
                                            className="p-4 bg-stone-850 flex items-center justify-between cursor-pointer hover:bg-stone-800 transition select-none"
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            <div className="flex-1 mr-4">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-transparent border-b border-transparent hover:border-stone-600 focus:border-yellow-600 focus:outline-none text-2xl font-heading font-bold uppercase text-stone-200"
                                                    value={cat.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateCategory(activeScreenIndex, catIdx, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                 <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">{cat.dishes.length} позиций</span>
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteCategory(activeScreenIndex, catIdx); }}
                                                    className="text-stone-600 hover:text-red-500 px-2 transition"
                                                 >✕</button>
                                                 <span className="text-stone-500 transform transition-transform duration-200" style={{ transform: expandedCategories.has(cat.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                            </div>
                                        </div>

                                        {expandedCategories.has(cat.id) && (
                                            <div className="p-4 bg-stone-950/50 border-t border-stone-800">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="text-stone-500 uppercase text-xs font-bold border-b border-stone-800">
                                                            <th className="pb-3 pl-2 w-5/12">Название</th>
                                                            <th className="pb-3 w-2/12">Вес</th>
                                                            <th className="pb-3 w-2/12">Цена</th>
                                                            <th className="pb-3 w-2/12 text-center">½ Порции</th>
                                                            <th className="pb-3 w-1/12"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cat.dishes.map((dish, dishIdx) => (
                                                            <tr key={dish.id} className="group hover:bg-stone-800/40 transition-colors">
                                                                <td className="py-2 pr-2 pl-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-stone-800 focus:border-yellow-600 focus:outline-none font-heading uppercase text-stone-300"
                                                                        value={dish.name}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { name: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-stone-800 focus:border-yellow-600 focus:outline-none text-stone-400"
                                                                        value={dish.weight}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { weight: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full bg-transparent border-b border-stone-800 focus:border-yellow-600 focus:outline-none text-yellow-500 font-bold"
                                                                        value={dish.price}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { price: parseFloat(e.target.value) || 0 })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={dish.isHalfPortion}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { isHalfPortion: e.target.checked })}
                                                                        className="w-4 h-4 rounded bg-stone-700 border-stone-600 text-yellow-600 focus:ring-yellow-600"
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-right">
                                                                    <button 
                                                                        onClick={() => deleteDish(activeScreenIndex, catIdx, dishIdx)}
                                                                        className="text-stone-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                                                    >✕</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {/* Add Dish Row */}
                                                        <tr>
                                                            <td colSpan={5} className="pt-4">
                                                                <button 
                                                                    onClick={() => addDish(activeScreenIndex, catIdx)}
                                                                    className="w-full py-2 border border-dashed border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300 rounded text-xs uppercase font-bold transition hover:bg-stone-800/30"
                                                                >
                                                                    + Добавить позицию
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
                <div className="h-full flex flex-col items-center justify-center text-stone-600">
                    <p className="text-xl font-heading uppercase">Выберите экран слева</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;