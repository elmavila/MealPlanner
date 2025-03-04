import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import nodeCron from 'node-cron';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const startServer = async () => {
  const db = await open({
    filename: './mealplanner.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dayOfWeek INTEGER NOT NULL,
      lunch TEXT,
      dinner TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS shoppinglist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      ingredients TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  const app = express();
  const port = process.env.PORT || 3032;

  app.use(cors({origin: 'http://http://localhost:5173',methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'}));
  app.use(express.json());

  // 📝 Registrera användare
  app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
      const userId = result.lastID;

      await db.exec(`
        INSERT INTO meal (user_id, dayOfWeek) VALUES
        (${userId},1), (${userId},2), (${userId},3),
        (${userId},4), (${userId},5), (${userId},6), (${userId},7)
      `);

      res.status(201).json({ message: 'Användare skapad', email });
    } catch (error) {
      console.error('Fel vid skapande av användare:', error);
      res.status(500).send('Serverfel');
    }
  });

  // 🔑 Logga in
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (user && await bcrypt.compare(password, user.password)) {
        res.status(200).json({ message: 'Inloggning lyckades!', userId: user.id, email: user.email });
      } else {
        res.status(401).send('Felaktigt lösenord eller användare saknas');
      }
    } catch (error) {
      console.error('Fel vid databasfråga:', error);
      res.status(500).send('Serverfel');
    }
  });

  // 📆 Hämta matschema
  app.get('/foodschedule/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const meals = await db.all('SELECT * FROM meal WHERE user_id = ? ORDER BY dayOfWeek', [userId]);
      res.json(meals);
    } catch (error) {
      console.error('Fel vid databasfråga:', error);
      res.status(500).send('Serverfel');
    }
  });

  // 🛒 Hämta inköpslista
  app.get('/foodschedule/items/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const items = await db.all('SELECT ingredients FROM shoppinglist WHERE userId = ?', [userId]);
      res.json(items);
    } catch (error) {
      console.error('Fel vid databasfråga:', error);
      res.status(500).send('Serverfel');
    }
  });

  // 🧹 Rensa matschema varje söndag 22:00
  nodeCron.schedule('0 22 * * 0', async () => {
    try {
      await db.exec('UPDATE meal SET lunch = NULL, dinner = NULL');
      console.log('Matschema rensat');
    } catch (error) {
      console.error('Fel vid rensning av matschema:', error);
    }
  });

  // ✏️ Uppdatera måltid
  app.put('/foodschedule', async (req, res) => {
    const { lunch, dinner, id } = req.body;
    try {
      await db.run('UPDATE meal SET lunch = ?, dinner = ? WHERE id = ?', [lunch, dinner, id]);
      res.status(200).send('Måltid uppdaterad');
    } catch (error) {
      console.error('Fel vid databasfråga:', error);
      res.status(500).send('Serverfel');
    }
  });

  // ➕ Lägg till inköpsprodukt
  app.post('/foodschedule/items', async (req, res) => {
    const { ingredients, userId } = req.body;
    try {
      await db.run('INSERT INTO shoppinglist (ingredients, userId) VALUES (?, ?)', [ingredients, userId]);
      res.status(201).send('Produkt tillagd');
    } catch (error) {
      console.error('Fel vid sparande av inköpsprodukt:', error);
      res.status(500).send('Serverfel');
    }
  });

  // ❌ Ta bort inköpsprodukt
  app.delete('/foodschedule/items/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    try {
      await db.run('DELETE FROM shoppinglist WHERE id = ?', [itemId]);
      res.status(200).send('Produkt borttagen');
    } catch (error) {
      console.error('Fel vid borttagning av produkt:', error);
      res.status(500).send('Serverfel');
    }
  });

  app.listen(port, () => {
    console.log(`Redo på http://localhost:${port}/`);
  });
};

startServer();
