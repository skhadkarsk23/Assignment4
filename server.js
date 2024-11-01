/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Saurab Khadka Student ID: 148501224 Date: 2024/11/01
* 
*  Published URL: https://assignment4-ten-psi.vercel.app/
********************************************************************************/



const legoData = require("./modules/legoSets");
const path = require("path");
const express = require('express');
const app = express();


const HTTP_PORT = process.env.PORT || 8080;

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    let sets = await legoData.getAllSets(); 
    let randomSets = sets.sort(() => 0.5 - Math.random()).slice(0, 3);
    res.render('home', { sets: randomSets });  
  } catch (err) {
    res.status(500).send("Error loading sets"); 
  }
});

app.get('/about', (req, res) => {
  res.render('about');  
});


app.get("/lego/sets", async (req, res) => {
  let sets = [];
  
  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
      } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets });
  } catch (err) {
    res.status(404).render("404", { message: "Error loading sets" });
  }
});


app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });  
  } catch (err) {
    res.status(404).render("404", { message: "Set not found" }); 
  }
});

app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, Page not found" });  
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => { 
    console.log(`server listening on: ${HTTP_PORT}`); 
  });
});

