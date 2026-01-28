import React, { useState, useEffect } from 'react';
import { AppConfig, ScreenItem, MenuScreen, PromoScreen, Category, Dish, User } from '../types';
import { saveData, generateId } from '../services/dataService';

interface AdminPanelProps {
  initialConfig: AppConfig;
  currentUser: User;
  onUpdate: (config: AppConfig) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialConfig, currentUser, onUpdate, onLogout }) => {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'SCREENS' | 'USERS'>('SCREENS');
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Local state for adding new user
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'OPERATOR' as 'ADMIN' | 'OPERATOR' });

  useEffect(() => {
    saveData(config);
    onUpdate(config);
  }, [config, onUpdate]);

  // --- Screen Handlers ---
  const addScreen = (type: 'MENU' | 'PROMO') => {
    const newScreen: ScreenItem = type === 'MENU' 
      ? { id: generateId(), type: 'MENU', duration: config.defaultDuration, contentScale: 1, rotation: 0, categories: [] }
      : { id: generateId(), type: 'PROMO', duration: config.defaultDuration, contentScale: 1, rotation: 0, text: 'ЗАГОЛОВОК АКЦИИ', qrUrl: 'https://example.com' };

    setConfig(prev => ({ ...prev, screens: [...prev.screens, newScreen] }));
    setActiveScreenIndex(config.screens.length);
  };

  const removeScreen = (index: number) => {
    if (window.confirm('Удалить этот экран?')) {
      const newScreens = [...config.screens];
      newScreens.splice(index, 1);
      setConfig(prev => ({ ...prev, screens: newScreens }));
      setActiveScreenIndex(prev => Math.max(0, Math.min(prev, newScreens.length - 1)));
    }
  };

  const updateScreen = (index: number, updates: Partial<ScreenItem>) => {
    const newScreens = [...config.screens];
    newScreens[index] = { ...newScreens[index], ...updates } as ScreenItem;
    setConfig(prev => ({ ...prev, screens: newScreens }));
  };

  // --- Menu Handlers ---
  const addCategory = (screenIndex: number) => {
    const screen = config.screens[screenIndex] as MenuScreen;
    const newCat: Category = { id: generateId(), title: 'НОВАЯ КАТЕГОРИЯ', dishes: [] };
    const newCats = [...screen.categories, newCat];
    updateScreen(screenIndex, { categories: newCats });
    setExpandedCategories(prev => new Set(prev).add(newCat.id));
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
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === config.screens.length - 1)) return;
    const newScreens = [...config.screens];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newScreens[index], newScreens[swapIndex]] = [newScreens[swapIndex], newScreens[index]];
    setConfig(prev => ({ ...prev, screens: newScreens }));
    setActiveScreenIndex(swapIndex);
  };

  // --- User Handlers ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    const user: User = { id: generateId(), ...newUser };
    setConfig(prev => ({ ...prev, users: [...prev.users, user] }));
    setNewUser({ username: '', password: '', role: 'OPERATOR' });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert("Нельзя удалить самого себя!");
      return;
    }
    if (window.confirm('Удалить пользователя?')) {
      setConfig(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
    }
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    setConfig(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, password: newPass } : u)
    }));
  };

  const currentScreen = config.screens[activeScreenIndex];

  return (
    <div className="flex flex-col h-screen bg-stone-900 text-stone-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-stone-800 p-4 shadow-md flex justify-between items-center z-10 border-b border-stone-700">
        <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-yellow-500 tracking-wider">GastroBoard Admin</h1>
            <nav className="flex space-x-1 bg-stone-900 rounded p-1">
                <button 
                    onClick={() => setActiveTab('SCREENS')}
                    className={`px-4 py-1 rounded text-sm transition ${activeTab === 'SCREENS' ? 'bg-stone-700 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}
                >Экраны</button>
                {currentUser.role === 'ADMIN' && (
                    <button 
                        onClick={() => setActiveTab('USERS')}
                        className={`px-4 py-1 rounded text-sm transition ${activeTab === 'USERS' ? 'bg-stone-700 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}
                    >Пользователи</button>
                )}
            </nav>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-xs text-stone-500 uppercase font-bold">{currentUser.username} ({currentUser.role})</span>
           <a href="#/" target="_blank" className="text-blue-400 hover:text-blue-300 text-sm">ТВ Вид →</a>
           <button onClick={onLogout} className="bg-red-900/50 text-red-200 px-4 py-2 rounded text-sm hover:bg-red-900 transition border border-red-800">Выйти</button>
        </div>
      </header>

      {activeTab === 'SCREENS' ? (
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-stone-800 border-r border-stone-700 flex flex-col">
            <div className="p-4 border-b border-stone-700">
                <h2 className="text-xs uppercase text-stone-500 font-bold mb-3 tracking-wider">Список экранов</h2>
                <div className="flex space-x-2">
                    <button onClick={() => addScreen('MENU')} className="flex-1 bg-stone-700 hover:bg-stone-600 border border-stone-600 py-2 rounded text-xs font-bold transition">+ МЕНЮ</button>
                    <button onClick={() => addScreen('PROMO')} className="flex-1 bg-stone-700 hover:bg-stone-600 border border-stone-600 py-2 rounded text-xs font-bold transition">+ ПРОМО</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto admin-scroll">
                {config.screens.map((screen, idx) => (
                    <div 
                        key={screen.id}
                        onClick={() => setActiveScreenIndex(idx)}
                        className={`p-3 border-b border-stone-700 cursor-pointer flex justify-between items-center group transition ${activeScreenIndex === idx ? 'bg-stone-700 border-l-4 border-yellow-500' : 'hover:bg-stone-700/50'}`}
                    >
                        <div className="truncate flex items-center">
                            <span className="text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded mr-3 text-stone-500">{idx + 1}</span>
                            <span className="text-sm font-medium text-stone-300">{screen.type === 'MENU' ? 'Меню' : 'Промо'}</span>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'up'); }} className="text-stone-500 hover:text-white px-1">↑</button>
                             <button onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'down'); }} className="text-stone-500 hover:text-white px-1">↓</button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto bg-stone-900 p-8 admin-scroll">
            {currentScreen ? (
                <div className="max-w-4xl mx-auto">
                    {/* Screen Settings */}
                    <div className="bg-stone-800 rounded-xl p-6 mb-8 shadow-xl border border-stone-700">
                        <div className="flex justify-between items-start mb-6 border-b border-stone-700 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-stone-200">Настройки экрана #{activeScreenIndex + 1}</h2>
                                <p className="text-xs text-stone-500 mt-1">Здесь настраивается время показа, поворот и размер контента</p>
                            </div>
                            <button onClick={() => removeScreen(activeScreenIndex)} className="text-red-400 text-xs uppercase hover:text-red-300 hover:underline border border-red-900/50 px-3 py-1 rounded">Удалить экран</button>
                        </div>
                        
                        {/* Rotation & Scale Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-black/20 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs text-yellow-600 uppercase font-bold mb-2">Длительность (сек)</label>
                                <input 
                                    type="number" min="5" 
                                    className="w-full bg-stone-900 border border-stone-600 rounded p-2 focus:border-yellow-600 focus:outline-none text-stone-200 font-mono text-lg"
                                    value={currentScreen.duration}
                                    onChange={(e) => updateScreen(activeScreenIndex, { duration: parseInt(e.target.value) || 20 })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-yellow-600 uppercase font-bold mb-2">Поворот экрана</label>
                                <select 
                                    className="w-full bg-stone-900 border border-stone-600 rounded p-2 focus:border-yellow-600 focus:outline-none text-stone-200"
                                    value={currentScreen.rotation || 0}
                                    onChange={(e) => updateScreen(activeScreenIndex, { rotation: parseInt(e.target.value) as any })}
                                >
                                    <option value={0}>0° (Горизонтально)</option>
                                    <option value={90}>90° (Вертикально по час.)</option>
                                    <option value={180}>180° (Перевернуто)</option>
                                    <option value={270}>270° (Вертикально пр. час.)</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-xs text-yellow-600 uppercase font-bold">Zoom (Масштаб)</label>
                                    <span className="text-xs text-stone-400 font-mono">{(currentScreen.contentScale || 1).toFixed(2)}x</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="1.5" step="0.05"
                                    className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                                    value={currentScreen.contentScale || 1}
                                    onChange={(e) => updateScreen(activeScreenIndex, { contentScale: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        {currentScreen.type === 'PROMO' && (
                             <div className="space-y-6">
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Текст заголовка</label>
                                    <textarea 
                                        className="w-full h-24 bg-black/20 border border-stone-600 rounded p-3 focus:border-yellow-600 focus:outline-none font-sans text-sm text-stone-200"
                                        value={(currentScreen as PromoScreen).text}
                                        onChange={(e) => updateScreen(activeScreenIndex, { text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase font-bold mb-2">Ссылка (QR код генерируется автоматически)</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-black/20 border border-stone-600 rounded p-3 focus:border-yellow-600 focus:outline-none font-mono text-sm text-stone-200"
                                        value={(currentScreen as PromoScreen).qrUrl}
                                        onChange={(e) => updateScreen(activeScreenIndex, { qrUrl: e.target.value })}
                                    />
                                </div>
                             </div>
                        )}
                    </div>

                    {currentScreen.type === 'MENU' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold uppercase text-stone-500 tracking-wider">Категории меню</h3>
                                <button onClick={() => addCategory(activeScreenIndex)} className="bg-yellow-700/80 hover:bg-yellow-600 text-yellow-100 font-bold py-2 px-4 rounded text-xs uppercase transition shadow">
                                    + Категория
                                </button>
                             </div>

                             <div className="space-y-4">
                                {(currentScreen as MenuScreen).categories.map((cat, catIdx) => (
                                    <div key={cat.id} className="bg-stone-800 rounded-lg overflow-hidden border border-stone-700 shadow-md">
                                        <div 
                                            className="p-4 bg-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-750 transition border-b border-stone-700/50"
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            <div className="flex-1 mr-6">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-transparent border-b border-transparent hover:border-stone-600 focus:border-yellow-600 focus:outline-none text-lg font-bold uppercase text-yellow-500 placeholder-stone-600"
                                                    value={cat.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateCategory(activeScreenIndex, catIdx, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                 <span className="text-xs text-stone-500 font-mono">{cat.dishes.length} поз.</span>
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteCategory(activeScreenIndex, catIdx); }}
                                                    className="text-stone-600 hover:text-red-400 transition"
                                                 >✕</button>
                                            </div>
                                        </div>

                                        {expandedCategories.has(cat.id) && (
                                            <div className="p-4 bg-black/20">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-700">
                                                            <th className="pb-2 pl-2 w-5/12 font-medium">Название</th>
                                                            <th className="pb-2 w-2/12 font-medium">Вес</th>
                                                            <th className="pb-2 w-2/12 font-medium">Цена</th>
                                                            <th className="pb-2 w-2/12 text-center font-medium">½ Порц.</th>
                                                            <th className="pb-2 w-1/12"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cat.dishes.map((dish, dishIdx) => (
                                                            <tr key={dish.id} className="group hover:bg-white/5 transition-colors">
                                                                <td className="py-2 pl-2 pr-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-stone-800 group-hover:border-stone-600 focus:border-yellow-600 focus:outline-none py-1 text-stone-300"
                                                                        value={dish.name}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { name: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full bg-transparent border-b border-stone-800 group-hover:border-stone-600 focus:border-yellow-600 focus:outline-none py-1 text-stone-400 text-xs"
                                                                        value={dish.weight}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { weight: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-2">
                                                                    <input 
                                                                        type="number" 
                                                                        className="w-full bg-transparent border-b border-stone-800 group-hover:border-stone-600 focus:border-yellow-600 focus:outline-none py-1 text-yellow-500 font-bold"
                                                                        value={dish.price}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { price: parseFloat(e.target.value) || 0 })}
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={dish.isHalfPortion}
                                                                        onChange={(e) => updateDish(activeScreenIndex, catIdx, dishIdx, { isHalfPortion: e.target.checked })}
                                                                        className="w-4 h-4 rounded bg-stone-700 border-stone-600 text-yellow-600 focus:ring-offset-stone-900"
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-right pr-2">
                                                                    <button 
                                                                        onClick={() => deleteDish(activeScreenIndex, catIdx, dishIdx)}
                                                                        className="text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                    >✕</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td colSpan={5} className="pt-4">
                                                                <button 
                                                                    onClick={() => addDish(activeScreenIndex, catIdx)}
                                                                    className="w-full py-2 border border-dashed border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300 rounded text-xs uppercase transition tracking-wide"
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
                <div className="h-full flex flex-col items-center justify-center text-stone-600">
                    <p className="text-xl">Выберите экран в меню слева</p>
                </div>
            )}
        </main>
      </div>
      ) : (
        // USERS MANAGEMENT TAB
        <div className="flex-1 bg-stone-900 p-8 admin-scroll overflow-y-auto">
             <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-stone-200 mb-8">Управление пользователями</h2>
                
                {/* Add User Form */}
                <div className="bg-stone-800 p-6 rounded-lg mb-8 border border-stone-700">
                    <h3 className="text-sm font-bold text-stone-400 uppercase mb-4">Добавить нового сотрудника</h3>
                    <form onSubmit={handleAddUser} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs text-stone-500 mb-1">Логин</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/30 border border-stone-600 rounded p-2 text-white focus:border-yellow-600 outline-none"
                                value={newUser.username}
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                placeholder="Например: manager"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-stone-500 mb-1">Пароль</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/30 border border-stone-600 rounded p-2 text-white focus:border-yellow-600 outline-none"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                placeholder="Пароль"
                            />
                        </div>
                        <div className="w-40">
                             <label className="block text-xs text-stone-500 mb-1">Роль</label>
                             <select 
                                className="w-full bg-black/30 border border-stone-600 rounded p-2 text-white focus:border-yellow-600 outline-none"
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                             >
                                 <option value="OPERATOR">Оператор</option>
                                 <option value="ADMIN">Админ</option>
                             </select>
                        </div>
                        <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded transition">
                            Добавить
                        </button>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-stone-800 rounded-lg border border-stone-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-stone-500 text-xs uppercase">
                            <tr>
                                <th className="p-4">Пользователь</th>
                                <th className="p-4">Роль</th>
                                <th className="p-4">Пароль</th>
                                <th className="p-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-700">
                            {config.users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5">
                                    <td className="p-4 font-bold text-stone-300">{user.username}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded border ${user.role === 'ADMIN' ? 'border-red-900 bg-red-900/20 text-red-300' : 'border-blue-900 bg-blue-900/20 text-blue-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="text" 
                                            value={user.password}
                                            onChange={(e) => handleUpdateUserPassword(user.id, e.target.value)}
                                            className="bg-transparent border-b border-stone-700 focus:border-yellow-600 outline-none text-stone-400 text-sm w-32"
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-stone-500 hover:text-red-500 text-sm"
                                            disabled={user.id === currentUser.id}
                                        >
                                            {user.id === currentUser.id ? '(Вы)' : 'Удалить'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;