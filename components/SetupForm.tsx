import React, { useState } from 'react';
import { DifficultyLevel, GameConfig } from '../types';

interface SetupFormProps {
  onStart: (config: GameConfig) => void;
}

const STYLES = [
  "Minimalist Flat Design",
  "Watercolor Illustration",
  "Digital Painting",
  "Simple Vector Iconography",
  "Detailed Photography",
  "Pixel Art",
  "Cyberpunk Neon"
];

const PALETTES = [
  "Bright and Saturated",
  "Earthy Tones",
  "Monochromatic Blue",
  "Pastel Dreams",
  "Dark & Moody",
  "Vibrant Neon"
];

const SetupForm: React.FC<SetupFormProps> = ({ onStart }) => {
  const [style, setStyle] = useState(STYLES[1]); // Default to Watercolor
  const [palette, setPalette] = useState(PALETTES[1]); // Default to Earthy
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.B1);
  const [pairCount, setPairCount] = useState(6); // Default to 6 for quicker start

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ style, palette, level, pairCount });
  };

  return (
    <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          MindMatch AI
        </h1>
        <p className="text-slate-400">Design your own memory game powered by Gemini</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Style Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Visual Style</label>
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-100 transition-all"
            >
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Palette Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Color Palette</label>
            <select 
              value={palette} 
              onChange={(e) => setPalette(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-100 transition-all"
            >
              {PALETTES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Complexity Level</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-100 transition-all"
            >
              {Object.values(DifficultyLevel).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <p className="text-xs text-slate-500 px-1">
              Determines how abstract or detailed the images will be.
            </p>
          </div>

          {/* Grid Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Grid Size</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPairCount(6)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${pairCount === 6 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
              >
                12 Cards (Quick)
              </button>
              <button
                type="button"
                onClick={() => setPairCount(12)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${pairCount === 12 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
              >
                24 Cards (Full)
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
        >
          Generate Game Assets
        </button>
      </form>
    </div>
  );
};

export default SetupForm;
