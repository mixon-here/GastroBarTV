import React from 'react';
import { MenuScreen, Dish } from '../types';

interface MenuBoardProps {
  screen: MenuScreen;
}

const DishRow: React.FC<{ dish: Dish }> = ({ dish }) => {
  const weightNum = parseInt(dish.weight);
  
  let displayWeight = dish.weight;
  let displayPrice = `${dish.price}`;

  if (dish.isHalfPortion) {
    if (!isNaN(weightNum)) {
      displayWeight = `${weightNum}/${Math.round(weightNum / 2)}г`;
    } else {
      displayWeight = `${dish.weight}/½`;
    }
    displayPrice = `${dish.price}/${Math.round(dish.price / 2)}`;
  }

  return (
    <div className="flex items-end justify-between py-1 mb-2 w-full">
      {/* Name Section - Bebas Neue */}
      <div className="shrink-0 max-w-[65%]">
        <span className="text-[3.5vh] font-display font-medium tracking-widest text-[#F2F0E6] uppercase leading-none drop-shadow-md">
          {dish.name}
        </span>
      </div>

      {/* Dots Leader - Custom CSS */}
      <div className="grow mx-3 mb-2 dots-leader opacity-30 relative top-[-0.6vh]"></div>
      
      {/* Price & Weight Section */}
      <div className="shrink-0 flex items-center space-x-5 whitespace-nowrap">
        <span className="text-[2.2vh] text-stone-400 font-medium font-sans mt-1">
          {displayWeight}
        </span>
        <span className="text-[3.8vh] font-display font-bold text-yellow-500 leading-none tracking-wide">
          {displayPrice} <span className="text-[2.5vh] text-stone-500 align-top">₽</span>
        </span>
      </div>
    </div>
  );
};

const MenuBoard: React.FC<MenuBoardProps> = ({ screen }) => {
  const scale = screen.contentScale || 1;
  const rotation = screen.rotation || 0;
  
  // Logic to handle rotation container sizing
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
    <div className="w-screen h-screen bg-[#0c0a09] overflow-hidden animate-fade-in relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 to-black">
      {/* Wrapper for Rotation and Scaling */}
      <div style={containerStyle}>
        <div className="w-[90%] flex flex-col justify-center h-auto max-h-full">
          <div className="flex flex-col gap-[6vh]">
            {screen.categories.map((cat) => (
              <div key={cat.id} className="flex flex-col">
                {/* Category Title - Bebas Neue */}
                <div className="flex items-center mb-[2vh]">
                    <div className="h-[4vh] w-1.5 bg-yellow-600 mr-4 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                    <h2 className="text-[6.5vh] font-display font-normal text-[#F2F0E6] uppercase tracking-[0.1em] leading-none drop-shadow-xl">
                    {cat.title}
                    </h2>
                </div>
                
                {/* Dishes List */}
                <div className="space-y-1 w-full">
                  {cat.dishes.map((dish) => (
                    <DishRow key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBoard;