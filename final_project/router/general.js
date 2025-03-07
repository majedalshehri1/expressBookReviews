const express = require("express");
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBookList().then(
    (bk) => res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send("denied")
  );
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getFromISBN(isbn).then(
    (bk) => res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send(error)
  );
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getFromAuthor(author).then(
    (result) => {
      if (result.length === 0) {
        return res.status(404).json({ message: "Author not found" });
      }
      res.send(JSON.stringify(result, null, 4));
    },
    (error) => res.status(404).send(error)
  );
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getFromTitle(title).then(
    (result) => {
      if (result.length === 0) {
        return res.status(404).json({ message: "Title not found" });
      }
      res.send(JSON.stringify(result, null, 4));
    },
    (error) => res.status(404).send(error)
  );
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const ISBN = req.params.isbn;
  if (books[ISBN] && books[ISBN].reviews) {
    res.send(books[ISBN].reviews);
  } else {
    res.status(404).json({ message: "ISBN not found or no reviews available" });
  }
});

// Promise implementations for API endpoints

// Task 10: Get book list with Promise
function getBookList() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("Books data not available");
    }
  });
}

// Task 11: Get book by ISBN with Promise
function getFromISBN(isbn) {
  let book_ = books[isbn];
  return new Promise((resolve, reject) => {
    if (book_) {
      resolve(book_);
    } else {
      reject("Unable to find book!");
    }
  });
}

// Task 12: Get books by author with Promise
function getFromAuthor(author) {
  let output = [];
  return new Promise((resolve, reject) => {
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.author === author) {
        output.push(book_);
      }
    }
    resolve(output);
  });
}

// Task 13: Get books by title with Promise
function getFromTitle(title) {
  let output = [];
  return new Promise((resolve, reject) => {
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.title === title) {
        output.push(book_);
      }
    }
    resolve(output);
  });
}

module.exports.general = public_users;
