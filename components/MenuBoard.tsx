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
      // Added spacing around the slash
      displayWeight = `${weightNum} / ${Math.round(weightNum / 2)}г`;
    } else {
      displayWeight = `${dish.weight} / ½`;
    }
    // Added spacing around the slash
    displayPrice = `${dish.price} / ${Math.round(dish.price / 2)}`;
  }

  return (
    <div className="flex items-end justify-between py-1 mb-2 w-full">
      {/* Name Section - Oswald Bold - Milky Color - Slightly Smaller */}
      <div className="shrink-0 max-w-[55%]">
        <span className="text-[3.3vh] font-display font-bold tracking-wide text-[#E4E2DD] uppercase leading-none drop-shadow-md block pt-1">
          {dish.name}
        </span>
      </div>

      {/* Dots Leader */}
      <div className="grow mx-3 mb-2 dots-leader opacity-20 relative top-[-0.6vh]"></div>
      
      {/* Price & Weight Section */}
      <div className="shrink-0 flex items-baseline justify-end whitespace-nowrap">
        {/* Weight Column - Fixed Width - Milky Grey */}
        <div className="w-[16vh] text-right mr-[1vh]">
            <span className="text-[2.2vh] text-[#9ca3af] font-display font-medium tracking-normal uppercase">
              {displayWeight}
            </span>
        </div>
        
        {/* Price Column - Fixed Width - Slightly Smaller */}
        <div className="w-[20vh] text-right">
            <span className="text-[3.8vh] font-display font-bold text-yellow-500 leading-none tracking-wide">
              {displayPrice} <span className="text-[2.8vh] text-yellow-500 font-bold align-top ml-1">₽</span>
            </span>
        </div>
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
          <div className="flex flex-col gap-[5vh]">
            {screen.categories.map((cat) => (
              <div key={cat.id} className="flex flex-col">
                {/* Category Title - Oswald - Milky Color */}
                <div className="flex items-center mb-[1.5vh]">
                    <div className="h-[4vh] w-1.5 bg-yellow-600 mr-4 rounded-sm shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>
                    <h2 className="text-[6vh] font-display font-bold text-[#F2F0E6] uppercase tracking-[0.05em] leading-none drop-shadow-xl">
                    {cat.title}
                    </h2>
                </div>
                
                {/* Dishes List */}
                <div className="space-y-0.5 w-full">
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