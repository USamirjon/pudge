import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css'
import { Login } from './signup';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './components/Footer';
import Support from "./pages/Support";
import CreateCourse from "./pages/CreateCourse"; // This component now handles uploads via modal
import GiveData from "./pages/GiveData";

function App() {
    return (
        <Router>
            <div className="App">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/support" element={<Support />} />
                    <Route path="/createcourse" element={<CreateCourse />} />
                    <Route path="/givedata" element={<GiveData />} />
                </Routes>
                <br/>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;