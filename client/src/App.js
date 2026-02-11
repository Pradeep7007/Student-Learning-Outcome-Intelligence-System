import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './pages/signup';
import 'bootstrap-icons/font/bootstrap-icons.css';
function App() {
  return (
    <div className="App">
      <button className="btn btn-primary">Primary</button>
      <Signup/>
    </div>
  );
}

export default App;
