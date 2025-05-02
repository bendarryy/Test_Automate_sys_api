import './App.css'
import {Router, SupermarketRouter} from './router/Router'



function App() {
  const systemId = localStorage.getItem('selectedSystemId');
  if (systemId == '8') {
    return <SupermarketRouter />
  }
  return (
    <Router />
  )
}

export default App