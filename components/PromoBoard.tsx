import React from 'react';
import { PromoScreen } from '../types';

interface PromoBoardProps {
  screen: PromoScreen;
}

const PromoBoard: React.FC<PromoBoardProps> = ({ screen }) => {
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(screen.qrUrl)}&color=000000&bgcolor=ffffff`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0c0a09] animate-cinematic p-8 md:p-16">
      <div className="w-full h-full flex flex-col items-center justify-center border-4 border-stone-800/50 rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-5xl flex flex-col items-center justify-between h-full max-h-[85vh]">
          
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-stone-100 leading-tight whitespace-pre-wrap uppercase tracking-wide mb-8">
            {screen.text}
          </h1>
          
          <div className="flex-1 flex items-center justify-center min-h-0 my-4">
            <div className="inline-block p-4 md:p-6 border-4 border-stone-800 rounded-2xl bg-white shadow-2xl shadow-black/50 aspect-square h-auto max-h-[40vh] md:max-h-[50vh]">
                <img 
                    src={qrImageSrc} 
                    alt="QR Code" 
                    className="w-full h-full object-contain rendering-pixelated"
                />
            </div>
          </div>
          
          <div className="mt-8 flex items-center space-x-3 text-stone-500 bg-stone-900/50 px-6 py-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-xl md:text-2xl font-medium uppercase tracking-widest font-heading">
                  Наведите камеру
              </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBoard;