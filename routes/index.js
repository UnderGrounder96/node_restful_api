const router = require("express").Router();

router.get("/", (req, res) => {
  console.log("Welcome to my website!");
  return res.render("index");
});

module.exports = router;
