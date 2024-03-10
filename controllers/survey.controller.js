require("dotenv").config({ path: "../.env" });
const { default: axios } = require("axios");
const db = require("../models/model")
const Survey = db.survey;

const createSurvey = async (req, res) => {
  try {
    const [surveyId, surveyLink, endpointLink] = [req.body.surveyID, req.body.surveyLink, req.body.endpointLink];
    if (!surveyId || !surveyLink || !endpointLink) {
      return res.status(400).json({ message: "The survey ID and survey link and survey endpoint should be provided", isSuccess: false })
    }
    const { createdAt, surveyName, updatedAt, questionTexts } = await extractQuestions(surveyId)
    const survey = await Survey.create({
      surveyID: surveyName,
      surveyLink,
      name: surveyName,
      createdAt,
      updatedAt,
      endpointLink,
      ...questionTexts,
    })
    if (survey)
      return res.status(200).json({ message: "Survey successfully created", isSuccess: true })
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false })
  }
}

const extractQuestions = async (surveyId) => {
  const response = await axios.get(`${process.env.QUALTRICS_SURVEY_ENDPOINT}/${surveyId}`, {
    headers: {
      "X-API-TOKEN": process.env.X_API_TOKEN
    }
  })
  const surveyName = response.data.result.name;
  const createdAt = response.data.result.creationDate;
  const updatedAt = response.data.result.lastModifiedDate
  const questionTexts = extractQuestionText(response.data)
  return { surveyName, createdAt, updatedAt, questionTexts }
}

function extractQuestionText(jsonData) {
  const questions = jsonData.result.questions;
  const questionsArray = Object.keys(questions).map(questionId => [questions[questionId].questionName, questions[questionId].questionText])
  const questionTexts = questionsArray.reduce((acc, [text, id]) => {
    acc[text] = id;
    return acc;
  }, {})
  return questionTexts;
}
const editSurvey = async (req, res) => {
  try {
    console.log(req.params)
    const surveyId = req.params.survey_id;
    console.log(req.params)
    if (surveyId === undefined || surveyId === null) {
      return res.status(400).json({ message: "The survey ID hasn't been provided", isSuccess: false })
    }
    const surveyExists = await Survey.findOne({ where: { id: surveyId } })
    if (!surveyExists) {
      return res.status(404).json({ message: `Survey with ID ${surveyId} could not be found`, isSuccess: false })
    }
    await Survey.update(req.body, { where: { id: surveyId } })
    return res.status(200).json({ message: "Survey updated successfully", isSuccess: true })
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false })
  }
}

const deleteSurvey = async (req, res) => {
  try {
    const surveyId = req.params.survey_id;
    if (surveyId === undefined || surveyId === null) {
      return res.status(400).json({ message: "The survey ID hasn't been provided", isSuccess: false })
    }
    const surveyExists = await Survey.destroy({ where: { id: surveyId } })
    if (!surveyExists) {
      return res.status(404).json({ message: `Survey with ID ${surveyId} could not be found`, isSuccess: false })
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false })
  }
}

module.exports = {
  createSurvey,
  editSurvey,
  deleteSurvey
}