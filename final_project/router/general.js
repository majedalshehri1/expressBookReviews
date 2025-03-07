const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  if (users[username]) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users[username] = { username, password };
  return res.status(201).json({ message: "User registered successfully!" });
});

public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book);
});

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let filteredBooks = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      filteredBooks.push(books[key]);
    }
  }

  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }

  return res.status(200).json(filteredBooks);
});

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let filteredBooks = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      filteredBooks.push(books[key]);
    }
  }

  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  return res.status(200).json(filteredBooks);
});

public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
