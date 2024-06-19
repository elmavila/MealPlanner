import cors from 'cors'
import * as dotenv from 'dotenv'
import { Client } from 'pg'
import express, { response } from 'express'
import bcrypt from 'bcrypt';
import nodeCron from 'node-cron';
import { request } from 'http';

dotenv.config()
const client = new Client({
  connectionString: process.env.PGURI
})

client.connect()
  .then(() => console.log('Redo att göra databasanrop'))

const app = express(),
  port = process.env.PORT || 3031

app.use(cors())
app.use(express.json());


app.post('/register', async (request, response) => {
  const { email, password } = request.body

  try {
    // Hasha lösenordet innan det sparas i databasen
    const hashedPassword = await bcrypt.hash(password, 10)
    // Spara användaren i databasen med det hashade lösenordet
    await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword])
    const result = await client.query('select id from users where email = $1 limit 1', [email])
    const userId = result.rows[0].id
    await client.query(`insert into meal(user_id, dayofweek)
    values($1,1),
    ($1,2),
    ($1,3),
    ($1,4),
    ($1,5),
    ($1,6),
    ($1,7)
      `, [userId])
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
        response.status(200).json({ message: 'Inloggning lyckades!', userId: user.id, email: user.email })
      } else {
        response.status(401).send('Felaktikgt lösenord ')
      }
    } else {
      response.status(404).send('User not found')
    }
  } catch (error) {
    console.error('Fel vid databasfgråga', error)
    response.status(500).send('Serverfel')
  }
})

app.get('/foodschedule/:userId', async (request, response) => {
  const userId = request.params.userId;
  try {
    const mealResult = await client.query(`SELECT id,lunch, dinner, user_id as userId, dayOfWeek
    FROM meal
    WHERE user_Id = $1
    ORDER BY dayOfWeek`, [userId]
    );
    response.json(mealResult.rows)
  } catch (error) {
    console.error('Fel vid databasfgråga', error)
    response.status(500).send('Serverfel')
  }
})

app.get('/foodschedule/items/:userId', async (request, response) => {
  const userId = request.params.userId;

  try {
    const itemsResult = await client.query(`SELECT ingredients FROM shoppinglist WHERE userId = $1`, [userId]);
    response.json(itemsResult.rows);
  } catch (error) {
    console.error('Fel vid databasfgråga', error);
    response.status(500).send('Serverfel');
  }
})

const clearMealSchedule = async () => {
  try {
    await client.query(`
    UPDATE meal
    SET lunch=$1
    ,dinner=$2
    WHERE id = $3
    `)
    console.log('Matschema renast');
  } catch (error) {
    console.log(error);
  }
};

nodeCron.schedule('0 22 * * 0', clearMealSchedule);

app.put('/foodschedule', async (request, response) => {
  const { lunch, dinner, id } = request.body
  try {
    await client.query(`UPDATE meal
    SET lunch = $1, dinner = $2
    WHERE id = $3`, [lunch, dinner, id]);
    response.status(200).send('Måltid uppdaterad')

  } catch (error) {
    console.error('Fel vid databasfgråga', error)
    response.status(500).send('Serverfel')
  }
})

app.post('/foodschedule/items', async (request, response) => {

  const { ingredients, userId } = request.body;
  console.log(ingredients, userId);

  try {
    await client.query(`INSERT INTO shoppinglist (ingredients, userId) VALUES ($1, $2)`, [ingredients, userId]);
  } catch (error) {
    console.error('Fel vid sparande av inköpsprodukt:', error);
    response.status(500).send('Serverfel');
  }
});

app.delete('/foodschedule/items/:itemId', async (request, response) => {
  const itemId = request.params.itemId;

  try {
    // Skicka en SQL-fråga för att ta bort den produkt med det angivna id:et från shoppinglist-tabellen
    await client.query('DELETE FROM shoppinglist WHERE id = $1', [itemId]);
    // Skicka tillbaka ett svar till klienten att produkten har tagits bort
    response.status(200).send('Product deleted successfully');
  } catch (error) {
    // Om något går fel, skicka ett felmeddelande till klienten
    console.error('Error deleting product:', error);
    response.status(500).send('Error deleting product');
  }
});


app.listen(port, () => {
  console.log(`Redo på http://localhost:${port}/`)
})
