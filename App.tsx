import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppConfig, MenuScreen, PromoScreen } from './types';
import { getData } from './services/dataService';
import MenuBoard from './components/MenuBoard';
import PromoBoard from './components/PromoBoard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

// TV View Component handled inside App to share state logic easier or keep it simple
const TVDisplay: React.FC<{ config: AppConfig }> = ({ config }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  // Track global cycles: starts at 1
  const [cycleCount, setCycleCount] = useState(1);
  const navigate = useNavigate();

  // Use a ref to prevent closure staleness in setTimeout if we didn't include everything in deps
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (config.screens.length === 0) return;

    // Safety check: ensure index is valid if screens were deleted
    if (currentScreenIndex >= config.screens.length) {
        setCurrentScreenIndex(0);
        return;
    }

    const currentScreen = config.screens[currentScreenIndex];
    const duration = (currentScreen.duration || config.defaultDuration) * 1000;

    const timer = setTimeout(() => {
      // Find the next screen that satisfies the frequency condition
      let nextIndex = currentScreenIndex;
      let nextCycle = cycleCount;
      let found = false;
      const screens = configRef.current.screens;

      // Protection loop to prevent infinite loop if no screens match (max 100 tries)
      for (let i = 0; i < screens.length * 5 + 1; i++) {
         nextIndex++;
         
         // Loop Wrap-around
         if (nextIndex >= screens.length) {
             nextIndex = 0;
             nextCycle++;
         }

         const candidateScreen = screens[nextIndex];
         const frequency = candidateScreen.frequency || 1;
         
         // Condition: (Cycle - 1) % Frequency === 0
         // Cycle 1, Freq 1 -> (0)%1=0 (Show)
         // Cycle 1, Freq 2 -> (0)%2=0 (Show first time) -> Actually, usually users want skip first time? 
         // Let's stick to standard modulo: Show on 1, 3, 5 for freq 2? 
         // Or Show on 2, 4, 6?
         // If logic is "Show every 2 loops", it usually implies "Show, Skip, Show".
         // Cycle 1: (0) % 2 = 0 (Show). Cycle 2: (1) % 2 = 1 (Skip). Cycle 3: (2) % 2 = 0 (Show).
         // This works nicely.
         
         if ((nextCycle - 1) % frequency === 0) {
             found = true;
             break;
         }
      }

      if (found) {
          setCycleCount(nextCycle);
          setCurrentScreenIndex(nextIndex);
      } else {
          // Fallback if nothing found (shouldn't happen unless list empty)
          setCurrentScreenIndex(0);
      }

    }, duration);

    return () => clearTimeout(timer);
  }, [currentScreenIndex, cycleCount, config]); // Re-run when index changes

  if (config.screens.length === 0) {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-stone-500 bg-[#0c0a09]">
            <p className="text-2xl mb-4 font-heading">НЕТ АКТИВНЫХ ЭКРАНОВ</p>
            <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-yellow-700 text-stone-100 font-bold rounded uppercase tracking-wider hover:bg-yellow-600 transition">
                Перейти в настройки
            </button>
        </div>
    );
  }

  const screen = config.screens[currentScreenIndex] || config.screens[0];

  return (
    <div className="h-screen w-screen bg-[#0c0a09] overflow-hidden relative selection:bg-yellow-500 selection:text-black">
        {/* Simple fade effect container */}
        <div key={`${screen.id}-${cycleCount}`} className="h-full w-full">
            {screen.type === 'MENU' ? (
                <MenuBoard screen={screen as MenuScreen} />
            ) : (
                <PromoBoard screen={screen as PromoScreen} />
            )}
        </div>
        
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-2 bg-stone-800 w-full z-10">
            <div 
                className="h-full bg-yellow-600 transition-all ease-linear shadow-[0_0_15px_rgba(202,138,4,0.6)]"
                style={{ 
                    width: '100%', 
                    transitionDuration: `${screen.duration || config.defaultDuration}s`,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left'
                }}
                ref={(el) => {
                    // Reset animation trick
                    if(el) {
                        el.style.transition = 'none';
                        el.style.transform = 'scaleX(1)';
                        setTimeout(() => {
                             el.style.transition = `transform ${screen.duration || config.defaultDuration}s linear`;
                             el.style.transform = 'scaleX(0)';
                        }, 50);
                    }
                }}
            />
        </div>

        {/* Secret Admin Button - Bottom Right */}
        <div 
            onClick={() => navigate('/admin')}
            className="absolute bottom-0 right-0 w-16 h-16 z-50 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group"
            title="Открыть панель управления"
        >
            <div className="bg-stone-800/80 p-3 rounded-tl-xl text-yellow-500 shadow-lg backdrop-blur-sm border-t border-l border-stone-700 group-hover:bg-stone-700/90 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-spin-slow">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>
    </div>
  );
};

// Protected Admin Route
const ProtectedAdmin: React.FC<{ config: AppConfig, onUpdate: (c: AppConfig) => void }> = ({ config, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session storage for persisting login during refresh
  useEffect(() => {
      if(sessionStorage.getItem('auth') === 'true') {
          setIsAuthenticated(true);
      }
  }, []);

  const handleLogin = () => {
      setIsAuthenticated(true);
      sessionStorage.setItem('auth', 'true');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('auth');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} expectedPassword={config.adminPassword} />;
  }

  return <AdminPanel initialConfig={config} onUpdate={onUpdate} onLogout={handleLogout} />;
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(getData());

  // Listen for storage events (other tabs updating data)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gastroboard_data_v1') {
        setConfig(getData());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleConfigUpdate = (newConfig: AppConfig) => {
    setConfig(newConfig);
    // Note: Local storage is already updated in AdminPanel, 
    // but updating state here triggers re-render for current tab
  };

  return (
    <HashRouter>
      <Routes>
        {/* The main TV display route */}
        <Route path="/" element={<TVDisplay config={config} />} />
        
        {/* Admin Panel route */}
        <Route path="/admin" element={<ProtectedAdmin config={config} onUpdate={handleConfigUpdate} />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;