import React, { useState } from 'react';
import { AppConfig, User } from '../types';

interface LoginProps {
  config: AppConfig;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ config, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = config.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09]">
      <div className="bg-stone-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-stone-800">
        <h2 className="text-3xl font-bold text-yellow-500 mb-8 text-center uppercase tracking-widest">Вход</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <label className="block text-stone-400 text-xs font-bold mb-2 uppercase">Пользователь</label>
             <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="w-full p-3 bg-black text-white border border-stone-700 rounded focus:outline-none focus:border-yellow-600 transition"
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-bold mb-2 uppercase">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full p-3 bg-black text-white border border-stone-700 rounded focus:outline-none focus:border-yellow-600 transition"
              placeholder="••••••"
            />
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition transform active:scale-[0.98] uppercase tracking-wider"
          >
            Войти
          </button>
        </form>
        <div className="mt-6 text-center border-t border-stone-800 pt-4">
            <p className="text-stone-600 text-xs">Доступ по умолчанию:</p>
            <p className="text-stone-500 text-xs">admin / 123</p>
            <p className="text-stone-500 text-xs">operator / 123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;