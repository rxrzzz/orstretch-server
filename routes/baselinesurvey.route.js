const baselineSurveyController = require("../controllers/baselinesurvey.controller");

const router = require("express").Router();
router.post("/sendBaselineSurvey", baselineSurveyController.sendEmail);
router.post(
  "/triggerBaselineSurveyWorkflow",
  baselineSurveyController.triggerBaselineSurveyJSONWorkflow
);
router.get("/getSurveyResponses", baselineSurveyController.getSurveyResponses);
router.post("/getBaselineSurveys", baselineSurveyController.getBaselineSurveys)
router.get("/export", baselineSurveyController.exportBaselineSurveys)
module.exports = router;
