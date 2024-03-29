require("dotenv").config({ path: "../.env" });
const Op = require("sequelize").Op;
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
    const email = req.body.email;
    const firstname = req.body.firstName;
    const lastname = req.body.lastName;

    const response = await axios.post(
      `https://iad1.qualtrics.com/inbound-event/v1/events/json/triggers?urlTokenId=${process.env.QUALTRICS_BASELINE_URLTOKENID}&force_isolation=true`,
      { email, firstname, lastname },
      {
        proxy: {
          protocol: "https",
          host: "mcproxy-swg.mayo.edu",
          port: 3128,
        },
      }
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
    const jsonfile = files.filter((file) => file.name.endsWith(".json"))[2];
    if (jsonfile) {
      const fileContent = await sftp.get(`${filePath}/${jsonfile.name}`);
      const jsonData = JSON.parse(fileContent.toString());
      return res.status(200).json(jsonData);
    } else {
      return res.status(404).json({ message: "No JSON files found." });
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
    let order = req.query.order ?? "DESC";
    let sortBy = req.query.sortBy ?? "createdAt";

    let userid = req.query.userid;
    let pain_open_surgery = req.query.pain_open_surgery;
    let pain_laparoscopic_surgery = req.query.pain_laparoscopic_surgery;
    let pain_robotic_surgery = req.query.pain_robotic_surgery;
    let pain_past_six_months = req.query.pain_past_six_months;
    let pain_interfered_relations = req.query.pain_interfered_relations;
    let pain_interfered_sleep = req.query.pain_interfered_sleep;
    let height = req.query.height;
    let age = req.query.age;
    let gender = req.query.gender;
    let handness = req.query.handness;
    let glove_size = req.query.glove_size;
    let surgical_procedures_day = req.query.surgical_procedures_day;
    let days_per_week = req.query.days_per_week;
    let exercise = req.query.exercise;
    let primary_speciality = req.query.primary_speciality;
    let years_open_surgery = req.query.years_open_surgery;
    let years_laparoscopic_surgery = req.query.years_laparoscopic_surgery;
    let years_robotic_surgery = req.query.years_robotic_surgery;
    let most_common_procedures_a = req.query.most_common_procedures_a;
    let most_common_procedures_b = req.query.most_common_procedures_b;
    let most_common_procedures_c = req.query.most_common_procedures_c;

    if (req.query.page_no) {
      page_no = Number(req.query.page_no) ?? 1;
    }

    if (req.query.no_of_surveys) {
      no_of_surveys = Number(req.query.no_of_surveys) ?? 10;
    }

    const offset = (page_no - 1) * no_of_surveys;

    const totalNoOfSurveys = await BaselineSurvey.count({
      where: {
        [Op.and]: [
          userid !== undefined && {
            userid: {
              [Op.eq]: userid,
            },
          },

          pain_open_surgery !== undefined &&
          pain_open_surgery !== "" && {
            pain_open_surgery: {
              [Op.eq]: pain_open_surgery,
            },
          },

          pain_laparoscopic_surgery !== undefined &&
          pain_laparoscopic_surgery !== "" && {
            pain_laparoscopic_surgery: {
              [Op.eq]: pain_laparoscopic_surgery,
            },
          },

          pain_robotic_surgery !== undefined &&
          pain_robotic_surgery !== "" && {
            pain_robotic_surgery: {
              [Op.eq]: pain_robotic_surgery,
            },
          },

          pain_past_six_months !== undefined &&
          pain_past_six_months !== "" && {
            pain_past_six_months: {
              [Op.eq]: pain_past_six_months,
            },
          },

          pain_interfered_relations !== undefined &&
          pain_interfered_relations !== "" && {
            pain_interfered_relations: {
              [Op.eq]: pain_interfered_relations,
            },
          },

          pain_interfered_sleep !== undefined &&
          pain_interfered_sleep !== "" && {
            pain_interfered_sleep: {
              [Op.eq]: pain_interfered_sleep,
            },
          },

          height !== undefined &&
          height !== "" && {
            height: {
              [Op.eq]: height,
            },
          },

          age !== undefined &&
          age !== "" && {
            age: {
              [Op.eq]: age,
            },
          },

          gender !== undefined &&
          gender !== "" && {
            gender: {
              [Op.eq]: gender,
            },
          },

          handness !== undefined &&
          handness !== "" && {
            handness: {
              [Op.eq]: handness,
            },
          },

          glove_size !== undefined &&
          glove_size !== "" && {
            glove_size: {
              [Op.eq]: glove_size,
            },
          },

          surgical_procedures_day !== undefined &&
          surgical_procedures_day !== "" && {
            surgical_procedures_day: {
              [Op.eq]: surgical_procedures_day,
            },
          },

          days_per_week !== undefined &&
          days_per_week !== "" && {
            days_per_week: {
              [Op.eq]: days_per_week,
            },
          },

          exercise !== undefined &&
          exercise !== "" && {
            exercise: {
              [Op.eq]: exercise,
            },
          },

          primary_speciality !== undefined &&
          primary_speciality !== "" && {
            primary_speciality: {
              [Op.eq]: primary_speciality,
            },
          },

          years_open_surgery !== undefined &&
          years_open_surgery !== "" && {
            years_open_surgery: {
              [Op.eq]: years_open_surgery,
            },
          },

          years_laparoscopic_surgery !== undefined &&
          years_laparoscopic_surgery !== "" && {
            years_laparoscopic_surgery: {
              [Op.eq]: years_laparoscopic_surgery,
            },
          },

          years_robotic_surgery !== undefined &&
          years_robotic_surgery !== "" && {
            years_robotic_surgery: {
              [Op.eq]: years_robotic_surgery,
            },
          },

          most_common_procedures_a !== undefined &&
          most_common_procedures_a !== "" && {
            most_common_procedures_a: {
              [Op.eq]: most_common_procedures_a,
            },
          },

          most_common_procedures_b !== undefined &&
          most_common_procedures_b !== "" && {
            most_common_procedures_b: {
              [Op.eq]: most_common_procedures_b,
            },
          },

          most_common_procedures_c !== undefined &&
          most_common_procedures_c !== "" && {
            most_common_procedures_c: {
              [Op.eq]: most_common_procedures_c,
            },
          },
        ],
      },
    });

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
      order: [[sortBy, order]],
      where: {
        [Op.and]: [
          userid !== undefined && {
            userid: {
              [Op.eq]: userid,
            },
          },

          pain_open_surgery !== undefined &&
          pain_open_surgery !== "" && {
            pain_open_surgery: {
              [Op.eq]: pain_open_surgery,
            },
          },

          pain_laparoscopic_surgery !== undefined &&
          pain_laparoscopic_surgery !== "" && {
            pain_laparoscopic_surgery: {
              [Op.eq]: pain_laparoscopic_surgery,
            },
          },

          pain_robotic_surgery !== undefined &&
          pain_robotic_surgery !== "" && {
            pain_robotic_surgery: {
              [Op.eq]: pain_robotic_surgery,
            },
          },

          pain_past_six_months !== undefined &&
          pain_past_six_months !== "" && {
            pain_past_six_months: {
              [Op.eq]: pain_past_six_months,
            },
          },

          pain_interfered_relations !== undefined &&
          pain_interfered_relations !== "" && {
            pain_interfered_relations: {
              [Op.eq]: pain_interfered_relations,
            },
          },

          pain_interfered_sleep !== undefined &&
          pain_interfered_sleep !== "" && {
            pain_interfered_sleep: {
              [Op.eq]: pain_interfered_sleep,
            },
          },

          height !== undefined &&
          height !== "" && {
            height: {
              [Op.eq]: height,
            },
          },

          age !== undefined &&
          age !== "" && {
            age: {
              [Op.eq]: age,
            },
          },

          gender !== undefined &&
          gender !== "" && {
            gender: {
              [Op.eq]: gender,
            },
          },

          handness !== undefined &&
          handness !== "" && {
            handness: {
              [Op.eq]: handness,
            },
          },

          glove_size !== undefined &&
          glove_size !== "" && {
            glove_size: {
              [Op.eq]: glove_size,
            },
          },

          surgical_procedures_day !== undefined &&
          surgical_procedures_day !== "" && {
            surgical_procedures_day: {
              [Op.eq]: surgical_procedures_day,
            },
          },

          days_per_week !== undefined &&
          days_per_week !== "" && {
            days_per_week: {
              [Op.eq]: days_per_week,
            },
          },

          exercise !== undefined &&
          exercise !== "" && {
            exercise: {
              [Op.eq]: exercise,
            },
          },

          primary_speciality !== undefined &&
          primary_speciality !== "" && {
            primary_speciality: {
              [Op.eq]: primary_speciality,
            },
          },

          years_open_surgery !== undefined &&
          years_open_surgery !== "" && {
            years_open_surgery: {
              [Op.eq]: years_open_surgery,
            },
          },

          years_laparoscopic_surgery !== undefined &&
          years_laparoscopic_surgery !== "" && {
            years_laparoscopic_surgery: {
              [Op.eq]: years_laparoscopic_surgery,
            },
          },

          years_robotic_surgery !== undefined &&
          years_robotic_surgery !== "" && {
            years_robotic_surgery: {
              [Op.eq]: years_robotic_surgery,
            },
          },

          most_common_procedures_a !== undefined &&
          most_common_procedures_a !== "" && {
            most_common_procedures_a: {
              [Op.eq]: most_common_procedures_a,
            },
          },

          most_common_procedures_b !== undefined &&
          most_common_procedures_b !== "" && {
            most_common_procedures_b: {
              [Op.eq]: most_common_procedures_b,
            },
          },

          most_common_procedures_c !== undefined &&
          most_common_procedures_c !== "" && {
            most_common_procedures_c: {
              [Op.eq]: most_common_procedures_c,
            },
          },
        ],
      },
    });

    const maxPageCount = Math.ceil(totalNoOfSurveys / no_of_surveys);

    return res.status(200).json({
      baselineSurveys,
      totalNoOfSurveys,
      isSuccess: true,
      maxPageCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, isSuccess: false });
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

