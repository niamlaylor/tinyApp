const { assert } = require('chai');
const { generateRandomString, getUserByEmail, getUsersURLs } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testURLs = {
  "b2xVn2": {
    longURL: "http://www.example.com",
    userID: "userRandomID"
  },
};

describe('getUserByEmail - happy path', () => {
  const user = getUserByEmail('user@example.com', testUsers);
  const expectedUserID = 'userRandomID';
  it('should return userRandomID when provided the email user@example.com', () => {
    assert.equal(user.id, expectedUserID);
  });
});

describe('getUserByEmail - email doesn\'t exist', () => {
  const user = getUserByEmail('email@notindatabase.com', testUsers);
  const expectedUserID = null;
  it('should return null when provided an email that is not associated with an account', () => {
    assert.equal(user, expectedUserID);
  });
});

describe('getUsersURL - happy path', () => {
  const userURLs = getUsersURLs('userRandomID', testURLs);
  const expectedURLs = {
    "b2xVn2": {
      longURL: "http://www.example.com",
      userID: "userRandomID"
    },
  };
  it('should return b2xVn2 as an object for the user: userRandomID', () => {
    assert.deepEqual(userURLs, expectedURLs);
  });
});

describe('getUsersURL - user that doesn\'t exist', () => {
  const userURLs = getUsersURLs('falseUser', testURLs);
  const expectedURLs = {
  };
  it('should return an empty object for a user that doesn\'t exist', () => {
    assert.deepEqual(userURLs, expectedURLs);
  });
});


