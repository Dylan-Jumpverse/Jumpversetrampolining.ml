const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

const app = express();

// Replace these with your actual credentials
const CLIENT_ID = "1366121206763487352";
const CLIENT_SECRET = "4jdIzHKuXNgMRoF3r_UAqwFck_my1aYP";
const CALLBACK_URL = "https://jumpversetrampolining-ml.onrender.com/callback";

// Express settings
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({
secret: "super-secret",
resave: false,
saveUninitialized: false
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
clientID: CLIENT_ID,
clientSecret: CLIENT_SECRET,
callbackURL: CALLBACK_URL,
scope: ["identify", "email"]
}, (accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

// Routes
app.get("/", (req, res) => {
res.render("index", { user: req.user });
});

app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
passport.authenticate("discord", { failureRedirect: "/" }),
(req, res) => res.redirect("/dashboard")
);

app.get("/dashboard", ensureAuth, (req, res) => {
res.render("dashboard", { user: req.user });
});

app.get("/logout", (req, res) => {
req.logout(() => {
res.redirect("/");
});
});

function ensureAuth(req, res, next) {
if (req.isAuthenticated()) return next();
res.redirect("/");
}

// Start server
app.listen(3000, () => {
console.log("Server live on http://localhost:3000");
});
