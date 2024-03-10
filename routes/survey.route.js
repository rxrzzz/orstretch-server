const surveyController = require("../controllers/survey.controller")
const router = require("express").Router()
router.post("/createSurvey", surveyController.createSurvey)
router.put("/editSurvey", surveyController.editSurvey)
router.delete("/deleteSurvey", surveyController.deleteSurvey)
module.exports = router