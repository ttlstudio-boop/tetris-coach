import React, { useState } from 'react';
import { Zap, Cpu, RotateCcw, Brain, Loader2, CircleHelp, X, Copy, Check, Terminal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GameControlsProps {
  score: number;
  isConnected: boolean;
  onConnect: () => void;
  onRestart: () => void;
  isGameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  score, 
  isConnected, 
  onConnect, 
  onRestart,
  isGameOver
}) => {
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);

  const arduinoCode = `void setup() {
  Serial.begin(9600);
  // Setup buttons with internal pullup resistors
  // Connect buttons between PIN and GROUND
  pinMode(2, INPUT_PULLUP); // Left
  pinMode(3, INPUT_PULLUP); // Right
  pinMode(4, INPUT_PULLUP); // Rotate (Up)
  pinMode(5, INPUT_PULLUP); // Drop (Down)
}

void loop() {
  if (digitalRead(2) == LOW) {
    Serial.println("l"); // Send 'l' for left
    delay(150); // Small delay to prevent double inputs
  }
  if (digitalRead(3) == LOW) {
    Serial.println("r");
    delay(150);
  }
  if (digitalRead(4) == LOW) {
    Serial.println("u");
    delay(200); // Rotate needs a bit more time
  }
  if (digitalRead(5) == LOW) {
    Serial.println("d");
    delay(50); // Drop can be faster
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAiAdvice = async () => {
    if (!process.env.API_KEY) {
        setAiTip("API Key missing in environment.");
        return;
    }
    
    setIsLoading(true);
    setAiTip(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = isGameOver 
        ? `I just lost a game of Tetris with a score of ${score}. Give me a short, 1-sentence witty consolation or specific advice for next time.`
        : `I am playing Tetris. My score is ${score}. Give me a short, 1-sentence strategic tip or enthusiastic encouragement.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            maxOutputTokens: 60,
            thinkingConfig: { thinkingBudget: 0 },
        }
      });
      
      setAiTip(response.text || "Keep stacking!");
    } catch (error) {
      console.error("AI Error:", error);
      setAiTip("Connection to AI Coach failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-80 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col gap-6">
      
      {/* Score Board */}
      <div className="text-center bg-gray-900/80 p-4 rounded-lg border border-gray-700 shadow-inner">
        <h2 className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-1">Score</h2>
        <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          {score}
        </div>
      </div>

      {/* Controls Legend */}
      <div className="space-y-3 text-sm text-gray-300 bg-gray-900/40 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-100 mb-2 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> Keyboard
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
            <span>Move</span>
            <div className="flex gap-1">
              <kbd className="bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">←</kbd>
              <kbd className="bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">→</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
            <span>Rotate</span>
            <kbd className="bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">↑</kbd>
          </div>
          <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
            <span>Drop</span>
            <kbd className="bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">↓</kbd>
          </div>
          <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
            <span>Hard</span>
            <kbd className="bg-gray-700 px-1.5 py-0.5 rounded border border-gray-600">Spc</kbd>
          </div>
        </div>
      </div>

      {/* AI Coach */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-4 rounded-lg border border-indigo-500/30">
         <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-indigo-200 flex items-center gap-2">
                <Brain size={16} /> AI Coach
            </h3>
            <button 
                onClick={getAiAdvice}
                disabled={isLoading}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : "Ask Tip"}
            </button>
         </div>
         <div className="min-h-[3rem] text-sm text-indigo-100 italic bg-black/20 p-3 rounded border border-white/5">
            {aiTip ? `"${aiTip}"` : "Ask for a tip to improve your game!"}
         </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button 
            onClick={onRestart}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg border border-gray-600"
        >
            <RotateCcw size={18} /> Restart Game
        </button>

        <div className="flex gap-2">
            <button 
                onClick={onConnect}
                disabled={isConnected}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border ${
                    isConnected 
                    ? 'bg-green-600/20 border-green-500/50 text-green-400 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
            >
                <Cpu size={18} />
                {isConnected ? 'Connected' : 'Connect'}
            </button>
            
            <button 
                onClick={() => setShowSetup(true)}
                className="px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-colors flex items-center justify-center"
                title="Arduino Setup Guide"
            >
                <CircleHelp size={20} />
            </button>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
                <button 
                    onClick={() => setShowSetup(false)} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Terminal className="text-blue-400" /> Arduino Setup
                </h3>
                
                <div className="overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    <div className="space-y-3">
                        <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider">1. Wiring Guide</h4>
                        <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-2 gap-3 text-sm border border-gray-700">
                            <div className="flex items-center gap-2 text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Pin 2 <span className="text-gray-500">→</span> Left
                            </div>
                            <div className="flex items-center gap-2 text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Pin 3 <span className="text-gray-500">→</span> Right
                            </div>
                            <div className="flex items-center gap-2 text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Pin 4 <span className="text-gray-500">→</span> Rotate
                            </div>
                            <div className="flex items-center gap-2 text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Pin 5 <span className="text-gray-500">→</span> Drop
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Connect momentary buttons between the assigned PIN and GROUND. No external resistors needed (using <code>INPUT_PULLUP</code>).
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider">2. Upload Code</h4>
                            <button 
                                onClick={copyCode} 
                                className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />} 
                                {copied ? 'Copied' : 'Copy Sketch'}
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <pre className="relative bg-black p-4 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-gray-800 shadow-inner leading-relaxed">
                                {arduinoCode}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};