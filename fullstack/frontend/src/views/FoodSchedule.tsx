// src/views/FoodSchedule.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FoodSchedule.css'
import ShoppingList from '../components/ShoppingList'

// Måltids struktur
interface Meal {
  id: number
  dayOfWeek: number
  lunch: string
  dinner: string
  userId: number
}

function updateMeal(meal: Meal) {
  const userId = localStorage.getItem('userId')
  fetch('http://localhost:3032/foodschedule', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...meal, userId }),
  })
}

function FoodSchedule() {
  // Skapar en tillståndsvariabel 'meals' som initialt är en tom array
  const [meals, setMeals] = useState<Meal[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const userId = localStorage.getItem('userId')
    setUserEmail(email)

    // Kontrollera om användar-ID finns i localStorage innan du hämtar måltider
    if (userId) {
      fetch(`http://localhost:3032/foodschedule/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => setMeals(data))
        // Uppdaterar tillståndet 'meals' med den hämtade datan

        .catch((error) => console.error('Error fetching meals:', error))
      // Hanterar eventuella fel som uppstår under hämtningen
    } else {
      console.error('User ID not found in localStorage')
    }
  }, [])

  const handleLunch = (id: number, newText: string) => {
    const userId = parseInt(localStorage.getItem('userId') ?? '0')
    const meal = meals.find((m) => m.id == id)!
    meal.lunch = newText
    updateMeal({ ...meal, userId })
    console.log(`${id}, ${newText}`)
  }

  const handleDinner = (id: number, newText: string) => {
    const userId = parseInt(localStorage.getItem('userId') ?? '0')
    const meal = meals.find((m) => m.id == id)!
    meal.dinner = newText
    updateMeal({ ...meal, userId })
    console.log(`${id}, ${newText}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    navigate('/home')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>, id: number, mealType: 'lunch' | 'dinner') => {
    if (event.key === 'Enter') {
      const newText = (event.target as HTMLInputElement).value
      if (mealType === 'lunch') {
        handleLunch(id, newText)
      } else {
        handleDinner(id, newText)
      }
    }
  }

  const mealsByDay: Record<string, Meal[]> = {}

  meals.forEach((meal) => {
    if (!mealsByDay[meal.dayOfWeek]) {
      mealsByDay[meal.dayOfWeek] = []
    }
    mealsByDay[meal.dayOfWeek].push(meal)
  })

  return (
    <div className="m-3">
      <h1 className="display-3">Food Schedule</h1>
      <div className="d-flex">
        <p className="mt-2">Logged in as: {userEmail}</p>
        <button className="ms-3 btn btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <nav className="navbar">
        <li onClick={() => navigate('/recipes')}>Recipes</li>
      </nav>
      <table className="table  table-hover w-75 ms-5 mt- table-success border-success">
        <thead>
          <tr>
            <th className="col-md-1">Mon</th>
            <th className="col-md-1">Tue</th>
            <th className="col-md-1">Wed</th>
            <th className="col-md-1">Thu</th>
            <th className="col-md-1">Fri</th>
            <th className="col-md-1">Sat</th>
            <th className="col-md-1">Sun</th>
          </tr>
        </thead>
        <tbody>
          {/* skapar denna kod en <td>-tagg för varje måltid i meals-arrayen */}
          <tr>
            {meals.map((meal) => (
              <td key={meal.id}>
                <textarea
                  className="form-control"
                  defaultValue={meal.lunch}
                  onBlur={(e) => handleLunch(meal.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, meal.id, 'lunch')}
                  placeholder="Lunch"
                  rows={2}
                  style={{ overflow: 'hidden', minHeight: '40px', width: '100%', resize: 'none' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto' // Återställ höjden först
                    target.style.height = `${target.scrollHeight}px` // Sätt höjden baserat på innehållet
                  }}
                />
              </td>
            ))}
          </tr>
          <tr>
            {meals.map((meal) => (
              <td key={meal.id}>
                <textarea
                  className="form-control"
                  defaultValue={meal.dinner}
                  onBlur={(e) => handleDinner(meal.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, meal.id, 'dinner')}
                  placeholder="Dinner"
                  rows={2}
                  style={{ overflow: 'hidden', minHeight: '40px', width: '100%', resize: 'none' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = `${target.scrollHeight}px`
                  }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <ShoppingList></ShoppingList>
    </div>
  )
}

export default FoodSchedule
