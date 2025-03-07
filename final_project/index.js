const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

// ✅ Setup session middleware for customer authentication
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// ✅ Authentication middleware for protecting /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    // Check if authorization exists in the session
    let token = req.session.authorization["accessToken"];

    jwt.verify(token, "access", (err, user) => {
      // Verify JWT token
      if (!err) {
        req.user = user; // Store user data in the request
        next(); // Allow request to proceed
      } else {
        return res.status(403).json({ message: "User not authenticated" }); // Forbidden access
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" }); // No session found
  }
});

const PORT = 5002;

// ✅ Define routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// ✅ Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
