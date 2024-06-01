// src/views/FoodSchedule.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FoodSchedule.css';

// Måltids struktur
interface Meal{
  id: number;
  title: string;
  date: string;
  userId: number;
  dayId: number;
}

interface Day{
  id: number;
  name: string;
}

function FoodSchedule() {
  // Skapar en tillståndsvariabel 'meals' som initialt är en tom array
  const [meals, setMeals] = useState<Meal[]>([]);
  const [days, setDays] = useState<Day[]>([])
  const [newMeal, setNewMeal] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:3030/foodschedule')
      .then(response => response.json())
      .then(data => setMeals(data))
      // Uppdaterar tillståndet 'meals' med den hämtade datan

      .catch(error => console.error('Error fetching meals:', error));
    // Hanterar eventuella fel som uppstår under hämtningen
  }, []);


// hanterar ändringar i inputrutan för ny måltid
  const handleNewMeal = (e: React.ChangeEvent<HTMLInputElement>) => {

    // Uppdatera tillståndsvariabeln newMeal med det nya värdet från inputrutan
    setNewMeal(e.target.value)
  }


  const handleNewMealSumbit = (dayId: number) => {
    fetch('http://localhost:3030/foodschedule'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newMeal,
        date: new Date().toISOString().split('T')[0],
        userId: user.id,
        dayId: dayId,
      })

    }
  }

  return (
    <div>
      <h1>Food Schedule</h1>
      <nav className='navbar'>
        <li><Link to='/home'>Log out</Link></li>
        <li>Recipes</li>
      </nav>
      <table className="table table-bordered table-hover w-75 ms-5 mt-3">
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
          <tr>
            {meals.map(meal =>(
              <td key={meal.id}>{meal.title}</td>
            ))}
          </tr>
          <tr>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
            <td><input type="text" placeholder="Dinner" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

{/* Itererar över meals och skapar en tabellcell för varje måltid */ }

{/* <tr>

            {meals.map(meal => [
              <td key={meal.id}>{meal.title} ({new Date(meal.date).toLocaleDateString()})</td>
              skapar denna kod en <td>-tagg för varje måltid i meals-arrayen, där varje <td> innehåller måltidens titel och datum
            ])}
          </tr> */}

export default FoodSchedule;
