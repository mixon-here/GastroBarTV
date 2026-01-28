import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppConfig, MenuScreen, PromoScreen, User } from './types';
import { getData } from './services/dataService';
import MenuBoard from './components/MenuBoard';
import PromoBoard from './components/PromoBoard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

const TVDisplay: React.FC<{ config: AppConfig }> = ({ config }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(1); // Global loop counter, starts at 1
  const navigate = useNavigate();

  useEffect(() => {
    if (config.screens.length === 0) return;

    const currentScreen = config.screens[currentScreenIndex];
    const duration = (currentScreen.duration || config.defaultDuration) * 1000;

    const timer = setTimeout(() => {
        let nextIndex = currentScreenIndex + 1;
        let nextLoop = loopCount;
        let attempts = 0;
        const maxAttempts = config.screens.length * 10; // Safety break

        // Find next valid screen to show
        while (attempts < maxAttempts) {
            if (nextIndex >= config.screens.length) {
                nextIndex = 0;
                nextLoop++;
            }

            const candidateScreen = config.screens[nextIndex];
            const frequency = candidateScreen.displayFrequency || 1;
            
            // Logic: Show if (Loop Number - 1) % Frequency == 0
            // Loop 1 (freq 1): 0%1=0 (Show)
            // Loop 1 (freq 2): 0%2=0 (Show)
            // Loop 2 (freq 1): 1%1=0 (Show)
            // Loop 2 (freq 2): 1%2=1 (Skip)
            if ((nextLoop - 1) % frequency === 0) {
                setLoopCount(nextLoop);
                setCurrentScreenIndex(nextIndex);
                break;
            }
            
            nextIndex++;
            attempts++;
        }
        
        // Fallback if nothing found (should theoretically not happen if logic is sound)
        if (attempts >= maxAttempts) {
            setLoopCount(nextLoop + 1);
            setCurrentScreenIndex(0);
        }

    }, duration);

    return () => clearTimeout(timer);
  }, [currentScreenIndex, loopCount, config]);

  if (config.screens.length === 0) {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-stone-500 bg-[#0c0a09]">
            <p className="text-2xl mb-4">Нет активных экранов.</p>
            <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-yellow-600 text-black font-bold rounded">
                Перейти в админку
            </button>
        </div>
    );
  }

  const screen = config.screens[currentScreenIndex];

  return (
    <div className="h-screen w-screen bg-[#0c0a09] overflow-hidden relative selection:bg-yellow-500 selection:text-black">
        <div key={`${screen.id}-${loopCount}`} className="h-full w-full">
            {screen.type === 'MENU' ? (
                <MenuBoard screen={screen as MenuScreen} />
            ) : (
                <PromoBoard screen={screen as PromoScreen} />
            )}
        </div>
        
        <div className="absolute bottom-0 left-0 h-2 bg-stone-800 w-full z-10">
            <div 
                key={`${screen.id}-${loopCount}-progress`}
                className="h-full bg-yellow-600 transition-all ease-linear shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                style={{ 
                    width: '100%', 
                    transitionDuration: `${screen.duration || config.defaultDuration}s`,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left'
                }}
                ref={(el) => {
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

        <div 
            onClick={() => navigate('/admin')}
            className="absolute bottom-0 right-0 w-16 h-16 z-50 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 group"
        >
            <div className="bg-stone-800/80 p-3 rounded-tl-xl text-yellow-500 shadow-lg backdrop-blur-sm border-t border-l border-stone-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-spin-slow">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>
    </div>
  );
};

const ProtectedAdmin: React.FC<{ config: AppConfig, onUpdate: (c: AppConfig) => void }> = ({ config, onUpdate }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
      // Check for persisted session in session storage
      const savedSession = sessionStorage.getItem('authUser');
      if(savedSession) {
          try {
              const user = JSON.parse(savedSession);
              // Validate user still exists in config
              const validUser = config.users.find(u => u.id === user.id);
              if (validUser) {
                  setCurrentUser(validUser);
              } else {
                  sessionStorage.removeItem('authUser');
              }
          } catch (e) {
              sessionStorage.removeItem('authUser');
          }
      }
  }, [config.users]);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      sessionStorage.setItem('authUser', JSON.stringify(user));
  };

  const handleLogout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('authUser');
  };

  if (!currentUser) {
    return <Login config={config} onLogin={handleLogin} />;
  }

  return <AdminPanel initialConfig={config} currentUser={currentUser} onUpdate={onUpdate} onLogout={handleLogout} />;
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(getData());

  const handleConfigUpdate = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TVDisplay config={config} />} />
        <Route path="/admin" element={<ProtectedAdmin config={config} onUpdate={handleConfigUpdate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;