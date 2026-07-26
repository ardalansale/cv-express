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

// Lägg till kurs - skicka tillbaka användarens tidigare input så de slipper skriva om allt
app.post('/add', async (req, res) => {
    const { coursecode, coursename, progression, syllabus } = req.body;

    // Serverside-validering
    let errors = [];

    if (!coursecode || coursecode.trim() === '') {
        errors.push("Kurskod saknas.");
    }

    if (!coursename || coursename.trim() === '') {
        errors.push("Kursnamn saknas.");
    }

    if (!progression || !['A', 'B', 'C'].includes(progression.toUpperCase())) {
        errors.push("Progression måste vara A, B eller C.");
    }

    if (!syllabus || syllabus.trim() === '') {
        errors.push("Länk till kursplan saknas.");
    }

    // Om fel finns; rendera add.ejs igen med felmeddelanden
    if (errors.length > 0) {
        return res.render('add', {
            errors,
            formData: { coursecode, coursename, progression, syllabus }
        });
    }

    // Om allt är OK; spara i databasen
    await pool.query(
        'INSERT INTO courses (coursecode, coursename, progression, syllabus) VALUES ($1, $2, $3, $4)',
        [coursecode, coursename, progression.toUpperCase(), syllabus]
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
