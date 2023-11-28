require("dotenv").config({ path: "../.env" });
const excelJs = require("exceljs");
const moment = require("moment");
const axios = require("axios");
const EndOfDaySurvey = require("../models/model").endofday_survey;
const User = require("../models/model").users;

const triggerEndOfDaySurveyJSONWorkflow = async (req, res) => {
  try {
    const response = await axios.post(
      `https://iad1.qualtrics.com/inbound-event/v1/events/json/triggers?urlTokenId=${process.env.QUALTRICS_ENDOFDAY_URLTOKENID}`,
      { data: req.body }
    );
    return res.status(200).json({ data: response.data, isSuccess: true });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const exportEndOfDaySurveys = async (req, res) => {
  try {
    const idArray = req.query.ids;
    let ids;
    if (idArray) ids = JSON.parse(idArray);
    let endofday_surveys;
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("endofday_survey");
    sheet.columns = [
      { header: "ID", key: "id" },
      { header: "User Email", key: "email" },
      { header: "Day", key: "day" },
      {
        header: "Mentally Demanding Surgeries",
        key: "mentaly_demanding_surgeries",
      },
      {
        header: "Physically Demanding Surgeries",
        key: "physically_demanding_surgeries",
      },
      { header: "Complex Surgeries", key: "complex_surgeries" },
      { header: "Difficult Surgeries", key: "difficult_surgeries" },
      { header: "Impact (Physical)", key: "impact_physical" },
      { header: "Impact (Mental)", key: "impact_mental" },
      { header: "Impact (Pain)", key: "impact_pain" },
      { header: "Impact (Fatigue)", key: "impact_fatigue" },
      { header: "Distracting", key: "distracting" },
      { header: "Flow Impact", key: "flow_impact" },
      { header: "Comment", key: "comment" },
      { header: "Created At", key: "createdAt" },
      { header: "Updated At", key: "updatedAt" },
    ];
    if (ids) {
      endofday_surveys = await EndOfDaySurvey.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
        include: [{ model: User, as: "user", attributes: ["email"] }],
      });
    } else {
      endofday_surveys = await EndOfDaySurvey.findAll({
        include: [{ model: User, as: "user", attributes: ["email"] }],
      });
    }
    await endofday_surveys.map((value) => {
      sheet.addRow({
        id: value.id,
        email: value.user.email,
        day: value.day,
        mentaly_demanding_surgeries: value.mentaly_demanding_surgeries,
        physically_demanding_surgeries: value.physically_demanding_surgeries,
        complex_surgeries: value.complex_surgeries,
        difficult_surgeries: value.difficult_surgeries,
        impact_physical: value.impact_physical,
        impact_mental: value.impact_mental,
        impact_pain: value.impact_pain,
        impact_fatigue: value.impact_fatigue,
        distracting: value.distracting,
        flow_impact: value.flow_impact,
        comment: value.comment,
        createdAt: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
        updatedAt: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + "Endofday-Surveys.xlsx"
    );
    workbook.xlsx.write(res);
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const getEndOfDaySurveys = async (req, res) => {
  try {
    let page_no = 1;
    let no_of_surveys = 10;
    if (req.query.page_no) {
      page_no = Number(req.query.page_no) ?? 1;
    }
    if (req.query.no_of_surveys) {
      no_of_surveys = Number(req.query.no_of_surveys) ?? 10;
    }
    const offset = (page_no - 1) * no_of_surveys;
    const totalNoOfSurveys = await EndOfDaySurvey.count();

    if (isNaN(page_no) || page_no <= 0) {
      return res.status(400).json({
        message:
          "Invalid page number parameter. It should be a number and shouldn't be less than one.",
        isSuccess: false,
      });
    }
    const endOfDaySurveys = await EndOfDaySurvey.findAll({
      offset,
      limit: no_of_surveys,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["email"] }],
    });
    const maxPageCount = Math.ceil(totalNoOfSurveys / no_of_surveys);
    return res.status(200).json({
      endOfDaySurveys,
      totalNoOfSurveys,
      maxPageCount,
      isSuccess: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

module.exports = {
  triggerEndOfDaySurveyJSONWorkflow,
  getEndOfDaySurveys,
  exportEndOfDaySurveys,
};
