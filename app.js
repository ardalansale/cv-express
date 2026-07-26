const express = require('express');
const { Pool } = require('pg');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cv',
    password: 'mellon',
    port: 5432
});

// Startsida/Hem
app.get('/', (req, res) => {
    res.render('index');
});

// Visa kurser
app.get('/courses', async (req, res) => {
    const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
    res.render('courses', { courses: result.rows });
});

// Visa formuläret /add
app.get('/add', (req, res) => {
    res.render('add');
});

// Visa about-sidan
app.get('/about', (req, res) => {
    res.render('about');
});

// Lägg till kurs
app.post('/add', async (req, res) => {
    const { coursecode, coursename, progression, syllabus } = req.body;

    await pool.query(
        'INSERT INTO courses (coursecode, coursename, progression, syllabus) VALUES ($1, $2, $3, $4)',
        [coursecode, coursename, progression, syllabus]
    );

    res.redirect('/courses');
});

// Ta bort kurs
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;

    await pool.query('DELETE FROM courses WHERE id = $1', [id]);

    res.redirect('/courses');
});

app.listen(3000, () => {
    console.log('Servern körs på http://localhost:3000');
});
