const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const coursesController = require("../controllers/courses.controller");
const { validationSchema } = require("../middlewares/validationSchema");
const verifyToken = require("../middlewares/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middlewares/allowedTo");
const multer = require("multer");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("FILE", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `course-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];

  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("the file must be an image", 400), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter });

router
  .route("/")
  .get(coursesController.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.MANGER),
    validationSchema(),
    upload.single("image"),
    coursesController.addCourse
  );

router
  .route("/:courseId")
  .get(coursesController.getCourse)
  .patch(coursesController.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANGER),
    coursesController.deleteCourse
  );

module.exports = router;
