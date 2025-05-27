const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

// === STATIC & TEMPLATE SETUP ===
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// === SESSION & AUTH ===
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false
}));

passport.use(new DiscordStrategy({
  clientID: "1366121206763487352",
  clientSecret: "4jdIzHKuXNgMRoF3r_UAqwFck_my1aYP",
  callbackURL: "https://jumpversetrampolining-ml.onrender.com/auth/discord/callback",
  scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// === ROUTES ===
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/login", passport.authenticate("discord"));

app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => res.redirect("/dashboard")
);

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/dashboard", ensureAuth, (req, res) => {
  res.render("dashboard", { username: req.user.username });
});

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

