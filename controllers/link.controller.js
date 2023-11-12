const Link = require("../models/model").links;

const linksArray = [
  "privacy_policy",
  "faq",
  "in_depth_stretching",
  "seated",
  "standing",
];

const createLink = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(400)
        .json({ message: "Body not specified", isSuccess: false });

    if (Number(req.body.media_type) > 2 || Number(req.body.media_type) < 1)
      return res.status(400).json({
        message: "Media type should either be 1 or 2.",
        isSuccess: false,
      });
    const existingLink = await Link.findOne({
      where: { name: req.body.name },
    });
    if (existingLink) {
      return res.status(400).json({
        message: "Link with the following name already exists",
        isSuccess: false,
      });
    }
    const link = await Link.create({
      name: req.body.name,
      url: req.body.url,
      type: Number(req.body.media_type) === 1 ? "video" : "name",
    });
    return res.status(200).json({ link, isSuccess: true });
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const updateLink = async (req, res) => {
  try {
    const name = req.query.name;
    let anotherLinkExistsWithTheNameForUpdate;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified.", isSuccess: false });
    const link = await Link.findOne({ where: { name } });
    if (req.body.name) {
      anotherLinkExistsWithTheNameForUpdate = await Link.findOne({
        where: { name: req.body.name },
      });
      if (anotherLinkExistsWithTheNameForUpdate) {
        return res.status(400).json({
          message:
            "Link with the same name already exists. Update to a new name.",
          isSuccess: false,
        });
      }
    }
    if (link) {
      await Link.update(req.body, { where: { name } });
      const updatedLink = await Link.findOne({
        where: { name: req.body.name ?? req.query.name },
      });
      return res.status(200).json({ updatedLink, isSuccess: true });
    } else {
      return res.status(400).json({
        message: `Link with name ${name} does not exist.`,
        isSuccess: false,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const deleteLink = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified", isSuccess: false });
    const link = await Link.findOne({ where: { name } });
    if (link) {
      await Link.destroy({ where: { name } });
      return res.status(200).json({
        message: `Link with name ${name} has been deleted.`,
        isSuccess: true,
      });
    } else {
      return res.status(400).json({
        message: `Link with name ${name} does not exist.`,
        isSuccess: false,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const linkDetails = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name parameter not specified", isSuccess: false });
    const link = await Link.findOne({ where: { name } });
    if (link) {
      return res.status(200).json({
        link,
        isSuccess: true,
      });
    } else {
      return res.status(400).json({
        message: `Link with name ${name} does not exist.`,
        isSuccess: false,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err, isSuccess: false });
  }
};

const possibleLinks = async (req, res) => {
  return res.status(200).json({ linksArray, isSuccess: true });
};

module.exports = {
  createLink,
  updateLink,
  deleteLink,
  linkDetails,
  possibleLinks,
};
