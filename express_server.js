const express = require('express');// Import the express library
const cookies = require("cookie-parser"); // Import cookie parser library
const app = express(); // Create a server using express 
const PORT = 8080; // Set the port to be used in your http://localhost:<PORT>

app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(cookies()); // allows us to use cookies

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "liamnaylor": "password123"
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

app.use(express.urlencoded({ extended: true })); // This is middleware that parses incoming requests with JSON payloads

app.post('/urls', (req, res) => {
  let id = generateRandomString() // This function creates a random six digit alphanumeric string and is defined above with global scope
  urlDatabase[id] = req.body.longURL; // req.body is the object created when a user submits the form
  res.redirect(`/urls/${id}`); // This redirects them to /urls/:id and adds the generated ID to the path in its GET request
});

app.post('/urls/:id/delete', (req, res) => { // This POST request comes in when the user hits "Delete" on the /urls page
  delete urlDatabase[req.params.id]; // The request carries in "id: ?????" and deletes it from our database
  res.redirect('/urls'); // Finally they get redirected to the /urls main page
});

app.post('/urls/:id', (req, res) => { // This POST request comes in when a suer updates the URL for an ID (e.g. http://localhost:8080/urls/b2xVn2)
  urlDatabase[req.params.id] = req.body.longURL; // It looks up the url in the database using the id parameter and then replaces it from the value entered in the form (req.body)
  res.redirect('/urls'); // Finally it redirects to the URL page, which reflects the change
});

app.post('/login', (req, res) => { // A POST request to this route via the sign in form in the header will create a new cookie containing username
  if (req.body.username.length && userDatabase[req.body.username] && userDatabase[req.body.username] === req.body.password) {
    res.cookie('username', req.body.username); // This creates the cookie with the key username and the value of whatever was inputted by the user
    res.redirect('/urls'); // Need this redirect back to /urls otherwise the page hangs
  } else {
    res.redirect('/urls');
  }
});

app.post('/register', (req, res) => {
  if (req.body.username.length && !userDatabase[req.body.username]) {
    userDatabase[req.body.username] = req.body.password;
    res.cookie('username', req.body.username); // This creates the cookie with the key username and the value of whatever was inputted by the user
    res.redirect('/urls'); // Need this redirect back to /urls otherwise the page hangs
  } else {
    res.redirect('/register');
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('register', templateVars);
});

app.get('/u/:id', (req, res) => { // This handles shortURL requests and redirects them to the longURL (e.g. http://localhost:8080/u/b2xVn2 goes to LHL website)
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id]; // req.params has one key called 'id' that you need to look up in the database here
    res.redirect(longURL);
  } else {
    res.redirect('/url-not-found');
  }
});

app.get('/url-not-found', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('404', templateVars);
});

app.get('/urls.json', (req, res) => { // This outputs your URLs in JSON format for use as API
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => { // This route is the list of all created short URLs and their corresponding long URLS
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // This is the route for the page with the form to submit a long URL
  const templateVars = { username: req.cookies["username"] }; // Allows the .ejs templates to pull the username and display if logged in
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] }; // This creates an object that contains key value pairs for 'id' and 'longURL' that can be used on the HTML template
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => { // This is the default message that appears on the host's console once the server is running
  console.log(`Example app listening on port ${PORT}!`);
});