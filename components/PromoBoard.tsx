import React from 'react';
import { PromoScreen } from '../types';

interface PromoBoardProps {
  screen: PromoScreen;
}

const PromoBoard: React.FC<PromoBoardProps> = ({ screen }) => {
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(screen.qrUrl)}&color=000000&bgcolor=ffffff`;
  const scale = screen.contentScale || 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0c0a09] animate-fade-in overflow-hidden">
      <div 
        className="text-center w-[85%] flex flex-col items-center"
        style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center'
        }}
      >
        <h1 className="text-[6vh] md:text-[8vh] font-display font-bold text-stone-100 mb-[6vh] leading-tight whitespace-pre-wrap uppercase tracking-wider">
          {screen.text}
        </h1>
        
        <div className="inline-block p-[2vh] border-[0.8vh] border-stone-800 rounded-3xl bg-white shadow-2xl shadow-yellow-900/20">
            <img 
                src={qrImageSrc} 
                alt="QR Code" 
                className="w-[35vh] h-[35vh] object-contain rendering-pixelated"
            />
        </div>
        
        <p className="mt-[6vh] text-stone-500 text-[3vh] font-medium uppercase tracking-widest font-display">
            Наведите камеру телефона
        </p>
      </div>
    </div>
  );
};

export default PromoBoard;