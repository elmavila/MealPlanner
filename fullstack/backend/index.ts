import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const startServer = async () => {
  const db = await open({
    filename: "./mealplanner.db",
    driver: sqlite3.Database,
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
      checked INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS recipe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      servings INTEGER NOT NULL,
      image TEXT,
      description TEXT NOT NULL DEFAULT '',
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  await db.run("UPDATE recipe SET description = '' WHERE description = ?", [
    "Ett eget favoritrecept.",
  ]);

  const shoppingListColumns = await db.all("PRAGMA table_info(shoppinglist)");
  if (
    !shoppingListColumns.some(
      (column: { name: string }) => column.name === "checked",
    )
  ) {
    await db.exec(
      "ALTER TABLE shoppinglist ADD COLUMN checked INTEGER NOT NULL DEFAULT 0",
    );
  }

  const app = express();
  const port = process.env.PORT || 3032;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://mealplanner.chrispys.top",
    "https://www.mealplanner.chrispys.top",
  ];
  const isLocalNetworkOrigin = (origin: string) =>
    /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):(?:5173|4173)$/.test(
      origin,
    );

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (
      origin &&
      (allowedOrigins.includes(origin) || isLocalNetworkOrigin(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          isLocalNetworkOrigin(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error("Origin not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));

  const apiRouter = express.Router();

  apiRouter.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
      );
      const userId = result.lastID;

      await db.exec(`
        INSERT INTO meal (user_id, dayOfWeek) VALUES
        (${userId},1), (${userId},2), (${userId},3),
        (${userId},4), (${userId},5), (${userId},6), (${userId},7)
      `);

      res.status(201).json({ message: "Användare skapad", email });
    } catch (error) {
      console.error("Fel vid skapande av användare:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
      if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
          message: "Inloggning lyckades!",
          userId: user.id,
          email: user.email,
        });
      } else {
        res.status(401).send("Felaktigt lösenord eller användare saknas");
      }
    } catch (error) {
      console.error("Fel vid databasfråga:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.get("/foodschedule/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
      const meals = await db.all(
        "SELECT * FROM meal WHERE user_id = ? ORDER BY dayOfWeek",
        [userId],
      );
      res.json(meals);
    } catch (error) {
      console.error("Fel vid databasfråga:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.get("/recipes/:userId", async (req, res) => {
    try {
      const recipeRows = await db.all(
        "SELECT id, title, servings, image, description, ingredients, instructions FROM recipe WHERE user_id = ? ORDER BY id DESC",
        [req.params.userId],
      );
      const recipeList = recipeRows.map((recipe) => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
      }));
      res.json(recipeList);
    } catch (error) {
      console.error("Fel vid hämtning av recept:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.post("/recipes", async (req, res) => {
    const { title, servings, image, ingredients, instructions, userId } =
      req.body;
    if (
      !title ||
      !Array.isArray(ingredients) ||
      !ingredients.length ||
      !Array.isArray(instructions) ||
      !instructions.length ||
      !userId
    ) {
      res.status(400).json({
        message: "Titel, ingredienser, instruktioner och användare krävs",
      });
      return;
    }

    try {
      const result = await db.run(
        "INSERT INTO recipe (user_id, title, servings, image, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userId,
          title.trim(),
          Math.max(1, Number(servings) || 1),
          image || null,
          JSON.stringify(ingredients),
          JSON.stringify(instructions),
        ],
      );
      res.status(201).json({
        id: Number(result.lastID),
        title: title.trim(),
        servings: Math.max(1, Number(servings) || 1),
        image: image || "",
        description: "",
        ingredients,
        instructions,
      });
    } catch (error) {
      console.error("Fel vid sparande av recept:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.put("/recipes/:recipeId", async (req, res) => {
    const { title, servings, image, ingredients, instructions, userId } =
      req.body;
    if (
      !title ||
      !Array.isArray(ingredients) ||
      !ingredients.length ||
      !Array.isArray(instructions) ||
      !instructions.length ||
      !userId
    ) {
      res.status(400).json({ message: "Ofullständigt recept" });
      return;
    }

    try {
      const result = await db.run(
        "UPDATE recipe SET title = ?, servings = ?, image = ?, ingredients = ?, instructions = ? WHERE id = ? AND user_id = ?",
        [
          title.trim(),
          Math.max(1, Number(servings) || 1),
          image || null,
          JSON.stringify(ingredients),
          JSON.stringify(instructions),
          req.params.recipeId,
          userId,
        ],
      );
      if (!result.changes) {
        res.status(404).json({ message: "Receptet hittades inte" });
        return;
      }
      res.json({
        id: Number(req.params.recipeId),
        title: title.trim(),
        servings: Math.max(1, Number(servings) || 1),
        image: image || "",
        description: "",
        ingredients,
        instructions,
      });
    } catch (error) {
      console.error("Fel vid redigering av recept:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.delete("/recipes/:recipeId", async (req, res) => {
    const { userId } = req.body;
    try {
      const result = await db.run(
        "DELETE FROM recipe WHERE id = ? AND user_id = ?",
        [req.params.recipeId, userId],
      );
      if (!result.changes) {
        res.status(404).json({ message: "Receptet hittades inte" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Fel vid radering av recept:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.get("/foodschedule/items/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
      const items = await db.all(
        "SELECT id, ingredients, checked FROM shoppinglist WHERE userId = ?",
        [userId],
      );
      res.json(items);
    } catch (error) {
      console.error("Fel vid databasfråga:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.put("/foodschedule", async (req, res) => {
    const { lunch, dinner, id } = req.body;
    try {
      await db.run("UPDATE meal SET lunch = ?, dinner = ? WHERE id = ?", [
        lunch,
        dinner,
        id,
      ]);
      res.status(200).send("Måltid uppdaterad");
    } catch (error) {
      console.error("Fel vid databasfråga:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.post("/foodschedule/items", async (req, res) => {
    const { ingredients, userId } = req.body;
    try {
      await db.run(
        "INSERT INTO shoppinglist (ingredients, userId) VALUES (?, ?)",
        [ingredients, userId],
      );
      res.status(201).send("Produkt tillagd");
    } catch (error) {
      console.error("Fel vid sparande av inköpsprodukt:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.delete("/foodschedule/items/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    try {
      await db.run("DELETE FROM shoppinglist WHERE id = ?", [itemId]);
      res.status(200).send("Produkt borttagen");
    } catch (error) {
      console.error("Fel vid borttagning av produkt:", error);
      res.status(500).send("Serverfel");
    }
  });

  apiRouter.patch("/foodschedule/items/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    const { checked } = req.body; // förväntar sig true/false från frontend

    try {
      await db.run("UPDATE shoppinglist SET checked = ? WHERE id = ?", [
        checked ? 1 : 0,
        itemId,
      ]);
      res.status(200).send("Checkbox status uppdaterad");
    } catch (error) {
      console.error("Fel vid uppdatering av checkbox status:", error);
      res.status(500).send("Serverfel");
    }
  });

  app.use("/api", apiRouter);

  app.listen(port, () => {
    console.log(`Redo på http://localhost:${port}/`);
  });
};

startServer();
