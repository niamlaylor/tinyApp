const express = require('express');// Import the express library
const app = express(); // Create a server using express 
const PORT = 8080; // Set the port to be used in your http://localhost:<PORT>

app.set('view engine', 'ejs'); // set the view engine to ejs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890'
  const charsLength = characters.length;
  let output = '';

  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * charsLength));
  };
  return output;
};

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request to console
  res.send("Ok"); // Respond with "Ok"
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});