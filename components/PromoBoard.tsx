import React from 'react';
import { PromoScreen } from '../types';

interface PromoBoardProps {
  screen: PromoScreen;
}

const PromoBoard: React.FC<PromoBoardProps> = ({ screen }) => {
  // Only show QR if URL is present and not empty/whitespace
  const hasQr = !!screen.qrUrl && screen.qrUrl.trim() !== '';
  const qrImageSrc = hasQr ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(screen.qrUrl)}&color=000000&bgcolor=ffffff` : '';
  
  const scale = screen.contentScale || 1;
  const rotation = screen.rotation || 0;

  const isPortrait = rotation === 90 || rotation === 270;

  const containerStyle: React.CSSProperties = {
    transform: `rotate(${rotation}deg) scale(${scale})`,
    width: isPortrait ? '100vh' : '100vw',
    height: isPortrait ? '100vw' : '100vh',
    position: 'absolute',
    top: '50%',
    left: '50%',
    translate: '-50% -50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0c0a09] animate-fade-in overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 to-black">
      <div style={containerStyle}>
        <div className="text-center w-[85%] flex flex-col items-center">
          <h1 className="text-[7vh] font-display font-medium text-[#F2F0E6] mb-[6vh] leading-tight whitespace-pre-wrap uppercase tracking-wider drop-shadow-lg">
            {screen.text}
          </h1>
          
          {hasQr && (
            <div className="inline-block p-[2vh] border-[0.5vh] border-stone-800 rounded-xl bg-white shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <img 
                    src={qrImageSrc} 
                    alt="QR Code" 
                    className="w-[35vh] h-[35vh] object-contain rendering-pixelated"
                />
            </div>
          )}
          
          {screen.footerText && (
            <p className="mt-[6vh] text-stone-400 text-[2.5vh] font-medium uppercase tracking-[0.2em] font-sans">
                {screen.footerText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBoard;