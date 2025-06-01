import './App.css'
import {Router} from './router/Router'
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Router />
      </div>
    </ThemeProvider>
  )
}

export default App