import { useState } from 'react';

interface FlagOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const FLAG_OPTIONS: FlagOption[] = [
  // Chardee MacDennis themed
  { value: 'red-wine', label: 'Thundermen', icon: '⚡', description: 'Up all night to get thunder' },
  { value: 'white-wine', label: 'Golden Geese', icon: '🪿', description: 'Honk if you\'re winning' },
  { value: 'golden-chalice', label: 'Electric Boogaloo', icon: '💃', description: 'Always Sunny pt. 2' },

  // Show themed
  { value: 'kitten-mittens', label: 'Kitten Mittens', icon: '🐱', description: 'You\'ll be smitten!' },
  { value: 'greenman', label: 'Green Man', icon: '💚', description: 'The legend himself' },
  { value: 'aluminum-monster', label: 'Aluminum Monster', icon: '🤖', description: 'Derivative!' },
  { value: 'cricket', label: 'Cricket', icon: '🦗', description: 'Street rat' },
  { value: 'rum-ham', label: 'Rum Ham', icon: '🍖', description: 'RUM HAM!' },
  { value: 'fight-milk', label: 'Fight Milk', icon: '🥛', description: 'For bodyguards' },
];

interface FlagSelectorProps {
  selectedFlag: string;
  onFlagSelect: (flag: string) => void;
}

export const FlagSelector = ({ selectedFlag, onFlagSelect }: FlagSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentFlag = FLAG_OPTIONS.find(f => f.value === selectedFlag) || FLAG_OPTIONS[0];

  return (
    <div className="relative">
      <label className="block text-yellow-300 font-bold mb-3 text-lg">
        🚩 SELECT YOUR FLAG
      </label>

      {/* Selected Flag Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-black border-2 border-yellow-700 rounded-lg text-yellow-100 font-semibold hover:border-yellow-400 focus:border-yellow-400 focus:outline-none flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentFlag.icon}</span>
          <div className="text-left">
            <div className="font-bold">{currentFlag.label}</div>
            <div className="text-xs text-yellow-300 italic">{currentFlag.description}</div>
          </div>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Options */}
      {isExpanded && (
        <div className="absolute z-10 w-full mt-2 bg-black border-4 border-yellow-600 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-2">
            {/* Chardee MacDennis Section */}
            <div className="mb-2">
              <div className="px-3 py-1 text-xs font-black text-yellow-400 border-b border-yellow-700">
                CHARDEE MACDENNIS FLAGS
              </div>
            </div>
            {FLAG_OPTIONS.slice(0, 3).map((flag) => (
              <button
                key={flag.value}
                type="button"
                onClick={() => {
                  onFlagSelect(flag.value);
                  setIsExpanded(false);
                }}
                className={`w-full px-4 py-3 mb-1 rounded-lg flex items-center gap-3 transition-all ${
                  selectedFlag === flag.value
                    ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400'
                    : 'bg-gradient-to-r from-red-950 to-black border-2 border-red-800 hover:border-yellow-600'
                }`}
              >
                <span className="text-2xl">{flag.icon}</span>
                <div className="text-left flex-1">
                  <div className={`font-bold ${selectedFlag === flag.value ? 'text-black' : 'text-yellow-300'}`}>
                    {flag.label}
                  </div>
                  <div className={`text-xs italic ${selectedFlag === flag.value ? 'text-yellow-900' : 'text-red-300'}`}>
                    {flag.description}
                  </div>
                </div>
                {selectedFlag === flag.value && (
                  <span className="text-xl">✓</span>
                )}
              </button>
            ))}

            {/* Show Themed Section */}
            <div className="mt-4 mb-2">
              <div className="px-3 py-1 text-xs font-black text-yellow-400 border-b border-yellow-700">
                THE GANG'S GREATEST HITS
              </div>
            </div>
            {FLAG_OPTIONS.slice(3).map((flag) => (
              <button
                key={flag.value}
                type="button"
                onClick={() => {
                  onFlagSelect(flag.value);
                  setIsExpanded(false);
                }}
                className={`w-full px-4 py-3 mb-1 rounded-lg flex items-center gap-3 transition-all ${
                  selectedFlag === flag.value
                    ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 border-2 border-yellow-400'
                    : 'bg-gradient-to-r from-red-950 to-black border-2 border-red-800 hover:border-yellow-600'
                }`}
              >
                <span className="text-2xl">{flag.icon}</span>
                <div className="text-left flex-1">
                  <div className={`font-bold ${selectedFlag === flag.value ? 'text-black' : 'text-yellow-300'}`}>
                    {flag.label}
                  </div>
                  <div className={`text-xs italic ${selectedFlag === flag.value ? 'text-yellow-900' : 'text-red-300'}`}>
                    {flag.description}
                  </div>
                </div>
                {selectedFlag === flag.value && (
                  <span className="text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
