const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
secret: "secret-key",
resave: false,
saveUninitialized: false
}));

passport.use(new DiscordStrategy({
clientID: "1366121206763487352",
clientSecret: "4jdIzHKuXNgMRoF3r_UAqwFck_my1aYP",
callbackURL: "https://jumpversetrampolining-ml.onrender.com",
scope: ["identify"]
}, function(accessToken, refreshToken, profile, done) {
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

app.get("/", (req, res) => {
res.render("index", { user: req.user });
});

app.get("/login", passport.authenticate("discord"));
app.get("/auth/discord/callback", passport.authenticate("discord", {
failureRedirect: "/"
}), (req, res) => {
res.redirect("/");
});
app.get("/logout", (req, res) => {
req.logout(() => {
res.redirect("/");
});
});

app.get("/dashboard", ensureAuth, (req, res) => {
res.send(`Welcome to the JumpVerse Dashboard, ${req.user.username}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
