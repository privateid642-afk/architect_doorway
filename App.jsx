
import SacredGlyph from './components/SacredGlyph';
import './App.css';

function App() {
  return (
    <div className="App">
      <SacredGlyph />
      <audio controls src="/doorway.mp3" style={{ marginTop: '2rem' }} />
    </div>
  );
}

export default App;
