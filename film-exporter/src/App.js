import logo from './logo.svg';
import './App.scss';
import Menu from './components/Menu.js';
import HelpBar from './components/HelpBar';
function App() {
  return (
    <div className="App">
        <HelpBar/>
        <Menu/>
    </div>
  );
}

export default App;
