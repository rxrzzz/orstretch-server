const express = require("express");
const morgan = require("morgan");
const axios = require("axios")
require("dotenv").config();
// const verifyToken = require("./middleware/verifyToken");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));


// app.post('/fillBaselineSurveyResponse', (req, res) => {
//   const responseData = req.body;
//   const responseId = responseData;
//   console.log('Received webhook notification for response ID:', responseId);
//   res.status(200).json(responseData);
// });



const accountRouter = require("./routes/account.route");
app.use("/api/accounts", accountRouter);


// app.use(verifyToken);

const userRouter = require("./routes/user.route");
app.use("/api/users", userRouter);

const eventRouter = require("./routes/event.route");
app.use("/api/events", eventRouter);

const tagRouter = require("./routes/tag.route");
app.use("/api/tags", tagRouter);

const linkRouter = require("./routes/link.route");
app.use("/api/links", linkRouter);

const baselineSurveyRouter = require("./routes/baselinesurvey.route");
app.use("/api/baselinesurvey", baselineSurveyRouter);

const endofdaySurveyRouter = require("./routes/endofdaysurvey.route");
app.use("/api/endofdaysurvey", endofdaySurveyRouter);

const surveyRouter = require("./routes/survey.route")
app.use("/api/survey", surveyRouter);

const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || "127.0.0.1"

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// const apiToken = 'Bih0jEQQBYPyVmFomf9vpZU56YFFDvDFVbJ7dgk5';
// const surveyId = 'SV_ebd7AWFnBL8r02O';
// const datacenter = 'iad1';
// const webhookUrl = `https://easy-egret-tough.ngrok-free.app/api/baselinesurvey/fillBaselineSurveyResponse`; // Replace with your Ngrok URL
// const eventSubscriptionUrl = `https://${datacenter}.qualtrics.com/API/v3/eventsubscriptions/`;

// const eventData = {
//   topics: `surveyengine.completedResponse.${surveyId}`,
//   publicationUrl: webhookUrl,
//   encrypt: false
// };

// const headers = {
//   'X-API-TOKEN': apiToken,
//   'Content-Type': 'application/json'
// };

// axios.post(eventSubscriptionUrl, eventData, { headers })
//   .then(response => {
//     console.log('Event subscription successful:', response.data);
//   })
//   .catch(error => {
//     console.error('Error subscribing to events:', error.message);
//   });