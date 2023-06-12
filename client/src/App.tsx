import React from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './components/Game';

function App() {
  return (
    <div className="App">
      <Game /> {/* Game 컴포넌트를 렌더링합니다. */}
    </div>
  );
}

export default App;
