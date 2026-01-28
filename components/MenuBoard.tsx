import React from 'react';
import { MenuScreen, Dish } from '../types';

interface MenuBoardProps {
  screen: MenuScreen;
}

const DishRow: React.FC<{ dish: Dish }> = ({ dish }) => {
  // Logic for half portions display
  // Try to parse weight to number for calculation, otherwise append /2 logic visually if simple
  const weightNum = parseInt(dish.weight);
  
  let displayWeight = dish.weight;
  let displayPrice = `${dish.price}`;

  if (dish.isHalfPortion) {
    // If weight is "350г", we try to make it "350/175г"
    if (!isNaN(weightNum)) {
      displayWeight = `${weightNum}/${Math.round(weightNum / 2)}г`;
    } else {
      // Fallback if weight is text like "1 шт"
      displayWeight = `${dish.weight}/½`;
    }

    // Price: "300/150"
    displayPrice = `${dish.price}/${Math.round(dish.price / 2)}`;
  }

  return (
    <div className="flex items-end justify-between py-2 mb-4 w-full">
      {/* Name Section */}
      <div className="shrink-0 max-w-[50%]">
        <span className="text-3xl md:text-4xl font-bold tracking-wide text-stone-100 uppercase leading-none">
          {dish.name}
        </span>
      </div>

      {/* Dots Leader */}
      <div className="grow mx-4 mb-2 border-b-4 border-dotted border-stone-600 opacity-60 relative top-[-6px]"></div>
      
      {/* Price & Weight Section */}
      <div className="shrink-0 flex items-center space-x-6 whitespace-nowrap">
        <span className="text-2xl md:text-3xl text-stone-400 font-medium">
          {displayWeight}
        </span>
        <span className="text-3xl md:text-4xl font-bold text-yellow-500">
          {displayPrice} <span className="font-bold text-stone-400">₽</span>
        </span>
      </div>
    </div>
  );
};

const MenuBoard: React.FC<MenuBoardProps> = ({ screen }) => {
  return (
    <div className="w-full h-full p-8 md:p-16 flex flex-col justify-center animate-fade-in bg-[#0c0a09]">
      <div className="flex flex-col h-full justify-center gap-16 max-w-[90%] mx-auto w-full">
        {screen.categories.map((cat) => (
          <div key={cat.id} className="flex flex-col">
            {/* Category Title */}
            <div className="flex items-center mb-10">
                <div className="h-10 w-2 bg-yellow-600 mr-4 rounded-full"></div>
                <h2 className="text-5xl md:text-6xl font-black text-stone-200 uppercase tracking-widest shadow-black drop-shadow-lg">
                {cat.title}
                </h2>
            </div>
            
            {/* Dishes List */}
            <div className="space-y-2 w-full">
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