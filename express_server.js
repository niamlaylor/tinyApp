const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, getUsersURLs } = require('./helpers');

// Create a server using express
const app = express();
// Set the port to be used in your http://localhost:<PORT>
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.example.com",
    userID: "userRandomID",
    visits: 0,
  },
};

const userDatabase = {
};

app.use(express.urlencoded({ extended: true })); // This is middleware that parses incoming requests with JSON payloads

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/urls');
  }
  if (!req.body.longURL.length) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. You must enter a URL.</h4>`);
  }
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visits: 0,
  };
  // This redirects them to /urls/:id and adds the generated ID to the path in its GET request
  res.redirect(`/urls/${id}`);
});

// This POST request comes in when the user hits "Delete" on the /urls page
app.post('/urls/:id/delete', (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. You need an account to delete URLs.</h4>`);
  } else if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. Unable to complete your request.</h4>`);
  } else { // The request carries in "id: ?????" and deletes it from our database
    delete urlDatabase[req.params.id];
    // Finally they get redirected to the /urls main page
    res.redirect('/urls');
  }
});

// This POST request comes in when a user updates the URL for an ID (e.g. http://localhost:808gvn 0/urls/b2xVn2)
app.post('/urls/:id', (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. Unable to complete your request.</h4>`);
  } else if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. This URL doesn't exist.</h4>`);
  } else { // looks up the url in the database using the id parameter then replaces it from the value entered in the form
    urlDatabase[req.params.id].longURL = req.body.longURL;
    urlDatabase[req.params.id].visits = 0;
    res.redirect('/urls');
  }
});

// A POST request to this route via the sign in form in the header will create a new cookie containing user_id
app.post('/login', (req, res) => {
  let userDetails = getUserByEmail(req.body.email, userDatabase);
  // This checks if the email or password fields are empty when submitted
  if (req.body.length === 0 || req.body.password.length === 0) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. You must enter an email and password value.</h4>`);
  }
  // If user not found (i.e. = null)
  if (!userDetails) {
    res.statusCode = 403;
    res.send(`<h4>${res.statusCode} error. Enter a valid username and/or password.</h4>`);
    // If user is found
  } else if (userDetails) {
    // If user is found and passwords match, then generate cookie for their ID
    if (bcrypt.compareSync(req.body.password, userDetails.password)) {
      req.session.user_id = userDetails.id;
      res.redirect('/urls');
      // If no password match, then return 403 error
    } else {
      res.statusCode = 403;
      res.send(`<h4>${res.statusCode} error. Enter a valid username and/or password.</h4>`);
    }
  }
});

app.post('/register', (req, res) => {
  // see post /login comments above as this is a similar process
  const randomID = generateRandomString();
  let userDetails = getUserByEmail(req.body.email, userDatabase);
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. You must enter an email and password value.</h4>`);
  }
  if (userDetails) {
    res.statusCode = 400;
    res.send(`<h4>${res.statusCode} error. A user already exists for this email address.</h4>`);
    // If user not found, create a new user object
  } else if (!userDetails) {
    const salt = bcrypt.genSaltSync(10);
    userDatabase[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
    };
    req.session.user_id = randomID;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  // Clears cookies on click of logout
  req.session = null;
  res.redirect('/login');
});

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user_id: req.session.user_id, userDatabase: userDatabase };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user_id: req.session.user_id, userDatabase: userDatabase };
  res.render('login', templateVars);
});

// This handles shortURL requests and redirects them to the longURL (e.g. http://localhost:8080/u/b2xVn2 goes to LHL website)
app.get('/u/:id', (req, res) => {
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id].visits += 1;
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send(`<h4>${res.statusCode} error. Unable to find this URL.</h4>`);
  }
});

// This outputs your URLs in JSON format for use as API
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// This route is the list of all created short URLs and their corresponding long URLS
app.get('/urls', (req, res) => {
  const matchingURLs = getUsersURLs(req.session.user_id, urlDatabase);
  const templateVars = { urls: matchingURLs, user_id: req.session.user_id, userDatabase: userDatabase };
  res.render('urls_index', templateVars);
});

// This is the route for the page with the form to submit a new long URL
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  // Allows the .ejs templates to pull the user_id and display if logged in
  const templateVars = { user_id: req.session.user_id, userDatabase: userDatabase };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  // If our user_id cookie doesn't equal the userID associated with the trackID parameter, then throw 404 error
  if (!urlDatabase[req.params.id].userID || req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.statusCode = 404;
    res.send(`<h4>${res.statusCode} error. No short URL found.</h4>`);
  } else if (!urlDatabase[req.params.id]) {
    res.statusCode = 404;
    res.send(`<h4>${res.statusCode} error. No short URL found.</h4>`);
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, visits: urlDatabase[req.params.id].visits, user_id: req.session.user_id, userDatabase: userDatabase };
    res.render('urls_show', templateVars);
  }
});

app.listen(PORT, () => {
  // This is the default message that appears on the host's console once the server is running
  console.log(`TinyApp listening on port ${PORT}!`);
});