import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import Login  from "../components/Login";
import Register from "../components/Register";

function Home() {
    const navigate = useNavigate();

    const [selectedAction, setSelectedAction] = useState<'login' | 'register' | ''>('')

    function handleLoginClick(){
        setSelectedAction('login')
        navigate('/login')
    }

    function handleRegisterClick() {
        setSelectedAction('register')
        navigate('/register')
    }
    return (
        <div>
            <h1>Mealplaner</h1>

            <button onClick={handleLoginClick}>Log In</button>
            <button onClick={handleRegisterClick}>Register</button>

            {selectedAction === 'login' && <Login />}
            {selectedAction === 'register' && <Register/>}
        </div>
)
}

export default Home
