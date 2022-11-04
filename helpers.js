// Below are helper functions used in express_server.js

// Helper function to generate a 6 character alphanumeric string
const generateRandomString = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  const charsLength = characters.length;
  let output = '';

  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * charsLength));
  }
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
//Helper function to filter urls to only ones matching the user_id cookie
const getUsersURLs = (user, database) => {
  let matchingURLs = {
  };
  for (const url in database) {
    if (database[url].userID === user) {
      matchingURLs[url] = database[url];
    }
  } return matchingURLs;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  getUsersURLs
};