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
        <div className="d-flex flex-column align-items-center">

        <div>
            <h1 className="display-3">Mealplaner</h1>
        </div>
            <div className="mt-4">

            <button className="btn me-3 btn-success" onClick={handleLoginClick}>Log In</button>
            <button className="ms-3 btn btn-primary" onClick={handleRegisterClick}>Register</button>

            {selectedAction === 'login' && <Login />}
            {selectedAction === 'register' && <Register/>}
</div>
        </div>
)
}

export default Home
