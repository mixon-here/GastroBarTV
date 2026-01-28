import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  expectedPassword?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, expectedPassword = 'admin' }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center uppercase tracking-widest">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded focus:outline-none focus:border-yellow-500 transition"
              placeholder="Введите пароль..."
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2">Неверный пароль</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition transform active:scale-95 uppercase"
          >
            Войти
          </button>
        </form>
        <div className="mt-4 text-center">
            <span className="text-gray-600 text-xs">По умолчанию: admin</span>
        </div>
      </div>
    </div>
  );
};

export default Login;