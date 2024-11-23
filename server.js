/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Saurab Khadka Student ID: 148501224 Date: 2024/11/22
* 
*  Published URL: https://assignment4-ten-psi.vercel.app/
********************************************************************************/

require('dotenv').config();
const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route for adding a set
app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (err) {
    res.status(500).render('500', { message: `Error fetching themes: ${err.message}` });
  }
});

app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `Error adding set: ${err.message}` });
  }
});

// Route for editing a set
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const [set, themes] = await Promise.all([
      legoData.getSetByNum(req.params.num),
      legoData.getAllThemes(),
    ]);
    res.render('editSet', { set, themes });
  } catch (err) {
    res.status(404).render('404', { message: `Error loading set: ${err.message}` });
  }
});

app.post('/lego/editSet', async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `Error updating set: ${err.message}` });
  }
});

// Route to delete a set
app.get('/lego/deleteSet/:num', async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `Error deleting set: ${err.message}` });
  }
});

// Home route
app.get('/', (req, res) => res.render('home'));

// About route
app.get('/about', (req, res) => res.render('about'));

// Route to view all sets or filter by theme
app.get('/lego/sets', async (req, res) => {
  try {
    const sets = req.query.theme
      ? await legoData.getSetsByTheme(req.query.theme)
      : await legoData.getAllSets();
    res.render('sets', { sets });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});

// Route to view a specific set
app.get('/lego/sets/:num', async (req, res) => {
  try {
    const legoSet = await legoData.getSetByNum(req.params.num);
    res.render('set', { set: legoSet });
  } catch (err) {
    res.status(404).render('404', { message: `Set not found: ${err.message}` });
  }
});

// 404 fallback route
app.use((req, res) => res.status(404).render('404', { message: 'Page not found.' }));

// Initialize database and start the server
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
}).catch((err) => {
  console.error(`Failed to initialize database: ${err.message}`);
});
