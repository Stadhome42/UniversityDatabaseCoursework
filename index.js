const colors = require('colors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const ejs = require('ejs');
const port = 3000;
const mysql = require("mysql");
const util = require("util");
const Connection = require('mysql/lib/Connection');
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_NAME = "coursework";
const DB_PASSWORD = "";
const DB_PORT = 3306;





var connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    });

connection.query = util.promisify(connection.query).bind(connection);

connection.connect(function (err) {
    if (err) {
    console.error("error connecting: " + err.stack);
    return;
    }
    console.log("Booom! You are connected");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static("public"));

app.get('/', (req, res) =>{
    res.render('index')

});

app.get('/member', async (req,res)=>{
    const Student = await connection.query("SELECT Student.Stu_FName, Student.Stu_LName, URN, POS_NAME, Role FROM Student JOIN Baseball ON Student.URN = Baseball.BASE_URN JOIN Positions ON Positions.POS_ID = Baseball.Pitch_Positions")
    res.render('member', {
        Student: Student
    })

})


app.get('/fixtures', async (req, res) =>{
    const Fixtures = await connection.query("SELECT Fix_Opponent, Fix_Venue, Fix_Date FROM Fixture;");
    res.render('fixtures', {
        Fixtures: Fixtures 
    })

});

app.get('/view/:urn', async (req, res) =>{
    const studentURN = req.params.urn;
    const Student = await connection.query("SELECT Stu_FName, Stu_LName, URN, Pos_Name FROM Student JOIN Baseball ON Baseball.BASE_URN = Student.URN JOIN Positions ON Baseball.Pitch_Positions = Positions.POS_ID WHERE URN = ?",[studentURN]);
    res.render('view',{
        Student : Student[0]
    })
})

app.get('/delete/:urn', async (req, res) => {
    const studentURN = req.params.urn;

    // Perform the DELETE operation
    await connection.query("DELETE FROM Baseball WHERE BASE_URN = ?", [studentURN]);

    // Redirect to a page indicating success or back to the member page
    res.redirect('/member');
});

app.get('/update/:urn', async (req, res) => {
    const studentURN = req.params.urn;
    res.render('update',{
        studentURN
    })
})

app.post('/submit', async (req, res) => {
    const name = req.body.name;
    const surname = req.body.surname;
    const position = req.body.position;
    const phone = req.body.phone;
    const URN = req.body.urn;


    await connection.query("UPDATE Student SET Stu_Fname = ?, Stu_Lname = ?, Stu_Phone = ? WHERE URN = ?", [name, surname, phone, URN]);
    await connection.query("UPDATE Baseball SET Pitch_Positions = ? WHERE BASE_URN = ?", [position, URN]);    

    res.redirect('/member')
})


app.listen(port, () =>{
    console.log(`listening on port http://localhost:${port}`);
})