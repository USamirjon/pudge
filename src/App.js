import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isTokenExpired } from './components/jwtUtils';
import Header from './components/Header';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Support from './pages/Support';
import CreateCourse from './pages/CreateCourse';
import GiveData from './pages/GiveData';
import SupportDetail from './pages/SupportDetail';

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (isTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('telegramId');
            navigate('/');
        }
    }, [navigate]);

    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Login />} />
                <Route path="/support" element={<Support />} />
                <Route path="/support/:id" element={<SupportDetail />} />
                <Route path="/createcourse" element={<CreateCourse />} />
                <Route path="/givedata" element={<GiveData />} />
            </Routes>
            <br />
        </div>
    );
}

export default App;