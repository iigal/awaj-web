const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Complaint = require("../models/complaint");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { jwtTokenAuth } = require("../middleware/jwtTokenAuth");
const fileUpload = require("express-fileupload");
const { default: mongoose, get } = require("mongoose");
const cloudinary = require("cloudinary").v2;
const JWT_SECRET = "hgfhd6ej4jhF3";
const Otp = require("../models/otpModel");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const comment = require("../models/comment");
const type = require("../models/type");

router.use(
  fileUpload({
    useTempFiles: true,
  })
);

cloudinary.config({
  cloud_name: "dibqxmlpc",
  api_key: "893523661126839",
  api_secret: "oMkSwedWwZpvq7OOkPQdiKh6tpg",
  secure: true,
});

// -------------------------------------------GET---------------------------------------------

//all complaint get

router.get("/complaint", jwtTokenAuth, async (req, res) => {
  let complaintType = await type.find();
  let status = req.query.status;
  let area = req.query.area;
  console.log(status + area);
  if (status == "" && area == "") {
    var all = await Complaint.find({ userId: req.cookies.userID }).sort({
      _id: -1,
    });
  } else if (status && area) {
    var all = await Complaint.find({
      userId: req.cookies.userID,
      status: status,
      area: area,
    }).sort({
      _id: -1,
    });
  } else if (status && area == "") {
    var all = await Complaint.find({  userId: req.cookies.userID , status: status }).sort(
      {
        _id: -1,
      }
    );
  } else if (area && status == "") {
    var all = await Complaint.find({ userId: req.cookies.userID, area: area }).sort({
      _id: -1,
    });
  } else {
    var all = await Complaint.find({ userId: req.cookies.userID }).sort({
      _id: -1,
    });
  }

  res.render("citizen/complaint", {
    payload: all,
    userName: req.cookies.user,
    userid: req.cookies.userID,
    area: complaintType,
  });
});

