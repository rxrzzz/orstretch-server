const db = require("../models/model");
const Tag = db.tags;
const excelJs = require("exceljs");
const moment = require("moment");
const Op = require("sequelize").Op;

const createTag = async (req, res) => {
  try {
    let info = {
      name: req.body.name,
      baseline: req.body.baseline,
    };
    if (!info.name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified.", isSuccess: false });

    const tagExists = await Tag.findOne({ where: { name: req.body.name } });
    if (tagExists) {
      return res.status(400).json({
        message: `Tag with name ${req.body.name} already exists. Please create a new tag.`,
        isSuccess: false,
      });
    } else {
      const tag = await Tag.create(info);
      return res.status(200).json({ tag, isSuccess: true });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const listTags = async (req, res) => {
  try {
    const page_no = Number(req.query.page_no);
    const name = req.query.name;
    const id = req.query.id;
    const createdAt = req.query.createdAt;
    const updatedAt = req.query.updatedAt;
    const sortBy = req.query.sortBy ?? "createdAt";
    const order = req.query.order ?? "DESC";
    let no_of_tags = 10;
    if (req.query.no_of_tags) {
      no_of_tags = Number(req.query.no_of_tags) ?? 10;
    }

    const offset = (page_no - 1) * no_of_tags;
    let tags;
    let maxPageNo;
    let totalNoOfTagsThatMatchSpecifiedParams;
    const totalNoOfTags = await Tag.count();

    if (isNaN(page_no) || page_no <= 0) {
      return res.status(400).json({
        message:
          "Invalid page number parameter. It should be a number and shouldn't be less than one.",
        isSuccess: false,
      });
    }

    if (name || id || createdAt || updatedAt || sortBy || order) {
      let totalTagsThatMatchSpecifiedParams = await Tag.findAll({
        where: {
          [Op.and]: [
            name !== undefined &&
              name !== "" && {
                name: {
                  [Op.substring]: name,
                },
              },
            id !== undefined &&
              id !== "" && {
                id: {
                  [Op.eq]: id,
                },
              },
            createdAt !== undefined &&
              createdAt !== "" && {
                createdAt: {
                  [Op.substring]: createdAt,
                },
              },
            updatedAt !== undefined &&
              updatedAt !== "" && {
                updatedAt: {
                  [Op.substring]: updatedAt,
                },
              },
          ],
        },
      });
      let paginatedTags = await Tag.findAll({
        where: {
          [Op.and]: [
            name !== undefined &&
              name !== "" && {
                name: {
                  [Op.substring]: name,
                },
              },
            id !== undefined &&
              id !== "" && {
                id: {
                  [Op.eq]: id,
                },
              },
            createdAt !== undefined &&
              createdAt !== "" && {
                createdAt: {
                  [Op.substring]: createdAt,
                },
              },
            updatedAt !== undefined &&
              updatedAt !== "" && {
                updatedAt: {
                  [Op.substring]: updatedAt,
                },
              },
          ],
        },
        offset,
        limit: no_of_tags,
        order: [[sortBy, order]],
      });
      tags = paginatedTags;
      totalNoOfTagsThatMatchSpecifiedParams =
        totalTagsThatMatchSpecifiedParams.length;
      maxPageNo = Math.ceil(totalNoOfTagsThatMatchSpecifiedParams / no_of_tags);
    } else {
      tags = await Tag.findAll({
        offset,
        limit: no_of_tags,
        order: [[sortBy, order]],
      });
      maxPageNo = Math.ceil(totalNoOfTags / no_of_tags);
    }
    return res.status(200).json({
      tags,
      totalNoOfTags,
      totalNoOfTagsThatMatchSpecifiedParams,
      maxPageNo,
      isSuccess: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const deleteTag = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified. " });

    const tag = await Tag.findOne({ where: { name } });
    if (tag) {
      await Tag.destroy({ where: { name } }).then(() => {
        return res.status(200).json({
          message: `Tag with name '${name}' has been deleted.`,
          isSuccess: true,
        });
      });
    } else {
      return res.status(400).json({
        message: `Tag with name '${name}' does not exist.`,
        isSuccess: false,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const findTags = async (req, res) => {
  try {
    const nameQueryParam = req.query.name;
    if (!nameQueryParam)
      return res
        .status(400)
        .json({ message: "Invalid query parameters.", isSuccess: false });
    const tags = await Tag.findAll({
      where: {
        name: {
          [Op.substring]: nameQueryParam,
        },
      },
    });
    return res.status(200).json({ tags, isSuccess: true });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const updateTag = async (req, res) => {
  try {
    if (
      req.body.baseline_survey &&
      (req.body.baseline_survey > 1 || req.body.baseline_survey < 0)
    )
      return res.status(400).json({
        message: "Baseline survey value should either be 0 or 1",
        isSuccess: false,
      });
    const tag = await Tag.findOne({ where: { name: req.query.name } });
    if (tag) {
      await Tag.update(req.body, { where: { name: req.query.name } });
      return res
        .status(200)
        .json({ message: `Tag has been updated. `, isSuccess: true });
    } else {
      return res.status(400).json({
        message: `Tag with name ${req.query.name} does not exist.`,
        isSuccess: false,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const viewTagDetails = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified. ", isSuccess: false });
    const tag = await Tag.findOne({ where: { name } });
    if (tag) {
      return res.status(200).json({ tag, isSuccess: true });
    } else {
      return res
        .status(400)
        .json({ message: "Tag not found.", isSuccess: false });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const exportTags = async (req, res) => {
  try {
    const idArray = req.query.ids;
    let ids;
    if (idArray) ids = JSON.parse(idArray);
    console.log({ ids });
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("tags");
    let tags;
    sheet.columns = [
      { header: "ID", key: "id" },
      { header: "Name", key: "name" },
      { header: "Date Created", key: "createdAt" },
      { header: "Last Updated", key: "updatedAt" },
      { header: "Baseline Survey", key: "baseline" },
    ];
    if (ids && ids.length > 0) {
      tags = await Tag.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });
    } else {
      tags = await Tag.findAll();
    }
    console.log(tags);
    await tags.map((value) => {
      sheet.addRow({
        id: value.id,
        name: value.name,
        createdAt: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
        updatedAt: moment(value.createdAt).format("YYYY-MM-DD HH:MM:SS"),
        baseline: value.baseline ? "Yes" : "No",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + "Or-Stretch-Tags.xlsx"
    );
    workbook.xlsx.write(res);
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};
module.exports = {
  createTag,
  listTags,
  deleteTag,
  updateTag,
  findTags,
  viewTagDetails,
  exportTags,
};
