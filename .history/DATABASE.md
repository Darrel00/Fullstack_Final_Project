# DATABASE GUIDE FILE

# Table Setup Code (How was the table created?)
CREATE TABLE drawings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(20) NOT NULL,
    image_path VARCHAR(512) NOT NULL 
);

Creates a new table called drawings in a database, with 5 columns:

- id — A number that automatically increments (1, 2, 3…) for each new row, and acts as the unique identifier for each drawing (prevents confusion when a category has duplicate entries, say like two entries have the same author name)
- title — A short text field (max 255 characters) for the drawing's title (must always have a value)
- description — A long text field with no character limit for the drawing's description (must always have a value)
- author — A short text field (max 20 characters) for the creator's name (must always have a value)
- image_path — A short text field (max 512 characters) to store the file path or URL pointing to the image (must always have a value)

- SERIAL means the database auto-generates the ID, you don't have to supply it manually
- PRIMARY KEY means the id column uniquely identifies every row in the table
- NOT NULL means that column is required, you can't add a drawing without providing that info
- VARCHAR(number) is a text field capped at a certain number characters and with TEXT instead is uncapped

# Seed Data Code (Where did the preloaded data come from?)
INSERT INTO drawings (title, description, author, image_path) VALUES 
('Bouquet of Flowers', 'Drawing of some flowers.', 'Barry', 'https://images.unsplash.com/photo-1579167728798-a1cf3d595960?w=500&h=400&fm=webp'),
('Birds', 'A study of some birds.', 'Anne', 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=500&h=400&fm=webp'),
('Sketch of a Dog', 'Just a simple sketch of a dog.', 'Ethan', 'https://images.unsplash.com/photo-1640894822819-0a94bec464bf?w=500&h=400&fm=webp');

Inserts 3 rows into a database table called drawings:

- Each row has 4 columns: title, description, author, and image_path
- The 3 drawings added are a flower bouquet drawing by Barry, a birds study by Anne, and a dog sketch by Ethan
- Each image_path is an Unsplash image URL sized at 500px×400px and served in WebP format

# database.js (How does the database get connected? Step One)
- require('pg') imports the PostgreSQL library
- {Pool} extracts just the Pool class from that library (a pool manages multiple database connections efficiently instead of opening a new one every time)
- process.env.DATABASE_URL reads the connection string from your .env file
- module.exports makes this pool available to other files in your project so they can all share the same connection (for example, const db = require('./database') is one) 

# .env (How does the database get connected? Step Two)
- .env is a simple text file used to store environment variables (like sensitive data like passwords that shouldn't be in the base code)
- DATABASE_URL is the variable name your code looks up via process.env.DATABASE_URL
- The installed dotenv package simply reads the .env file and makes the variables available via process.env.

# NOTES FOR FOR DEPLOYMENT 
- For local development: update the .env file with your own database url
- For Vercel deployment: add DATABASE_URL in Vercel's environment variables settings