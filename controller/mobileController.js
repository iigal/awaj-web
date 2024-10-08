const { default: mongoose } = require("../app/db");
const Complaints = require("../models/complaint");
const user = require("../models/user");
const comment = require("../models/comment");
const type = require("../models/type");
const Otp = require("../models/otpModel");
const otpGenerator = require("otp-generator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cloudinary = require("cloudinary").v2;

const JWT_SECRET = "hgfhd6ej4jhF3";
const nodemailer = require("nodemailer");
const _ = require("lodash");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_MOBILE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_MOBILE_API_KEY,
  api_secret: process.env.CLOUDINARY_MOBILE_API_SECRET,
});

exports.allPublicComplaints = async (req, res) => {
  try {
    const result = await Complaints.find({
      category: "public",
    })
      .sort({ _id: -1 })
      .populate("userId");
    console.log({ result });
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};
exports.getOneComplaints = async (req, res) => {
  try {
    const result = await Complaints.find({
      _id: req.params.id,
    });
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.saveComplaint = async (req, res) => {
  console.log("Here");
  console.log(req.body);
  if (!req.body) {
    res.status(400).send({ status: 400, message: "Any field cannot be empty" });
    return;
  }
  let userIdd = new mongoose.Types.ObjectId();
  userIdd = req.body.userId;

  const complain = new Complaints({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    images: req.body.images,
    userId: userIdd,
    username: req.body.username,
    area: req.body.area,
  });

  complain
    .save()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message || "Something went wrong",
      });
    });
};

exports.signup = (req, res, next) => {
  console.log("Signup req", req.body);
  user.findOne({ email: req.body.email }).then(async (_user) => {
    if (_user) {
      res.status(201).send("User already exists.");
    } else {
      const OTP = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      console.log("Generated OTP", OTP);
      const otp = new Otp({ number: req.body.phonenumber, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      await otp.save();
      res.status(200).send("OTP sent")

      const url = process.env.SMS_API_URL;


      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auth_token: process.env.SMS_API_TOKEN,
            to: req.body.phonenumber,
            text: `${OTP} is your OTP Code for Awaj. Thank you.`
          })
        });

        const responseData = await response.json();

        console.log(responseData);

      } catch (error) {
        console.error('Error sending SMS:', error);
      }


      // bcrypt.hash(req.body.password, 10, function (err, hash) {
      //   let data = new user({
      //     fullname: req.body.fullname,
      //     address: req.body.address,
      //     phonenumber: req.body.phonenumber,
      //     email: req.body.email,
      //     password: hash,
      //     voterid: req.body.voterid,
      //     accountstatus: req.body.accountstatus,
      //   });
      //   data
      //     .save()
      //     .then((data) => {
      //       res.status(200).send(data);
      //     })
      //     .catch((error) => {
      //       res.status(500).send({
      //         message: error.message || "Something went wrong",
      //       });
      //     });
      // });
    }
  });
};

exports.verifyOtp = async (req, res) => {
  const otpHolder = await Otp.find({
    number: req.body.phonenumber,
  });

  if (otpHolder.length === 0) return res.status(400).send({
    status: 400,
    message:
      "OTP Expired",
  });
  const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  console.log("Valid user test", validUser)

  if (rightOtpFind.number === req.body.phonenumber && validUser) {
    console.log("Reached in")

    bcrypt.hash(req.body.password, 10, function (err, hash) {
      let data = new user({
        fullname: req.body.fullname,
        address: req.body.address,
        phonenumber: req.body.phonenumber,
        email: req.body.email,
        password: hash,
        voterid: req.body.voterid,
        accountstatus: req.body.accountstatus,
      });
      data
        .save()
        .then((data) => {
          res.send({ status: 200, data: data });
        })
        .catch((error) => {
          res.status(500).send({
            message: error.message || "Something went wrong",
          });
        });
    });

    const OTPDelete = await Otp.deleteMany({
      number: rightOtpFind.number,
    });

  } else {
    return res.send({
      status: 401,
      message:
        "Invalid OTP",
    });
  }
};

exports.login = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;

  user.findOne({ email: email }).then((_user) => {
    if (_user) {
      bcrypt.compare(password, _user.password, function (err, result) {
        if (err) {
          res.send(err);
        }
        if (result) {
          if (_user.accountstatus === "pending") {
            return res.send({
              status: 203,
              message: "Account not approved yet",
            });
          }
          if (_user.accountstatus === "rejected") {
            return res.send({
              status: 204,
              message:
                "Your account has been rejected. Please signup again with correct details.",
            });
          }
          let token = jwt.sign({ email: _user.email }, JWT_SECRET, {
            expiresIn: 6000,
          });
          res.send({
            status: 200,
            message: "Success",
            email: email,
            token: token,
            userId: _user._id,
            username: _user.fullname,
            user: _user,
          });
        } else {
          res.send({ status: 201, message: "Credentials is incorrect" });
        }
      });
    } else {
      res.send({ status: 202, message: "No user found" });
    }
  });
};

