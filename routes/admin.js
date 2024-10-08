const express = require("express");
const Complaint = require("../models/complaint");
const { jwtTokenAuthAdmin } = require("../middleware/jwtTokenAuthAdmin");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("../app/db");
const comment = require("../models/comment");
const type = require("../models/type");
const user = require("../models/user");
const { parse } = require("dotenv");
const { toLower } = require("lodash");
const router = express.Router();

// ------------------------------GET---------------------------------

router.get("/applicationrequest", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let users = await user.find();
    res.render('admin/applicationRequest', {users:users})
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/type", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let database = await type.find();
    res.render("admin/addCategory", { database: database });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/complaint", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let database = await type.find();
    let status = req.query.status;
    let area = req.query.area;
    if (status == "" && area == "") {
      var all = await Complaint.find().sort({ _id: -1 })
    } else if (status && area) {
      var all = await Complaint.find({
        status: status,
        area: area,
      }).sort({
        _id: -1,
      });
    } else if (status && area == "") {
      var all = await Complaint.find({
        status: status,
      }).sort({
        _id: -1,
      });
    } else if (area && status == "") {
      var all = await Complaint.find({area: area }).sort({
        _id: -1,
      });
    } else {
      var all = await Complaint.find().sort({
        _id: -1,
      });
    }
    res.render("admin/complaint", { payload: all, database: database });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let database = await type.find();
    let allComment = await comment
      .find({ complaintId: req.params.id })
      .populate("userid");
    let all = await Complaint.findById(req.params.id);
    res.render("admin/detail", {
      payload: all,
      isAdmin: req.cookies.admin,
      userName: "Admin",
      userid: req.cookies.adminID,
      allComment: allComment,
      database: database,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/dashboard", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.find().sort({ _id: -1 }).limit(10);
    let everyData = await Complaint.find().count();
    let successData = await Complaint.find({ status: "Success" }).count();
    let queueData = await Complaint.find({ status: "Queue" }).count();
    let progressData = await Complaint.find({ status: "Progress" }).count();
    res.render("admin/dashboard", {
      payload: all,
      everyData,
      successData,
      queueData,
      progressData,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/profile/:id", async (req, res) => {
  try {
    let userIdObj = new mongoose.Types.ObjectId();
    userIdObj = req.params.id;

    let data = await user.findById(req.params.id);
    let allComplaints = await Complaint.find({ userId: userIdObj });
    res.render("admin/profile", {
      userdata: data,
      allComplaints: allComplaints,
      userName: req.cookies.user,
      userid: req.cookies.userID,
      realuserid: req.params.id,
      isAdmin: req.cookies.admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
router.get("/delete/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    await Complaint.findOneAndRemove({ _id: req.params.id });
    res.redirect("/admin/complaint");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/imageDelete", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let id = req.query.id;
    let imageDelete = req.query.image;
    console.log(imageDelete);
    console.log(id);
    let data = await Complaint.updateOne(
      { _id: id },
      { $pull: { images: { $in: [imageDelete] } } }
    );
    res.redirect(`/admin/details/${id}`);
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("admin");
  res.clearCookie("adminID");
  res.redirect("/");
});

// -------------------------POST---------------------------------

router.post("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      statusbar: req.body.progressbar,
      $push: { statusmessege: req.body.progressmessege },
      status: req.body.status,
      area: req.body.area,
    });
    all.save();
    console.log(all);
    res.redirect("/admin/dashboard");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/applicationrequest/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let oneuser = await user.findByIdAndUpdate(req.params.id,{
      accountstatus: req.body.submited
    })
    oneuser.save()
    res.redirect("/admin/applicationrequest");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/type", jwtTokenAuthAdmin, async (req, res) => {
  try {
    console.log(req.body.type)
    let area = req.body.type
    area = toLower(area)
    console.log(area);
    let database = await type.find();
    console.log(database);
    let addType = new type({
      type: area,
    });
    addType.save();
    res.redirect("/admin/type");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/:complaintid/addcomment", async (req, res) => {
  let complaintId = req.params.complaintid;
  let comm = new comment({
    complaintId: complaintId,
    message: req.body.comment,
    userid: req.cookies.userID,
  });
  await comm.save();
  res.redirect(`/admin/details/${complaintId}`);
});

router.post(
  "/:complaintid/:commentid/:userid/replycomment",
  async (req, res) => {
    let { complaintid, commentid, userid } = req.params;
    let comm = await comment.findByIdAndUpdate(commentid, {
      $push: {
        reply: {
          message: req.body.reply,
          userid: userid,
          username: "Admin",
        },
      },
    });
    await comm.save();
    res.redirect(`/admin/details/${complaintid}`);
  }
);

module.exports = router;
