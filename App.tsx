import React from 'react';
import { TetrisGame } from './components/TetrisGame';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <TetrisGame />
    </div>
  );
};

export default App;