const fillBaselineSurveyResponse = async (req, res) => {
  try {
    const surveyInfo = req.body;
    const responseID = "R_7kLXG2E73JDUerO" ?? surveyInfo.ResponseID ?? ""
    const surveyID = "SV_ebd7AWFnBL8r02O" ?? surveyInfo.SurveyID ?? ""
    const response = await axios.get(`https://yul1.qualtrics.com/API/v3/surveys/${surveyID}/responses/${responseID}`, {
      headers: {
        'Accept': 'application/json',
        'X-API-TOKEN': process.env.X_API_TOKEN
      }
    });
    const values = extractData(response.data)
    const baselinesurvey = await BaselineSurvey.create({
      ...values
    })
    return res.status(200).json({ baselinesurvey, isSuccess: true });

  } catch (err) {
    res.status(500).json({ message: err, isSuccess: false })
  }
}

// const link = await Link.create({
//   name: req.body.name,
//   url: req.body.url,
//   type: Number(req.body.media_type) === 1 ? "video" : "name",
// });
const extractData = (response) => {
  const result = response.result
  const userid = 29
  const createdAt = result.values.startDate
  const updatedAt = result.values.endDate
  const pain_open_surgery = result.values.QID11
  const pain_larascopic_surgery = result.values.QID25
  const pain_endoscopic_surgery = result.values.QID30
  const pain_orifice_surgery = result.values.QID29
  const pain_robotic_surgery = result.values.QID26
  const pain_past_six_months = result.values.QID20
  const pain_interfered_relations = result.values.Q1D21
  const pain_interfered_sleep = result.values.QID27
  const pain_interfered_future_surgery = result.values.QID32
  const height = result.values.QID13_4_TEXT
  const weight = result.values.QID28_4_TEXT
  const age = result.values.QID14_TEXT
  const gender = result.values.QID_15
  const handness = result.values.QID22
  const glove_size = result.values.QID16_10_TEXT
  const surgical_procedures_day = result.values.QID17
  const days_per_week = result.values.QID18
  const exercise = result.values.QID19
  const primary_speciality = result.values.QID17_14_TEXT
  // "QID9_1": 1,
  // "QID9_2": 2,
  // "QID9_4": 3,
  // "QID9_7": 4,
  // "QID9_3": 0,
  const years_open_surgery = result.values.QID9_1
  const years_laparoscopic_surgery = result.values.QID9_2
  const years_endoscopic_surgery = result.values.QID9_4
  const years_orifice_surgery = result.values.QID_7
  const years_robotic_surgery = result.values.QID9_3
  const most_common_procedures_a = result.values.QID10_4
  const most_common_procedures_b = result.values.QID10_5
  const most_common_procedures_c = result.values.QID10_6
  // "QID10_4": "Endoscopic",
  // "QID10_5": "Glaroscopic",
  // "QID10_6": "Scopic",
  return {
    createdAt,
    updatedAt,
    pain_open_surgery,
    pain_larascopic_surgery,
    pain_open_surgery,
    pain_endoscopic_surgery,
    pain_orifice_surgery,
    pain_robotic_surgery,
    pain_past_six_months,
    pain_interfered_relations,
    pain_interfered_sleep,
    pain_interfered_future_surgery,
    height,
    weight,
    age,
    gender,
    handness,
    glove_size,
    surgical_procedures_day,
    days_per_week,
    exercise,
    primary_speciality,
    years_open_surgery,
    years_laparoscopic_surgery,
    years_endoscopic_surgery,
    years_orifice_surgery,
    years_robotic_surgery,
    most_common_procedures_a,
    most_common_procedures_b,
    most_common_procedures_c,
    userid

  }
}


module.exports = {
  sendEmail,
  triggerBaselineSurveyJSONWorkflow,
  getSurveyResponses,
  exportBaselineSurveys,
  getBaselineSurveys,
  fillBaselineSurveyResponse
};
