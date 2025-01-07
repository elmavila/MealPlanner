import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../helpers/formValidators';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible] = useState(false)
  const navigate = useNavigate();


  // State för att spåra valideringsfel för e-post och lösenord
  const [errors, setErrors] = useState<{ email: string; password: string }>({ email: '', password: '' });
  // Initialt sätts inga valideringsfel, men det finns platser att lagra dem om de uppstår


  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault()

    //Validera e-postadress och lösenord
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    // Uppdatera errors-state med eventuella valideringsfel
    setErrors({ email: emailError || '', password: passwordError || '' });

    // // Om något fel uppstår, avbryt inskickningen
    if (emailError || passwordError) {
      return
    }

    try {
      const fetchResponse = await fetch('http://localhost:3031/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        console.log('Successfully created account:', data);
        alert('Successfully created account!')
        navigate('/login');
      } else {
        console.error('Registration faild');
        alert('Registration faild')
      }
    } catch (error) {
      console.error('something went wrong:', error);
    }
  };


  return (
    <div>
      <h2>Registration</h2>
    <form onSubmit={handleSumbit}>
      <label>Enter email
        <input
          type="text"
          name='email'
          placeholder='Enter Email'
          value={email}
            onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
      </label>
      <label>Enter password
        <input
          type={visible ? 'text' : 'password'}
          name='password'
          placeholder='Enter Password'
          value={password}
            onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
      </label>
        <button type='submit'>
          Register Account
        </button>
    </form>
    </div>
  )
}

export default Register;
