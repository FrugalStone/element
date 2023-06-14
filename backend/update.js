const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
var nodemailer = require('nodemailer');
const db = require('./db');
const MongoDBSession = require('connect-mongodb-session')(session);


dotenv.config({ path: './.env' });

const app = express();
const StudentModel = require('./models/student');
const PswdToken = require('./models/pswdToken');
const AdminModel = require('./models/admin');
const openRegistrationModel = require('./models/openRegistrations');

const store = new MongoDBSession({
  uri: process.env.CONNECTION_STRING,
  collection: 'session'
});

const PORT = 5002;

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'joshuah.bartell57@ethereal.email',
      pass: 'TwMnY3yfspTJw3CfU4'
  }
});

const adminRouter = require('./routes/admin');
const studentRouter = require('./routes/student');

app.use("/admin", adminRouter);
app.use("/student", studentRouter);

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static('static/styles'));
app.use('/scripts', express.static('static/scripts'));
app.use('/images', express.static('static/images'));

app.get('/', (req, res) => {
  res.send("Yokoso");
});

app.get('/testing', (req, res) => {
  res.render('selectElective.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs', { isWarned: false, warnignMessage: "none" });
});

app.post('/login', async (req, res) => {
  console.log(req.body);
  const { email, password, selectedLogo } = req.body;

  const user = await StudentModel.findOne({ email });

  if (!user) {
    console.log("User not found!!");
    return res.render('login.ejs', { isWarned: true, warnignMessage: "User account not found" });
  }

  console.log(user);
  console.log(user.password);
  console.log(user.username);
  console.log(user.email);
  console.log(user.sem);

  if (user.password === password) {
    req.session.isAuth = true;
    req.session.student_name = user.username;
    req.session.student_email = user.email;
    req.session.student_sem = user.sem;
    req.session.student_dept = user.dept;
    res.redirect('/student/dashboard');
  } else {
    console.log("Passwords don't match");
    return res.render('login.ejs', { isWarned: true, warnignMessage: "Wrong password" });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.render('login.ejs', { isWarned: false, warnignMessage: "none" });
  });
});

app.get('/forgotPassword', (req, res) => {
  res.sendFile(__dirname + '/static/forgotPassword.html');
});

app.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  
  function generateString(length) {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const str = generateString(5);

  try {
    const result = await PswdToken.create({email: email, token: str});
    console.log(`${result._id} document inserted`);
  } catch (e) {
    console.error(e);
  }

  const link = 'http://localhost:5002/resetPassword?email=' + email + '&token=' + str;
  
  var mailOptions = {
    from: 'mailvizzard@gmail.com',
    to: email,
    subject: 'Element password reset',
    text: 'Reset your password here: ' + link
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  const { spawn } = require('child_process');
  
  const pythonScript = './send_password_reset.py';
  
  const args = [email, "Element password reset", link];
  
  const pythonProcess = spawn('python', [pythonScript, ...args]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error executing Python script: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python script executed with code ${code}`);
  });

  res.render('login.ejs', { isWarned: true, warnignMessage: "Try loging in again after resetting password" });

});

app.get('/resetPassword', async (req, res) => {
  // const { email, token } = req.query;
  const email = req.query.email;
  const token = req.query.token;

  const result = await PswdToken.findOne({ token: token });

  if (result) {
    res.sendFile(__dirname + '/static/resetPassword.html');
  }
  else {
    res.send("Something wrong occurred");
  }
  // res.send("wtf is this?");
});

app.post('/resetPassword', async (req, res) => {
  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  try {
    const result = await StudentModel.updateOne({ email: email }, { password: password });

    if (result.modifiedCount === 1) {

      const deleteToken = await PswdToken.deleteMany({ email: email });

      if(deleteToken){
        console.log("deleted tokens");
      }

      res.render('login.ejs', { isWarned: true, warnignMessage: "Login with new password" });
    } else {
      res.send("Password updation failed");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/destroySession', (req, res) => {
  req.session.destroy((err) => {
    console.log("Destroying the session");
    if (err) throw err;
  });
});

app.get('/dashboard', (req, res) => {
  if (req.session.isAuth) {
    console.log("Serving dashboard name = " + req.session.student_name);
    res.render('dashboard.ejs', { name: req.session.student_name });
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
}); 