// Complaint detail page

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  try {
    let allComment = await comment
      .find({ complaintId: req.params.id })
      .populate("userid");
    console.log(allComment);
    let all = await Complaint.findById(req.params.id);
    console.log(allComment);
    res.render("citizen/detail", {
      payload: all,
      isAdmin: req.cookies.admin,
      userName: req.cookies.user || "Admin",
      userid: req.cookies.userID,
      allComment: allComment,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
// First page get
router.get("/", async (req, res) => {
  try {
    let allTypes = await type.find();
    let all = await Complaint.find({ userId: req.cookies.userID })
      .sort({ _id: -1 })
      .limit(9);
    let everyData = await Complaint.find().count();
    let successData = await Complaint.find({ status: "Success" }).count();
    let queueData = await Complaint.find({ status: "Queue" }).count();
    let progressData = await Complaint.find({ status: "Progress" }).count();

    res.render("citizen/index", {
      payload: all,
      everyData: everyData,
      userName: req.cookies.user,
      success: successData,
      queue: queueData,
      progress: progressData,
      userid: req.cookies.userID,
      area: allTypes,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
// Profile get
router.get("/profile/:id", async (req, res) => {
  try {
    let userIdObj = new mongoose.Types.ObjectId();
    userIdObj = req.params.id;

    let data = await user.findById(req.params.id);
    let allComplaints = await Complaint.find({ userId: userIdObj });
    res.render("citizen/profile", {
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

// Login Get

router.get("/login", async (_, res) => {
  res.render("citizen/login", { messege: "" });
});

// Signup Get
router.get("/signup", async (_, res) => {
  res.render("citizen/signup", { message: "" });
});

router.get("/verification", async (_, res) => {
  res.render("citizen/verify", { messege: "" });
});

// Logout Get
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.clearCookie("userID");
  res.redirect("/");
});
// Forgot password get
router.get("/forget-password", async (req, res) => {
  res.render("forget-password");
});

// Password Reset get

router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  //check if user exist in db
  user.findOne({ _id: id }).then((_user) => {
    if (_user) {
      const secret = JWT_SECRET + _user.password;
      try {
        const payload = jwt.verify(token, secret);
        res.render("reset-password", { email: _user.email });
      } catch (error) {
        console.log(error.message);
        res.send(error.message);
      }
    } else {
      res.send({ status: 202, message: "No user found" });
    }
  });
});

// -------------------------------------------POST---------------------------------------------

//Front page post

router.post("/", jwtTokenAuth, async (req, res) => {
  try {
    const { title, description, area } = req.body;
    const file =
      req.files && req.files.photo
        ? Array.isArray(req.files.photo)
          ? req.files.photo
          : [req.files.photo]
        : [];

    // Validate input
    if (!title) {
      return res.status(400).send("Title is required");
    }

    if (!description) {
      return res.status(400).send("Description is required");
    }

    if (!file) {
      return res.status(400).send("Photo is required");
    }

    console.log(file);
    let imageResult = [];
    for (const i of file) {
      let x = await cloudinary.uploader.upload(i.tempFilePath, {
        secure: true,
      });
      imageResult.push(x.secure_url);
    }

    const complain = new Complaint({
      title,
      description,
      username: req.cookies.user,
      images: imageResult.length > 0 ? imageResult : [],
      userId: req.cookies.userID,
      area,
    });

    console.log(complain);
    await complain.save();
    res.redirect("/cms");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.post("/verification", async(req, res)=>{
  const otpHolder = await Otp.find({
    number: req.session.signupForm.number,
  });


  if (otpHolder.length === 0){
    res.render("citizen/signup",{message:"OTP Expired"})
    }else{
      const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  console.log("Valid user test",validUser)

  if (rightOtpFind.number === req.session.signupForm.number && validUser) {
    console.log("Reached in")
    console.log(req.session.signupForm.password)
    bcrypt.hash(req.session.signupForm.password, 10, function (err, hash) {
      let data = new user({
        fullname:req.session.signupForm.fullname,
        address:req.session.signupForm.address,
        phonenumber: req.session.signupForm.number,
        email:req.session.signupForm.email,
        password: hash,
        voterid:req.session.signupForm.voterid,
        accountstatus:"pending"
      });
      data.save();
    });
    res.redirect("/cms/login");
    
    const OTPDelete = await Otp.deleteMany({
      number: rightOtpFind.number,
    });
    
  } else {
    res.render("citizen/signup",{message:"Invalid OTP"});  
  }
    }
})

// Login Post
router.post("/login", async (req, res) => {
  try {
    let loginUser = await user.findOne({ email: req.body.email });
    if (loginUser != null) {
      let check = await bcrypt.compare(req.body.password, loginUser.password);
      if (check) {
        if (loginUser.email === "sachiwalayap@gmail.com") {
          let token = jwt.sign({ user: loginUser._id }, "admin", {
            expiresIn: 3600,
          }); // Env variable for key
          res.cookie("admin", token, {
            httpOnly: true,
          });
          res.cookie("adminID", loginUser._id, {
            httpOnly: true,
          });
          res.redirect("/admin/dashboard");
        } else {
          if(loginUser.accountstatus==="approved"){
            let token = jwt.sign({ user: loginUser._id }, "shhhhh", {
              expiresIn: 36000,
            }); // Env variable for key
            res.cookie("token", token, {
              httpOnly: true,
            });
            res.cookie("user", loginUser.fullname, {
              httpOnly: true,
            });
            res.cookie("userID", loginUser._id, {
              httpOnly: true,
            });
            res.redirect("/cms");
          }else{
            res.render("citizen/login", { messege:loginUser.accountstatus=="pending"?"Account is pending":"Account is rejected" });
          }
        }
      } else {
        res.render("citizen/login", { messege: "Invalid Password" });
      }
    } else {
      res.render("citizen/login", { messege: "Email not found" });
    }
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

// Signup Post

router.post("/signup", async (req, res) => {
  const { fullname, address, number, email, password, voterid } = req.body;

  // Validate input
  if (!fullname || !address || !number || !email || !password || !voterid) {
    return res.status(400).send("All fields are required");
  }

  if (!/^\d{9}/.test(number)) {
    return res.status(400).send("Phone number must start with 9");
  }

  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.render("citizen/signup", { message: "User already exists." });
    }else{
      const OTP = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log("Generated OTP", OTP);
      const otp = new Otp({ number: req.body.number, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      await otp.save();

      req.session.signupForm = req.body;
      try {
        const url = "https://sms.aakashsms.com/sms/v3/send/";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              auth_token: 'a72c98cefead6de98cac653c080bf919c631cf11090922c135418eac913a5db0',
              to: req.body.number,
              text: `${OTP} is your OTP Code for Awaj. Thank you.`
            })
        });

        const responseData = await response.json();

        console.log(responseData); 
        res.redirect('/cms/verification')

    } catch (error) {
        console.error('Error sending SMS:', error);
    }
  }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});


// Frogot password Post

router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;

    user.findOne({ email: email }).then((_user) => {
      if (_user) {
        const secret = JWT_SECRET + _user.password;
        const payload = {
          email: _user.email,
          id: _user._id,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "60m" });
        const link = `https://awaj.pradip-paudel.com.np/reset-password/${_user.id}/${token}`;
        console.log(
          `https://awaj.pradip-paudel.com.np/reset-password/${_user.id}/${token}`
        );
        var transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: "sachiwalayap@gmail.com",
            pass: "glngzwnflzjdnwdk",
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        var mailOptions = {
          from: "sachiwalayap@gmail.com",
          to: `${email}`,
          subject: "Reset Password",
          text: `https://awaj.pradip-paudel.com.np/reset-password/${_user.id}/${token}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email has been sent", info.response);
          }
        });

        console.log(link);
        res.send("Password reset link has been sent to your email.");
      } else {
        res.send({ status: 202, message: "No user found" });
      }
    });
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
});

// Password Reset Post
router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const password = req.body.password;

  const _user = await user.findOne({ _id: id });
  if (!_user) {
    res.send("No user found");
  }
  const secret = JWT_SECRET + _user.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPass = await bcrypt.hash(password, 10);
    await user.updateOne(
      { _id: id },
      {
        $set: {
          password: encryptedPass,
        },
      }
    );
    res.send("Updated");
  } catch (error) {
    res.send("Something went wrong");
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
  res.redirect(`/cms/details/${complaintId}`);
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
          username: req.cookies.user,
        },
      },
    });
    await comm.save();
    res.redirect(`/cms/details/${complaintid}`);
  }
);

module.exports = router;
