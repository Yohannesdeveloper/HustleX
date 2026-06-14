const express = require("express");
const router = express.Router();
const seoController = require("../controllers/seoController");

// Programmatic SEO data endpoint
router.get("/api/seo/programmatic/:type/:slug", seoController.getProgrammaticPageData);

module.exports = router;
