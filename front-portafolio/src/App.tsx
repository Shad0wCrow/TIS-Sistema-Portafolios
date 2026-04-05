import RegisterPage from './pages/Registration/Registerpage'
import {Routes, Route} from "react-router-dom"

function App() {

  return (
    <Routes>
      <Route path='/' element={<h1>Home</h1>}/>
      <Route path='/register' element={<RegisterPage/>}/>
    </Routes>
  )
}

export default App
