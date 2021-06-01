const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const mySecret = process.env["MONGO_URI"];

mongoose.connect(mySecret, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const UserSchema = mongoose.Schema({
  username: {
    type: String,
  },
  count: Number,
  log: [
    {
      description: {
        type: String,
      },
      duration: {
        type: Number,
      },
      date: {
        type: String,
      },
    },
  ],
});

const User = mongoose.model("User", UserSchema);

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  const foundUser = await User.findOne({ username: username });
  if (foundUser) {
    return res.send("Username is already taken");
  }
  const user = new User({ username });
  await user.save();
  res.json({
    username: username,
    _id: user._id,
  });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({}, "_id username");
  res.send(users);
});

app.get("/api/users/:id/logs", async (req, res) => {
  const { id } = req.params;
  const { from, to, limit } = req.query;
  const user = await User.findById(id);
  if (from != undefined && to === undefined && limit === undefined) {
    const tempLog = [];
    let tempCount = 0;
    let fromDate = new Date(from);
    fromDate = fromDate.toDateString();
    for (let i = 0; i < user.log.length; i++) {
      const date = new Date(user.log[i].date).getTime();
      const fromTmp = new Date(fromDate).getTime();
      if (date >= fromTmp) {
        tempLog.push(user.log[i]);
        tempCount += 1;
      }
    }
    res.json({
      _id: id,
      username: user.username,
      from: fromDate,
      count: tempCount,
      log: tempLog,
    });
  } else if (from !== undefined && to !== undefined && limit === undefined) {
    const tempLog = [];
    let tempCount = 0;
    let fromDate = new Date(from);
    fromDate = fromDate.toDateString();
    let toDate = new Date(to);
    toDate = toDate.toDateString();
    for (let i = 0; i < user.log.length; i++) {
      const date = new Date(user.log[i].date).getTime();
      const fromTmp = new Date(fromDate).getTime();
      const toTmp = new Date(toDate).getTime();
      if (date >= fromTmp && date < toTmp) {
        tempLog.push(user.log[i]);
        tempCount += 1;
      }
    }
    res.json({
      _id: id,
      username: user.username,
      from: fromDate,
      to: toDate,
      count: tempCount,
      log: tempLog,
    });
  } else if (from !== undefined && to !== undefined && limit !== undefined) {
    const tempLog = [];
    let tempCount = 0;
    let fromDate = new Date(from);
    fromDate = fromDate.toDateString();
    let toDate = new Date(to);
    toDate = toDate.toDateString();
    for (let i = 0; i < user.log.length; i++) {
      const date = new Date(user.log[i].date).getTime();
      const fromTmp = new Date(fromDate).getTime();
      const toTmp = new Date(toDate).getTime();
      if (date >= fromTmp && date < toTmp) {
        tempLog.push(user.log[i]);
        tempCount += 1;
      }
    }
    res.json({
      _id: id,
      username: user.username,
      from: fromDate,
      to: toDate,
      count: limit,
      log: tempLog.slice(0, limit),
    });
  } else if (from === undefined && to === undefined && limit !== undefined) {
    res.json({
      _id: id,
      username: user.username,
      count: limit,
      log: user.log.slice(0, limit),
    });
  } else if (from === undefined && to !== undefined && limit === undefined) {
    const tempLog = [];
    let tempCount = 0;
    let toDate = new Date(to);
    toDate = toDate.toDateString();
    for (let i = 0; i < user.log.length; i++) {
      const date = new Date(user.log[i].date).getTime();
      const toTmp = new Date(toDate).getTime();
      if (date < toTmp) {
        tempLog.push(user.log[i]);
        tempCount += 1;
      }
    }
    res.json({
      _id: id,
      username: user.username,
      to: toDate,
      count: tempCount,
      log: tempLog,
    });
  } else if (from === undefined && to !== undefined && limit !== undefined) {
    const tempLog = [];
    let tempCount = 0;
    let toDate = new Date(to);
    toDate = toDate.toDateString();
    for (let i = 0; i < user.log.length; i++) {
      const date = new Date(user.log[i].date).getTime();
      const toTmp = new Date(toDate).getTime();
      if (date < toTmp) {
        tempLog.push(user.log[i]);
        tempCount += 1;
      }
    }
    res.json({
      _id: id,
      username: user.username,
      to: toDate,
      count: limit,
      log: tempLog.slice(0, limit),
    });
  } else if (from === undefined && to === undefined && limit === undefined) {
    res.json({
      _id: id,
      username: user.username,
      count: user.log.length,
      log: user.log,
    });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration } = req.body;
  intDuration = parseInt(duration);
  let { date } = req.body;
  if (!(await User.findById(_id))) {
    return res.send("Unknown userId");
  }
  if (!date) {
    date = Date.now();
  }
  let tmp = new Date(date);
  tmp = tmp.toDateString();
  if (!description) {
    return res.send("Path `description` is required");
  }
  if (!duration) {
    return res.send("Path `duration` is required");
  }
  const foundUser = await User.findById(_id);
  foundUser.log.unshift({ description, duration, date: tmp });
  foundUser.count = foundUser.log.length;
  const user = await User.findByIdAndUpdate(_id, foundUser);
  res.json({
    _id: _id,
    username: user.username,
    date: tmp,
    duration: intDuration,
    description: description,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
