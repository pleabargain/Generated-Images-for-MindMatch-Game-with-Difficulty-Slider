import React from 'react';

interface LoadingScreenProps {
  progress: number;
  total: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, total }) => {
  const percentage = Math.round((progress / total) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md w-full text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
        ></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-indigo-400">
          {percentage}%
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Dreaming up your cards...</h2>
      <p className="text-slate-400 mb-6">
        Gemini is painting {total} unique images based on your style preferences.
        <br/>
        <span className="text-sm text-slate-500">Generating {progress} of {total} images...</span>
      </p>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
