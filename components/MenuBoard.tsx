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
    <div className="flex items-end justify-between py-3 mb-2 w-full group border-b border-stone-800/30 last:border-0">
      {/* Name Section */}
      <div className="shrink-0 max-w-[50%]">
        <span className="font-heading text-4xl md:text-5xl font-medium tracking-wide text-stone-100 uppercase leading-none block pb-1">
          {dish.name}
        </span>
      </div>

      {/* Dots Leader */}
      <div className="grow mx-6 mb-3 border-b-0 relative top-[-2px]">
         <div className="dots-leader opacity-50 w-full"></div>
      </div>
      
      {/* Price & Weight Section */}
      <div className="shrink-0 flex items-baseline space-x-8 whitespace-nowrap">
        <span className="text-2xl md:text-3xl text-stone-300 font-normal tracking-wide opacity-90">
          {displayWeight}
        </span>
        <span className="font-heading text-4xl md:text-5xl font-bold text-yellow-500 leading-none">
          {displayPrice}<span className="text-3xl ml-1 text-stone-500 font-normal">₽</span>
        </span>
      </div>
    </div>
  );
};

const MenuBoard: React.FC<MenuBoardProps> = ({ screen }) => {
  return (
    <div className="w-full h-full px-8 md:px-16 py-8 flex flex-col justify-center animate-cinematic bg-[#0c0a09]">
      <div className="flex flex-col h-full justify-center gap-12 max-w-full mx-auto w-full">
        {screen.categories.map((cat) => (
          <div key={cat.id} className="flex flex-col">
            {/* Category Title */}
            <div className="flex items-center mb-6 border-l-4 border-yellow-600 pl-4">
                <h2 className="font-heading text-5xl md:text-7xl font-bold text-stone-200 uppercase tracking-wide">
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
  );
};

export default MenuBoard;