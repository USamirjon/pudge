import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import './App.css'
import {Signup,Login} from './signup';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './Profile';
import Footer from './Footer';
import api from "./api";

function App() {
    return (
        <Router>
            <div className="App">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/Signup" element={<Signup/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/Profile" element={<Profile/>}/>
                </Routes>
                <br/>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
