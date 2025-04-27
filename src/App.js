import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css'
// Assuming 'Login' is correctly exported from './signup'
import { Login } from './signup';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './components/Footer';
import Courses from "./pages/Courses";
import CreateCourse from "./pages/CreateCourse"; // This component now handles uploads via modal
import GiveData from "./pages/GiveData";
// No need to import BlockContentUploader here anymore, as it's used internally by CreateCourse

function App() {
    return (
        <Router>
            <div className="App">
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/Login" element={<Login/>}/>
                    <Route path="/courses" element={<Courses />} />
                    {/* The CreateCourse component handles uploads internally */}
                    <Route path="/createcourse" element={<CreateCourse />} />
                    <Route path="/givedata" element={<GiveData />} />
                    {/* The standalone upload route is removed because functionality is modal-based */}
                    {/* <Route path="/upload-files" element={<UploadFiles />} /> REMOVED */}
                </Routes>
                <br/>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;