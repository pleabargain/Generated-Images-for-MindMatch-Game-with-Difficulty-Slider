import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { GameState, GameConfig, CardData } from './types';
import SetupForm from './components/SetupForm';
import LoadingScreen from './components/LoadingScreen';
import Card from './components/Card';
import { generateGameAssets } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardData[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [totalPairs, setTotalPairs] = useState<number>(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Start the game generation process
  const handleStartGame = async (config: GameConfig) => {
    setGameConfig(config);
    setGameState(GameState.GENERATING);
    setTotalPairs(config.pairCount);
    setProgress({ current: 0, total: config.pairCount });

    try {
      const assets = await generateGameAssets(config, (current, total) => {
        setProgress({ current, total });
      });

      // Duplicate and shuffle
      const deck: CardData[] = [];
      assets.forEach((asset, index) => {
        // Create two cards for each asset
        deck.push({
          id: `card-${index}-a`,
          imageUrl: asset.imageUrl,
          label: asset.label,
          isFlipped: false,
          isMatched: false
        });
        deck.push({
          id: `card-${index}-b`,
          imageUrl: asset.imageUrl,
          label: asset.label,
          isFlipped: false,
          isMatched: false
        });
      });

      // Fisher-Yates shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      setCards(deck);
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Something went wrong while generating the game. Please check your API key.");
      setGameState(GameState.SETUP);
    }
  };

  const handleCardClick = useCallback((clickedCard: CardData) => {
    // Prevent clicking if 2 cards are already flipped (waiting for timeout) or if clicking same card
    if (flippedCards.length >= 2 || flippedCards.some(c => c.id === clickedCard.id)) {
      return;
    }

    // Flip the clicked card
    const newCards = cards.map(card => 
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // Check match
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (first.label === second.label) {
        // Match found
        setMatchedPairs(prev => prev + 1);
        setCards(prev => prev.map(card => 
          card.label === first.label ? { ...card, isMatched: true, isFlipped: true } : card
        ));
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            (card.id === first.id || card.id === second.id) 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [cards, flippedCards]);

  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === totalPairs) {
      setTimeout(() => setGameState(GameState.FINISHED), 500);
    }
  }, [matchedPairs, totalPairs]);

  const resetGame = () => {
    setGameState(GameState.SETUP);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTotalPairs(0);
  };

  const handleDownloadImages = async () => {
    if (cards.length === 0) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      
      // Filter for unique cards (using -a suffix from creation logic)
      const uniqueCards = cards.filter(card => card.id.endsWith('-a'));
      
      uniqueCards.forEach((card, i) => {
        // The imageUrl is a base64 data URI: "data:image/png;base64,..."
        const base64Data = card.imageUrl.split(',')[1];
        if (base64Data) {
          const sanitizedLabel = card.label.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `${sanitizedLabel}_${i + 1}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmatch-images-${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("Failed to download images.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      {gameState === GameState.SETUP && (
        <SetupForm onStart={handleStartGame} />
      )}

      {gameState === GameState.GENERATING && (
        <LoadingScreen progress={progress.current} total={progress.total} />
      )}

      {gameState === GameState.PLAYING && (
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">MindMatch</h2>
              <p className="text-indigo-300 text-sm">{gameConfig?.style} • {gameConfig?.level}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-sm">Pairs</span>
                <div className="text-xl font-bold text-white">{matchedPairs} / {totalPairs}</div>
              </div>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
                aria-label="Return to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>

          <div className={`grid gap-4 w-full ${totalPairs === 6 ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-4 md:grid-cols-6'}`}>
            {cards.map(card => (
              <Card 
                key={card.id} 
                card={card} 
                onClick={handleCardClick} 
                disabled={gameState !== GameState.PLAYING}
              />
            ))}
          </div>
        </div>
      )}

      {gameState === GameState.FINISHED && (
        <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-lg w-full">
          <h2 className="text-4xl font-bold text-white mb-4">You Won! 🎉</h2>
          <p className="text-slate-300 mb-8">
            You successfully matched all {totalPairs} pairs of images generated in the style of <span className="text-indigo-400">{gameConfig?.style}</span>.
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => handleStartGame(gameConfig!)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-medium"
              >
                Replay Config
              </button>
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            </div>
            
            <button 
              onClick={handleDownloadImages}
              disabled={isDownloading}
              className="w-full px-6 py-3 bg-slate-900 border border-slate-600 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Compressing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Unique Images (ZIP)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 text-slate-600 text-xs text-center w-full pointer-events-none">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default App;