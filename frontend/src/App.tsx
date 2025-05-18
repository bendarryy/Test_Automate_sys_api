import './App.css'
import {Router, SupermarketRouter} from './router/Router'

function App() {
  const systemCategory = localStorage.getItem('selectedSystemCategory');
  if (systemCategory == 'supermarket') {
    return <SupermarketRouter />
  }
  return <Router />
}

export default App