import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [visible] = useState(false)
    const navigate = useNavigate();


    const handleSumbit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const fetchResponse = await fetch('http://localhost:3032/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
            if (fetchResponse.ok) {
                const data = await fetchResponse.json()
                console.log('Successfully logged in:', data);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userEmail', data.email);
                navigate('/foodschedule');
            } else {
                console.error('Login faild');
                alert('Login failed')
            }
        } catch (error) {
            console.error('something went wrong:', error);
        }
    };

    return (
        <div>
            <h2>Log In</h2>
            <form onSubmit={handleSumbit}>
                <label>Enter email
                    <input
                        type='text'
                        name='email'
                        placeholder='Enter Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>Enter password
                    <input
                        type={visible ? 'text' : 'password'}
                        name='password'
                        placeholder='Enter Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button type='submit'>Log In</button>
            </form>
        </div>
    )
}

export default Login;
