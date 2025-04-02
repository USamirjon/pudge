import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import './App.css'
import {Signup,Login} from './signup';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Profile from './Profile';
import Footer from './Footer';
import JavaScriptPage from './PL/JavaScriptPage'; // Create separate page components
import CSharpPage from './PL/CSharpPage';
import PythonPage from './PL/PythonPage';
import api from "./api";
import Testpass from "./testpass";
import Testcreator from "./testcreator";


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
                    <Route path="/javascript" element={<JavaScriptPage />} />
                    <Route path="/csharp" element={<CSharpPage />} />
                    <Route path="/python" element={<PythonPage />} />
                    <Route path="/testpass" element={<Testpass />} />
                    <Route path="/testcreator" element={<Testcreator />} />

                </Routes>
                <br/>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;
