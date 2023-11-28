require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const moment = require("moment");
const BaselineSurvey = require("../models/model").baseline_survey;
const Users = require("../models/model").users;
const excelJs = require("exceljs");
const nodeMailer = require("nodemailer");
const Client = require("ssh2-sftp-client");
const fs = require("fs");
const sendEmail = async (req, res) => {
  let emailToSendMessageTo = req.query.email;
  console.log({ emailToSendMessageTo });
  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  let transporter = nodeMailer.createTransport(config);

  let message = {
    from: `'"Mayo Clinic" <${process.env.EMAIL}>'`,
    to: "adeleyetemiloluwa674@gmail.com",
    subject: "Mayo Clinic OR Stretch Baseline Survey",
    html: `<p>Hello, ${emailToSendMessageTo}</p></br><p><a href="https://surveys.mayoclinic.org/jfe/form/SV_ebd7AWFnBL8r02O">Here is the link to the baseline survey.</a><p>`,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        message: "You should receive an email",
        isSuccess: true,
      });
    })
    .catch((error) => {
      return res.status(400).json({ message: error, isSuccess: false });
    });
};

const triggerBaselineSurveyJSONWorkflow = async (req, res) => {
  try {
    const response = await axios.post(
      `https://iad1.qualtrics.com/inbound-event/v1/events/json/triggers?urlTokenId=${process.env.QUALTRICS_BASELINE_URLTOKENID}&force_isolation=true`,
      { data: req.body }
    );

    if (response.data.meta.httpStatus) {
      return res.status(200).json({
        status: response.data.meta.httpStatus,
        isSuccess: true,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const getSurveyResponses = async (req, res) => {
  const sftp = new Client();
  const config = {
    host: process.env.SFTPHOST,
    user: process.env.SFTPUSER,
    password: process.env.SFTPPASSWORD,
    port: process.env.SFTPPORT,
  };
  const filePath = "/inbox";

  try {
    await sftp.connect(config);
    const files = await sftp.list(filePath);
    const fileInfo = JSON.stringify(files);
    if (files && files.length > 0) {
      return res.status(200).json(JSON.parse(fileInfo));
    } else {
      return res.status(500).json({ m: "error" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    sftp.end();
  }
};

const getBaselineSurveys = async (req, res) => {
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
    const totalNoOfSurveys = await BaselineSurvey.count();

    if (isNaN(page_no) || page_no <= 0) {
      return res.status(400).json({
        message:
          "Invalid page number parameter. It should be a number and shouldn't be less than one.",
        isSuccess: false,
      });
    }

    const baselineSurveys = await BaselineSurvey.findAll({
      offset,
      limit: no_of_surveys,
      order: [["createdAt", "DESC"]],
    });
    const maxPageCount = Math.ceil(totalNoOfSurveys / no_of_surveys);
    return res.status(200).json({
      baselineSurveys,
      totalNoOfSurveys,
      isSuccess: true,
      maxPageCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const exportBaselineSurveys = async (req, res) => {
  try {
    const idArray = req.query.ids;
    let ids;
    if (idArray) ids = JSON.parse(idArray);
    let baseline_surveys;
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("baseline_surveys");
    sheet.columns = [
      { header: "Pain Open Surgery", key: "pain_open_surgery" },
      { header: "Pain Larascopic Surgery", key: "pain_larascopic_surgery" },
      { header: "Pain Robotic Surgery", key: "pain_robotic_surgery" },
      { header: "Pain Interfered Relations", key: "pain_interfered_relations" },
      { header: "Pain Interfered Sleep", key: "pain_interfered_sleep" },
      { header: "Height", key: "height" },
      { header: "Age", key: "age" },
      { header: "Gender", key: "gender" },
      { header: "Handness", key: "handness" },
      { header: "Glove Size", key: "glove_size" },
      { header: "Surgical Procedures (Day)", key: "surgical_procedures_day" },
      { header: "Days Per Week", key: "days_per_week" },
      { header: "Exercise", key: "exercise" },
      { header: "Primary Specialty", key: "primary_speciality" },
      { header: "Years Open Surgery", key: "years_open_surgery" },
      { header: "Years Larascopic Surgery", key: "years_laparoscopic_surgery" },
      { header: "Years Robotic Surgery", key: "years_robotic_surgery" },
      { header: "Most Common Procedure (A)", key: "most_common_procedures_a" },
      { header: "Most Common Procedure (B)", key: "most_common_procedures_b" },
      { header: "Most Common Procedure (C)", key: "most_common_procedures_c" },
      { header: "Date Created", key: "created_at" },
      { header: "Date Updated", key: "updated_at" },
    ];

    if (ids) {
      baseline_surveys = await BaselineSurvey.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });
    } else {
      baseline_surveys = await BaselineSurvey.findAll();
    }
    await baseline_surveys.map((value) => {
      sheet.addRow({
        created_at: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
        updated_at: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
        tags_excel: value.tags_excel,
        pain_open_surgery: value.pain_open_surgery ?? "",
        pain_larascopic_surgery: value.pain_larascopic_surgery ?? "",
        pain_robotic_surgery: value.pain_robotic_surgery ?? "",
        pain_interfered_relations: value.pain_interfered_relations ?? "",
        pain_interfered_sleep: value.pain_interfered_sleep ?? "",
        height: value.height ?? "",
        age: value.age ?? "",
        gender: value.gender ?? "",
        glove_size: value.glove_size ?? "",
        surgical_procedures_day: value.surgical_procedures_day ?? "",
        days_per_week: value.days_per_week ?? "",
        exercise: value.exercise ?? "",
        primary_speciality: value.primary_speciality ?? "",
        years_open_surgery: value.years_open_surgery ?? "",
        years_laparoscopic_surgery: value.years_laparoscopic_surgery ?? "",
        years_robotic_surgery: value.years_robotic_surgery ?? "",
        most_common_procedures_a: value.most_common_procedures_a ?? "",
        most_common_procedures_b: value.most_common_procedures_b ?? "",
        most_common_procedures_c: value.most_common_procedures_c ?? "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + "Baseline-Surveys.xlsx"
    );
    workbook.xlsx.write(res);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

module.exports = {
  sendEmail,
  triggerBaselineSurveyJSONWorkflow,
  getSurveyResponses,
  exportBaselineSurveys,
  getBaselineSurveys,
};
