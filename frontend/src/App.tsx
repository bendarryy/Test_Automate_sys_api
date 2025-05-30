import './App.css'
import {Router, SupermarketRouter} from './router/Router'
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  const systemCategory = localStorage.getItem('selectedSystemCategory');
  return (
    <ThemeProvider>
      <div className="App">
        {systemCategory == 'supermarket' ? (
          <SupermarketRouter />
        ) : (
          <Router />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App