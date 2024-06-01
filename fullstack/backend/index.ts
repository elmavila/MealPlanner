import cors from 'cors'
import * as dotenv from 'dotenv'
import { Client } from 'pg'
import express, { response } from 'express'
import bcrypt from 'bcrypt';
import { resolve } from 'path'

dotenv.config()
const client = new Client({
  connectionString: process.env.PGURI
})

client.connect()
.then(() => console.log('Redo att göra databasanrop'))

const app = express(),
   port = process.env.PORT || 3030

app.use(cors())
app.use(express.json());


app.post('/register', async (request, response) => {
  const { email, password } = request.body

  try {
    // Hasha lösenordet innan det sparas i databasen
    const hashedPassword = await bcrypt.hash(password, 10)
    // Spara användaren i databasen med det hashade lösenordet
    await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword])
    response.status(201).json({ message: 'Användare skapad', email })
  } catch (error) {
    console.error('Fel vid skapande av användare', error)
    response.status(500).send('Serverfel')
  }
})

//endpoint
app.post('/login', async (request, response) => {
  const { email, password } = request.body

  // Kontrollera om användaren redan finns i databasen
  try {
                                                  //Platsmarkörer: $1 är en platsmarkör som kommer att ersättas med värdet av email
    const userResult = await client.query('SELECT * FROM USERS WHERE email = $1', [email])

    // Kontrollera om det finns någon användare i resultatet
    if (userResult.rows.length > 0) {
    //Om det finns minst en användare i resultatet, tilldela den första användaren från userResult till variabeln user
      const user = userResult.rows[0]

      // Jämför det inskickade lösenordet med det hashade lösenordet i databasen
      if (await bcrypt.compare(password, user.password)) {
        //skicka tillbaka statuskod, medelnade och vilket anvndar id som är inloggad
        response.status(200).json({ message: 'Inloggning lyckades!', userId: user.id})
      } else {
        response.status(401).send('Felaktikgt lösenord ')
      }
    }else {
      response.status(404).send('User not found')
    }
  } catch (error) {
    console.error('Fel vid databasfgråga', error)
    response.status(500).send('Serverfel')
  }
})


app.get('/foodschedule', async (request, response) => {
  try {
    const mealResult = await client.query('SELECT id,title, date, user_id as userId FROM meal');
    response.json(mealResult.rows)
  } catch (error) {
    console.error('Fel vid databasfgråga', error)
    response.status(500).send('Serverfel')
  }
})

app.listen(port, () => {
  console.log(`Redo på http://localhost:${port}/`)
})
