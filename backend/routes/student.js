const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("../db");
const MongoDBSession = require("connect-mongodb-session")(session);

dotenv.config({ path: "../.env" });

let router = express.Router();

const StudentModel = require("../models/student");
const PswdToken = require("../models/pswdToken");
const AdminModel = require("../models/admin");
const announcementModel = require("../models/announcement");
const openRegistrationModel = require("../models/openRegistrations");
const courseModel = require("../models/courses");
const prioritySubmissionModel = require("../models/prioritySubmission");
const enrollmentModel = require("../models/enrollments");
const changeElectiveRequestModel = require("../models/changeElectiveRequest");

const store = new MongoDBSession({
    uri: process.env.CONNECTION_STRING,
    collection: "session",
});

router.use(
    session({
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use("/styles", express.static("static/styles"));
router.use("/scripts", express.static("static/scripts"));
router.use("/images", express.static("static/images"));

router.get("/", (req, res) => {
    res.send("Yokoso, Student ye");
});

router.get('/dashboard', async (req, res) => {
    if (req.session.isAuth) {
        console.log("Serving dashboard name = " + req.session.student_name);

        const announcements = await announcementModel.find();
        console.log(announcements[0].announcement);

        let regis = await openRegistrationModel.find();
        let modifiedObjects = [];
        regis.forEach((obj) => {
          let modifiedObj = {
            _id: obj._id,
            dept: obj.dept,
            sem: obj.sem,
            startDate: obj.startDate.toDateString().slice(4),
            endDate: obj.endDate.toDateString().slice(4),
          };
    
          modifiedObjects.push(modifiedObj);
        });

        res.render('students/dashboard.ejs', {
            announcements: announcements.reverse().slice(0, 10),
            regis: modifiedObjects
        });
    } else {
        res.redirect("/login");
    }
});

router.get("/selectElective", async (req, res) => {
    const currentDate = new Date();
    const studentDept = req.session.student_dept;
    const studentSem = req.session.student_sem;
    const registration = await openRegistrationModel.findOne({ dept: studentDept, sem: studentSem });
    const submission = await prioritySubmissionModel.findOne({ email: req.session.student_email, dept: studentDept, sem: studentSem });



    if( req.session.isAuth){

        if( submission ){
            console.log("Submission found");
            res.render("students/selectElective.ejs", { isRegisOpen: false, denyMsg: "You have already submitted your priorities", courses: {}, courseCompleted: [], numElectives: 0  });
            return;
        }

        let serve;
        if( registration ){
            const endDate = registration.endDate;
            if( currentDate <= endDate ){
                serve = true;
            }else{
                serve = false;
            }
        }
        else{
            serve = false;
        }
        console.log("Serving decision = "+serve);
    
        if( !serve ){
            console.log("Rendering without content");
            res.render("students/selectElective.ejs", { isRegisOpen: false, denyMsg: "No Registrations open yet", courses: [], courseCompleted: [], numElectives: 0 });
        }

        console.log("Department name = " + req.session.student_dept);

        const deptCourses = await courseModel.find({ dept: req.session.student_dept, sem: req.session.student_sem });
        console.log(req.session.student_coursesCompleted);

        res.render('students/selectElective.ejs', { isRegisOpen: true, courses: deptCourses, courseCompleted: req.session.student_coursesCompleted, numElectives: registration.numElectives });
    }
    else{
        res.redirect("/login");
    }
});

router.post("/submitPriorities", async (req, res) => {
    console.log(req.body);
    // unpack the request body into 2 lists: courses and priorites
    const body = req.body;

    let courses = body.map(function(item) {
        return item.courseCode;
    });
    
    let priorities = body.map(function(item) {
        return item.priority;
    });

    const studentEmail = req.session.student_email;
    const studentDept = req.session.student_dept;
    const studentSem = req.session.student_sem;

    // insert a document into the prioritySubmission collection
    const prioritySubmission = new prioritySubmissionModel({
        email: studentEmail,
        priorities: priorities,
        courses: courses,
        dept: studentDept,
        sem: studentSem
    });

    await prioritySubmission.save();

    console.log("Inserted into prioritySubmission collection");

    res.redirect("/student/selectElective");
});

router.get("/changeElective", async (req, res) => {
    console.log("Serving changeElective");
    
    const denyMsg = {
        'pending': "Request is pending",
        'accepted': "Request accepted",
        'rejected': "Request rejected"
    }

    const request = await changeElectiveRequestModel.findOne({ email: req.session.student_email });
    const enrollment = await enrollmentModel.find({ dept: req.session.student_dept, sem: req.session.student_sem });
    
    const coursesEnrolled = enrollment.filter(function(item) {
        return item.students.includes(req.session.student_email);
    });    
    const enrolledCourseCodes = coursesEnrolled.map(item => item.courseCode);

    const enrolledCourses = await courseModel.find({ courseCode: { $in: enrolledCourseCodes }, dept: req.session.student_dept, sem: req.session.student_sem  });
    
    if (request) {
        console.log("Request found");
        console.log(request.status);
        res.render("students/changeElective.ejs", {
            enrolledCourses: enrolledCourses,
            unenrolledCourses: [],
            courseCompleted: [],
            isOpen: false,
            denyMsg: denyMsg[request.status]
        });

    } else {

        const availableCourses = enrollment.filter(function(item) {
            return !item.students.includes(req.session.student_email);
        });
        
        const seatsLeft = availableCourses.map(function (item) {
            return { code: item.courseCode, seatsLeft: item.seats - item.students.length }
        });
        
        const unenrolledCourseCodes = availableCourses.map(item => item.courseCode);
        
        const unenrolledCourses = await courseModel.find({ courseCode: { $in: unenrolledCourseCodes }, dept: req.session.student_dept, sem: req.session.student_sem });
        
        const unenrolledCoursesWithSeats = unenrolledCourses.map((course) => {
            const seats = seatsLeft.find((item) => item.code == course.courseCode);
            return { ...course.toObject(), seatsLeft: seats ? seats.seatsLeft : course.seats };
        });
        
        
        
        
        
        
        
        
        res.render("students/changeElective.ejs", {
            enrolledCourses: enrolledCourses,
            unenrolledCourses: unenrolledCoursesWithSeats,
            courseCompleted: req.session.student_coursesCompleted,
            isOpen: true
        });
    }

});

router.post("/changeElective", async (req, res) => {
    console.log("POST");
    console.log(req.body);
    const body = req.body;

    const studentEmail = req.session.student_email;
    const studentDept = req.session.student_dept;
    const studentSem = req.session.student_sem;

    const changeElec = new changeElectiveRequestModel({
        email: studentEmail,
        courseCode: body.selectedCourses[0],
        dept: studentDept,
        sem: studentSem,
        status: 'pending'
    });

    await changeElec.save();

    res.redirect("/student/changeElective");
});

module.exports = router;