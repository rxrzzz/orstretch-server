const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
// const verifyToken = require("./middleware/verifyToken");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

function getResponse(d, dataCenter, apiToken) {
  const responseID = d['ResponseID']
  const surveyID = d['SurveyID']
  const headers = {
    "content-type": "application/json",
    "x-api-token": apiToken,
  }
  const apiUrl = `https://${dataCenter}.qualtrics.com/API/v3/surveys/${surveyID}/responses/${responseID}`;

  axios.get(apiUrl, { headers })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log("Error: " + error.message);
    });
}

function parseData(c) {
  const parsedData = querystring.parse(c.toString())
  parsedData['CompletedDate'] = decodeURIComponent(parsedData['CompletedDate'])
  return parsedData
}

app.post('/', (req, res) => {
  const postData = parseData(req.body);
  const apiToken = "Bih0jEQQBYPyVmFomf9vpZU56YFFDvDFVbJ7dgk5";
  const dataCenter = "iad1";
  if (!apiToken || !dataCenter) {
    console.log("Set environment variables APIKEY and DATACENTER");
    process.exit(2);
  }
  getResponse(postData, dataCenter, apiToken);
  res.send('Received');
});

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
