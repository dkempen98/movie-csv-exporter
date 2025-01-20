import logo from './logo.svg';
import './App.scss';
import Grid from './components/Grid.js';
import HelpBar from './components/HelpBar';
function App() {
  return (
    <div className="App">
        <HelpBar/>
        <Grid/>
    </div>
  );
}

export default App;
