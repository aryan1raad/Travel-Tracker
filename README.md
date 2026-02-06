پروژه ی travel tracker به صورت پویا با وارد کردن اسم هر کشور ، منطقه ی جغرافیایی را میتواند نشان دهد 
این پروژه شامل قابلیت هایی برای افزودن کاربر جدید ، نقشه ی پویا ، مدیریت داده و کنترل چند کاربره است.
تکنولوژی های استفاده شده : Backend: Node.js, Express.js  --  Frontend: EJS, CSS -- Database: PostgreSQL
برای راه اندازی ابتدا در PostgreSQL یک دیتابیس به نام world بسازید و جدول های زیر را بسازید:
-- جدول کاربران
CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(15) UNIQUE NOT NULL,
color VARCHAR(15)
);

-- جدول کشورهای بازدید شده
CREATE TABLE visited_countries(
id SERIAL PRIMARY KEY,
country_code CHAR(2) NOT NULL,
user_id INTEGER REFERENCES users(id)
);

-- درج کاربران اولیه
INSERT INTO users (name, color) VALUES ('Angela', 'teal'), ('Jack', 'powderblue');
 
 
 
 و در فایل .env باید مشخصات دیتا بیس را وارد کنید


 
 DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=world
DB_PASSWORD=your_password
DB_PORT=5432

و به یک جدول countries نیز نیاز خواهید داشت که باید از فایل countries.csv در لینک گیت هاب دانلود کنید و در دیتابیس ایجاد کنید 
