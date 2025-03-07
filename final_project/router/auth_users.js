const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "dennis", password: "abc" }];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  console.log("login: ", req.body);
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("add review: ", req.params, req.body, req.session);

  if (books[isbn]) {
    let book = books[isbn];
    // If the book doesn't have a reviews object yet, create it
    if (!book.reviews) {
      book.reviews = {};
    }
    // Add or update the review for this user
    book.reviews[username] = review;
    return res
      .status(200)
      .send(
        `The review for the book with ISBN ${isbn} has been added/updated.`
      );
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];

    // Check if the book has reviews and if the user has posted a review
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res
        .status(200)
        .send(
          `Review for the ISBN ${isbn} posted by the user ${username} deleted.`
        );
    } else {
      return res
        .status(404)
        .json({
          message: `No review found for ISBN ${isbn} by user ${username}`,
        });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
