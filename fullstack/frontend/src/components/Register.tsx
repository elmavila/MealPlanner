import React, { useState } from 'react'
import { validateEmail, validatePassword } from '../helpers/formValidators'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible] = useState(false)
  const navigate = useNavigate()

  // State för att spåra valideringsfel för e-post och lösenord
  const [errors, setErrors] = useState<{ email: string; password: string }>({ email: '', password: '' })
  // Initialt sätts inga valideringsfel, men det finns platser att lagra dem om de uppstår

  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault()

    //Validera e-postadress och lösenord
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    // Uppdatera errors-state med eventuella valideringsfel
    setErrors({ email: emailError || '', password: passwordError || '' })

    // // Om något fel uppstår, avbryt inskickningen
    if (emailError || passwordError) {
      return
    }

    try {
      const fetchResponse = await fetch('http://localhost:3032/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        console.log('Successfully created account:', data)
        alert('Successfully created account!')
        navigate('/login')
      } else {
        console.error('Registration faild')
        alert('Registration faild')
      }
    } catch (error) {
      console.error('something went wrong:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4" style={{ backgroundColor: '#FEFAE0', borderColor: '#E0E5B6' }}>
      <CardHeader>
        <CardTitle className="text-2xl text-center" style={{ color: '#CCD5AE' }}>Registration</CardTitle>
        <CardDescription className="text-center">Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSumbit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderColor: '#E0E5B6',
                backgroundColor: '#FAEDCE'
              }}
              className="focus:border-[#CCD5AE] focus:ring-[#CCD5AE]/50"
            />
            {errors.email && <span className="text-sm text-red-600 font-medium">{errors.email}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Input
              id="password"
              type={visible ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                borderColor: '#E0E5B6',
                backgroundColor: '#FAEDCE'
              }}
              className="focus:border-[#CCD5AE] focus:ring-[#CCD5AE]/50"
            />
            {errors.password && <span className="text-sm text-red-600 font-medium">{errors.password}</span>}
          </div>
          <Button 
            type="submit" 
            className="w-full hover:opacity-90" 
            style={{ 
              backgroundColor: '#CCD5AE', 
              color: 'white' 
            }}
          >
            Register Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default Register
