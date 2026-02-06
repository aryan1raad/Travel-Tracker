import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // برای خواندن متغیرهای محیطی از فایل .env

const app = express();
const port = process.env.PORT || 4000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// اتصال به دیتابیس و ساخت خودکار جداول
async function connectDb() {
  try {
    await db.connect();
    console.log("Be database vasl shod!");

    // ساخت جداول اگر وجود نداشته باشند
    const tableSchema = `
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(15) UNIQUE NOT NULL,
        color VARCHAR(15)
      );

      CREATE TABLE IF NOT EXISTS visited_countries(
        id SERIAL PRIMARY KEY,
        country_code CHAR(2) NOT NULL,
        user_id INTEGER REFERENCES users(id)
      );
    `;
    await db.query(tableSchema);
    
    // چک کردن برای اضافه کردن یوزرهای اولیه ( اگر جدول خالی بود)
    const userCheck = await db.query("SELECT * FROM users LIMIT 1");
    if (userCheck.rows.length === 0) {
      await db.query("INSERT INTO users (name, color) VALUES ('Angela', 'teal'), ('Jack', 'powderblue')");
    }
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}
connectDb();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

// گرفتن یوزر فعلی و لیست همه یوزرها
async function getUsersData() {
  const result = await db.query("SELECT * FROM users");
  const users = result.rows;
  const currentUser = users.find((u) => u.id == currentUserId) || users[0];
  return { users, currentUser };
}

app.get("/", async (req, res) => {
  try {
    const { users, currentUser } = await getUsersData();
    
    const result = await db.query(
      "SELECT country_code FROM visited_countries WHERE user_id = $1",
      [currentUserId]
    );
    const countries = result.rows.map((row) => row.country_code);

    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: currentUser ? currentUser.color : "teal",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    if (result.rows.length !== 0) {
      const countryCode = result.rows[0].country_code;
      try {
        await db.query(
          "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
          [countryCode, currentUserId]
        );
        res.redirect("/");
      } catch (err) {
        // برگرد به خانه
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const { name, color } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *",
      [name, color]
    );
    currentUserId = result.rows[0].id;
    res.redirect("/");
  } catch (err) {
    console.error("Error creating new user:", err);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});