exports.findTotal = async (req, res) => {
  try {
    const countQueue = await Complaints.countDocuments({ status: "Queue" });
    const countProgress = await Complaints.countDocuments({
      status: "Progress",
    });
    const countSuccess = await Complaints.countDocuments({ status: "Success" });
    const total = await Complaints.estimatedDocumentCount();

    res.send({
      status: 200,
      total: total,
      Queue: countQueue,
      Progress: countProgress,
      Success: countSuccess,
    });
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // res.send(email)
    user.findOne({ email: email }).then((_user) => {
      if (_user) {
        const secret = JWT_SECRET + _user.password;
        const payload = {
          email: _user.email,
          id: _user._id,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "60m" });
        const link = `http://awaj.pradip-paudel.com.np/reset-password/${_user.id}/${token}`;

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
          text: `http://awaj.pradip-paudel.com.np/reset-password/${_user.id}/${token}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email has been sent", info.response);
          }
        });

        console.log(link);
        res.send({
          status: 200,
          message: "Password reset link has been sent to your email.",
        });
      } else {
        res.send({ status: 202, message: "No user found" });
      }
    });
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.getOwnComplaints = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Complaints.find({
      userId: id,
    }).sort({ _id: -1 });

    // console.log({ result });
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.getProfile = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await user.find({
      _id: id,
    });

    // console.log({ result });
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.saveComments = async (req, res) => {
  console.log("Here comments");
  console.log(req.body);
  if (!req.body) {
    res.status(400).send({ status: 400, message: "Any field cannot be empty" });
    return;
  }

  let userIdd = new mongoose.Types.ObjectId();
  userIdd = req.body.userId;

  let complaintIdd = new mongoose.Types.ObjectId();
  complaintIdd = req.body.complaintId;

  // let parentIdd = new mongoose.Types.ObjectId();
  // parentIdd = req.body.parentId

  const data = new comment({
    message: req.body.message,
    userid: userIdd,
    complaintId: complaintIdd,
    // parentId : parentIdd || null
  });

  data
    .save()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message || "Something went wrong",
      });
    });
};

exports.saveReplies = async (req, res) => {
  console.log("Here replies");
  console.log(req.body);
  if (!req.body) {
    res.status(400).send({ status: 400, message: "Any field cannot be empty" });
    return;
  }

  let commentId = req.params.id;

  // let userIdd = new mongoose.Types.ObjectId();
  // userIdd = req.body.userId

  // let complaintIdd = new mongoose.Types.ObjectId();
  // complaintIdd = req.body.complaintId

  let comm = await comment.findByIdAndUpdate(commentId, {
    $push: {
      reply: {
        message: req.body.message,
        userid: req.body.userId,
        username: req.body.username,
      },
    },
  });

  comm
    .save()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send({
        message: error.message || "Something went wrong",
      });
    });
};

exports.getComments = async (req, res) => {
  try {
    const result = await comment
      .find({
        complaintId: req.params.id,
      })
      .sort({ _id: -1 })
      .populate("userid");
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.getComplaints = async (req, res) => {
  const result = await Complaints.findOne({ _id: req.params.id });
  const comments_in_order = await comment
    .find({ complaintId: req.params.id })
    .sort({ _id: -1 })
    .populate("userId")
    .lean();

  result.comments_in_order = appendChildrenToParent(comments_in_order);

  console.log("Commmm", result);
  res.send(result);
};

function appendChildrenToParent(objects) {
  const byId = _.keyBy(objects, "_id");

  _.forEach(objects, (obj) => {
    const parent = byId[obj.parentId];
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(obj);
    }
  });

  return _.filter(objects, (obj) => !obj.parentId);
}

exports.getAreas = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await type.find();

    // console.log({ result });
    res.status(200).send(result);
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.reportComment = async (req, res) => {
  const { user, complaint, comment } = req.params;

  try {
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
      to: "prajitabalami50@gmail.com",
      subject: "Report Comment",
      text: `The user with id ${user} has reported on comment id ${comment} of complaint id ${complaint}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent", info.response);
      }
    });

    res.send("Report sent");
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
};

exports.delete_account = (req, res) => {
  const id = req.params.id;

  user
    .findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot delete with ${id}` });
      } else {
        Complaints.deleteMany({ userId: id })
          .then((data) => {
            if (!data) {
              res.status(404).send({ message: `Cannot delete with ${id}` });
            } else {
              res.send({
                message: "Complaint and user was deleted succesfully",
              });
            }
          })
          .catch((err) => {
            res.status(500)({
              message: "Could not delete id" + id,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500)({
        message: "Could not delete id" + id,
      });
    });
};
