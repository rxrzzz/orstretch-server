const baselineSurveyController = require("../controllers/baselinesurvey.controller");

const router = require("express").Router();

router.post("/sendBaselineSurvey", baselineSurveyController.sendEmail);
router.post(
  "/triggerBaselineSurveyWorkflow",
  baselineSurveyController.triggerBaselineSurveyJSONWorkflow
);
router.get("/getSurveyResponses", baselineSurveyController.getSurveyResponses);
router.get("/getBaselineSurveys", baselineSurveyController.getBaselineSurveys)
router.get("/export", baselineSurveyController.exportBaselineSurveys)
router.post("/fillBaselineSurveyResponse", baselineSurveyController.fillBaselineSurveyResponse)
module.exports = router;
