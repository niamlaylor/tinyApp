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