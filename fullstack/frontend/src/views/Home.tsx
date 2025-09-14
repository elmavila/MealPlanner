import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Login from '../components/Login'
import Register from '../components/Register'

function Home() {
  const navigate = useNavigate()

  const [selectedAction, setSelectedAction] = useState<'login' | 'register' | ''>('')

  function handleLoginClick() {
    setSelectedAction('login')
    navigate('/login')
  }

  function handleRegisterClick() {
    setSelectedAction('register')
    navigate('/register')
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #FEFAE0, #FAEDCE)' }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: '#FEFAE0', borderColor: '#E0E5B6' }}>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-4" style={{ color: '#CCD5AE' }}>Mealplaner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleLoginClick} 
              variant="default" 
              className="w-full hover:opacity-90" 
              style={{ 
                backgroundColor: '#CCD5AE', 
                color: 'white' 
              }}
            >
              Log In
            </Button>
            <Button 
              onClick={handleRegisterClick} 
              variant="outline" 
              className="w-full hover:opacity-90" 
              style={{ 
                borderColor: '#E0E5B6', 
                color: '#CCD5AE', 
                backgroundColor: 'transparent' 
              }}
            >
              Register
            </Button>
          </div>

          {selectedAction === 'login' && <Login />}
          {selectedAction === 'register' && <Register />}
        </CardContent>
      </Card>
    </div>
  )
}

export default Home
