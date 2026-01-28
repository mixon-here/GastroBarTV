import React from 'react';
import { PromoScreen } from '../types';

interface PromoBoardProps {
  screen: PromoScreen;
}

const PromoBoard: React.FC<PromoBoardProps> = ({ screen }) => {
  // Using a reliable public API for generating the QR code image
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(screen.qrUrl)}&color=000000&bgcolor=ffffff`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-[#0c0a09] animate-fade-in">
      <div className="text-center max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-black text-stone-100 mb-16 leading-tight whitespace-pre-wrap uppercase tracking-wider">
          {screen.text}
        </h1>
        
        <div className="inline-block p-6 border-8 border-stone-800 rounded-3xl bg-white shadow-2xl shadow-yellow-900/20">
            <img 
                src={qrImageSrc} 
                alt="QR Code" 
                className="w-80 h-80 md:w-[500px] md:h-[500px] object-contain rendering-pixelated"
            />
        </div>
        
        <p className="mt-12 text-stone-500 text-2xl font-medium uppercase tracking-widest">
            Наведите камеру телефона
        </p>
      </div>
    </div>
  );
};

export default PromoBoard;