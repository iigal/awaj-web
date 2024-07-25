const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
    res.render("all/index");
  });
  
  router.get("/aboutus", async (req, res) => {
    res.render("all/about");
  });
  
  router.get("/howtouse", async (req, res) => {
    res.render("all/howto");
  });
  
  router.get("/faq", async (req, res) => {
    res.render("all/faq");
  });
  
  router.get("/privacy", async (req, res) => {
    res.render("all/privacy");
  });

  module.exports = router;