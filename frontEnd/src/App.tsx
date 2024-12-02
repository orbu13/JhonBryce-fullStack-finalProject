import './App.css'
import HomePage from './components/mainPage/homePage'
import Navbar from './components/navbar/navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/registerPage/register'
import LoginUser from './components/loginPage/login'
import { AuthProvider } from './context/authProvider'
import VacationPage from './components/vacationPage/vacations'
import EditVacation from './components/editVacationPage/editVacationPage'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify"
import AdminPanel from "./components/adminpanel/adminpanel"
import NewVacation from "./components/newvacation/newvacation"
import VacationReports from "./components/reports/reports"

function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
  <ToastContainer/>
    <Navbar/>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/loginUser' element={<LoginUser/>}/>
      <Route path='/vacations' element={<VacationPage/>}/>
      <Route path='/edit-vacation/:id' element={<EditVacation/>}/>
      <Route path='/admin-panel' element={<AdminPanel/>}/>
      <Route path='/new-vacation' element={<NewVacation/>}/>
      <Route path='/reports' element={<VacationReports/>}/>
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
