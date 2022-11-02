const express = require('express');
const cookies = require("cookie-parser"); 
const bcrypt = require('bcryptjs'); 
const e = require('express');
const { request } = require('express');
// Create a server using express 
const app = express(); 
// Set the port to be used in your http://localhost:<PORT>
const PORT = 8080; 

app.set('view engine', 'ejs'); 
app.use(cookies()); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
// Helper function to generate a 6 character alphanumeric string
const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890'
  const charsLength = characters.length;
  let output = '';

  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * charsLength));
  };
  return output;
};
// Helper function to check if a user exists already
const getUserByEmail = (email, database) => {
  // If not found, it will return null
  let userFound = null;
  for (let user in database) {
    if (database[user].email === email) {
      userFound = database[user];
    }
    // If a user is found for the entered email, it will return as an object
  } return userFound;
};

app.use(express.urlencoded({ extended: true })); // This is middleware that parses incoming requests with JSON payloads

app.post('/urls', (req, res) => {
  const guestPostAttempt = `<!DOCTYPE html>
  <html lang="en"><div class="alert alert-primary" role="alert">
  This is a primary alert—check it out!
  </div></html>`
  if (!req.cookies["user_id"]) {
    res.end(`${guestPostAttempt}\n`);
  }
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  // This redirects them to /urls/:id and adds the generated ID to the path in its GET request
  res.redirect(`/urls/${id}`); 
});

// This POST request comes in when the user hits "Delete" on the /urls page
app.post('/urls/:id/delete', (req, res) => { 
  // The request carries in "id: ?????" and deletes it from our database
  delete urlDatabase[req.params.id]; 
  // Finally they get redirected to the /urls main page
  res.redirect('/urls'); 
});

// This POST request comes in when a user updates the URL for an ID (e.g. http://localhost:808gvn 0/urls/b2xVn2)
app.post('/urls/:id', (req, res) => {
  // It looks up the url in the database using the id parameter and then replaces it from the value entered in the form (req.body)
  urlDatabase[req.params.id] = req.body.longURL; 
  res.redirect('/urls');
});

// A POST request to this route via the sign in form in the header will create a new cookie containing user_id
app.post('/login', (req, res) => { 
  let userDetails = getUserByEmail(req.body.email, userDatabase);
  // This checks if the email or password fields are empty when submitted
  if (req.body.length === 0 || req.body.password.length === 0) { 
    res.statusCode = 400;
    res.send(res.statusCode)
  }
  // If user not found (i.e. = null)
  if (!userDetails) { 
    res.statusCode = 403;
    res.send(res.statusCode);
    // If user is found
  } else if (userDetails) { 
    // If user is found and passwords match, then generate cookie for their ID
    if (userDetails.password === req.body.password) { 
      res.cookie('user_id', userDetails.id);
      res.redirect('/urls');
      // If no password match, then return 403 error
    } else { 
      res.statusCode = 403;
      res.send(res.statusCode);
    }
  }
});

app.post('/register', (req, res) => {
  // see post /login comments above as this is a similar process
  const randomID = generateRandomString();
  let userDetails = getUserByEmail(req.body.email, userDatabase);
  if (req.body.length === 0 || req.body.password.length === 0) {
    res.statusCode = 400;
    res.send(res.statusCode)
  }
  if (userDetails) {
    res.statusCode = 400;
    res.send(res.statusCode)
    // If user not found, create a new user object
  } else if (!userDetails) {
    userDatabase[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', randomID);
    // Need this redirect back to /urls otherwise the page hangs
    res.redirect('/urls'); 
  }
  console.log(userDatabase);
});

app.post('/logout', (req, res) => {
  // Clears cookies on click of logout
  res.clearCookie('user_id'); 
  res.redirect('/login');
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  }
  const templateVars = { user_id: req.cookies["user_id"], userDatabase: userDatabase };
  // Renders the register ejs template
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  }
  const templateVars = { user_id: req.cookies["user_id"], userDatabase: userDatabase };
  // Renders the login page ejs template
  res.render('login', templateVars);
});

// This handles shortURL requests and redirects them to the longURL (e.g. http://localhost:8080/u/b2xVn2 goes to LHL website)
app.get('/u/:id', (req, res) => { 
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id]; 
    res.redirect(longURL);
  } else {
    res.redirect('/url-not-found');
  }
});

app.get('/url-not-found', (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"], userDatabase: userDatabase };
  res.render('404', templateVars);
});

// This outputs your URLs in JSON format for use as API
app.get('/urls.json', (req, res) => { 
  res.json(urlDatabase);
});

// This route is the list of all created short URLs and their corresponding long URLS
app.get('/urls', (req, res) => { 
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], userDatabase: userDatabase };
  res.render('urls_index', templateVars);
});

// This is the route for the page with the form to submit a new long URL
app.get('/urls/new', (req, res) => { 
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  }
  // Allows the .ejs templates to pull the user_id and display if logged in
  const templateVars = { user_id: req.cookies["user_id"], userDatabase: userDatabase }; 
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  // Check if id entered is in our urlDatabase
  if (!urlDatabase[req.params.id]) {
    res.redirect('/url-not-found')
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user_id: req.cookies["user_id"], userDatabase: userDatabase }; // This creates an object that contains key value pairs for 'id' and 'longURL' that can be used on the HTML template
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  // This is the default message that appears on the host's console once the server is running
  console.log(`Example app listening on port ${PORT}!`);
});