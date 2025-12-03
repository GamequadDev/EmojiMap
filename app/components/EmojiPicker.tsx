import React from 'react';
import { EmojiType } from '../types';
import { AVAILABLE_EMOJIS } from '../constants';

interface EmojiPickerProps {
  selected: EmojiType;
  onSelect: (emoji: EmojiType) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-2 p-2">
      {AVAILABLE_EMOJIS.map((item) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          className={`
            flex flex-col items-center justify-center p-2 rounded-lg transition-all
            ${selected === item.type 
              ? 'bg-blue-100 border-2 border-blue-500 shadow-sm transform scale-110' 
              : 'hover:bg-slate-100 border-2 border-transparent'
            }
          `}
          title={item.label}
        >
          <span className="text-2xl leading-none">{item.type}</span>
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;