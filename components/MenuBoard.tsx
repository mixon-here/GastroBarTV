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
      {/* Name Section - Oswald Font */}
      <div className="shrink-0 max-w-[60%]">
        <span className="text-[3.5vh] font-display font-semibold tracking-wide text-stone-100 uppercase leading-none">
          {dish.name}
        </span>
      </div>

      {/* Dots Leader */}
      <div className="grow mx-3 mb-2 border-b-4 border-dotted border-stone-600 opacity-50 relative top-[-0.6vh]"></div>
      
      {/* Price & Weight Section */}
      <div className="shrink-0 flex items-center space-x-6 whitespace-nowrap">
        <span className="text-[2.5vh] text-stone-400 font-medium font-sans mt-1">
          {displayWeight}
        </span>
        <span className="text-[3.5vh] font-bold text-yellow-500 font-sans leading-none">
          {displayPrice} <span className="font-bold text-stone-500 ml-1">₽</span>
        </span>
      </div>
    </div>
  );
};

const MenuBoard: React.FC<MenuBoardProps> = ({ screen }) => {
  const scale = screen.contentScale || 1;

  return (
    <div className="w-full h-full bg-[#0c0a09] flex flex-col items-center justify-center overflow-hidden animate-fade-in relative">
      {/* Scalable Container */}
      <div 
        className="w-[90%] flex flex-col justify-center"
        style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center',
            // Using max-height to ensure it respects screen boundaries
            maxHeight: '100vh',
            height: 'auto'
        }}
      >
        <div className="flex flex-col gap-[6vh]">
          {screen.categories.map((cat) => (
            <div key={cat.id} className="flex flex-col">
              {/* Category Title - Oswald */}
              <div className="flex items-center mb-[2vh]">
                  <div className="h-[5vh] w-2 bg-yellow-600 mr-4 rounded-full"></div>
                  <h2 className="text-[6vh] font-display font-bold text-stone-100 uppercase tracking-widest leading-none drop-shadow-lg">
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
  );
};

export default MenuBoard;