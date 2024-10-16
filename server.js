var express = require("express");
var fileuploader = require("express-fileupload");
var mysql = require("mysql");

var path = require("path");
const { json } = require("stream/consumers");

var app = express();

app.listen(2023, function () {
    console.log("Server started...");
});

var dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "college-project",
    dateStrings: true
}

var dbRef = mysql.createConnection(dbConfig);
dbRef.connect(function (err) {
    if (err == null)
        console.log("Connected Successfully...");
    else
        console.log(err);
});

app.use(express.static("public"));

app.get("/signup", function (req, resp) {
    // resp.contentType("text/html");
    // console.log("User want to signup...");
    // resp.write("<center><b><i>Are you sure you really want to signup??</i></b></center>");
    // resp.end();
    resp.sendFile(__dirname + "/public/signup.html");
});

app.get("/login", function (req, resp) {
    // resp.contentType("text/html");
    // resp.write("<center><i>Welcome to login screen</i></center>");
    // resp.write("<center><i>Welcome to login screen</i></center>");
    // resp.write("<center><i>Welcome to login screen</i></center>");
    // resp.write("<center><i>Welcome to login screen</i></center>");
    // resp.end();
    resp.sendFile(__dirname + "/public/login.html");
});

app.get("/", function (req, resp) {
    var dir = process.cwd();
    console.log(dir);
    var dir2 = __dirname;
    var file = __filename;
    console.log(dir2 + "  " + file);
    // var path = process.cwd() + "/public/index.html";
    var pathFile = path.join(__dirname, "public", "index.html");
    resp.sendFile(path);
});


app.use(fileuploader());
app.use(express.urlencoded(true));


app.get("/ajax-chk-user", function (req, resp) {
    var emailKuch = req.query.kuchEmail;

    dbRef.query("select * from dbusers where email=?", [emailKuch], function (err, jsonAryResult) {
        if (err != null)
            resp.send(err.toString());

        else if (jsonAryResult.length == 1)
            resp.send("<h5><u>Sorry this ID is not available.</u></h5>");
        else
            resp.send("<u><h5>Greetings! this ID is available.</i></h5>");
    })
})

app.get("/chk-submit", function (req, resp) {

    dbRef.query("insert into dbusers(email,password,type,dos,status) values(?,?,?,current_date(),1)", [req.query.kuchemail, req.query.kuchpwd, req.query.kuchtype], function (err) {
        if (err == null) {
            resp.send("<h5><u>Record saved Successfully.</u></h5>");
            console.log("Record Saved Successfully.");
        }
        else {
            resp.send(err);
        }
    })
})

app.get("/chk-medicine", function (req, resp) {

    dbRef.query("insert into medsavailable(email,med,expdate,packing,qty,price) values(?,?,?,?,?,?)", [req.query.kuchemail, req.query.kuchname, req.query.kuchdate, req.query.kuchtype, req.query.kuchquantity, req.query.kuchprice], function (err) {
        if (err == null) {
            resp.send("<h5><u>Products Record saved Successfully.</u></h5>");
            console.log("Record Saved Successfully.");
        }
        else {
            resp.send(err);
        }
    })
})

app.get("/chk-update", function (req, resp) {

    dbRef.query("update dbusers set password=?,type=? where email=?", [req.query.kuchpwd, req.query.kuchtype, req.query.kuchemail], function (error) {
        if (error == null) {
            resp.send("<h5><u>Record Updated Successfully.</u></h5>");
            console.log("Record Updated Successfully.");
        }
        else {
            resp.send(error);
        }
    })
});

app.get("/chngpwd", function (req, resp) {
    var password = document.getElementById("password")
        , confirm_password = document.getElementById("confirmPassword");

    document.getElementById('signupLogo').src = "https://s3-us-west-2.amazonaws.com/shipsy-public-assets/shipsy/SHIPSY_LOGO_BIRD_BLUE.png";
    enableSubmitButton();

    function validatePassword() {
        if (password.value != confirm_password.value) {
            confirm_password.setCustomValidity("Passwords Don't Match");
            return false;
        } else {
            confirm_password.setCustomValidity('');
            return true;
        }
    }

    password.onchange = validatePassword;
    confirm_password.onkeyup = validatePassword;

    function enableSubmitButton() {
        document.getElementById('submitButton').disabled = false;
        document.getElementById('loader').style.display = 'none';
    }

    function disableSubmitButton() {
        document.getElementById('submitButton').disabled = true;
        document.getElementById('loader').style.display = 'unset';
    }

    function validateSignupForm() {
        var form = document.getElementById('signupForm');

        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].value === '' && form.elements[i].hasAttribute('required')) {
                console.log('There are some required fields!');
                return false;
            }
        }

        if (!validatePassword()) {
            return false;
        }

        onSignup();
    }

    function onSignup() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {

            disableSubmitButton();

            if (this.readyState == 4 && this.status == 200) {
                enableSubmitButton();
            }
            else {
                console.log('AJAX call failed!');
                setTimeout(function () {
                    enableSubmitButton();
                }, 1000);
            }

        };

        xhttp.open("GET", "ajax_info.txt", true);
        xhttp.send();
    }

    dbRef.query("update dbusers set password=? where email=? and password=?", [req.query.npwd, req.query.email, req.query.opwd], function (error) {
        if (error == null) {
            resp.send("PasswordUpdated Successfully.");
            console.log("Password Updated Successfully.");
        }
        else {
            resp.send(error);
        }
    })
});


app.post("/signup-process-db", function (req, resp) {
    var email = req.body.txtEmail;
    var password = req.body.txtPassword;
    var type = req.body.Type;

    // var selFileName = req.files.profilePic.name;
    // var desPath = path.join(__dirname, "public/uploads", selFileName);
    // req.files.profilePic.mv(desPath, function () {
    //     console.log("File saved in Uploads successfully.");
    // });

    dbRef.query("insert into dbusers(email,password,type,dos,status) values(?,?,?,current_date(),1)", [email, password, type], function (err) {
        if (err == null) {

            // // resp.send("Signed Up Successfully");
            // resp.redirect("signup-result.html");
        }
        else {
            console.log(err.toString());
            resp.send(err.toString());
        }
    });
});

app.get("/json-get-record", function (req, resp) {
    var emailKuch = req.query.kuchEmail;
    console.log(emailKuch);

    dbRef.query("select * from dbusers where email=?", [emailKuch], function (err, jsonAryResult) {
        console.log(jsonAryResult)
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/json-get-needy", function (req, resp) {
    var emailKuch = req.query.kuchEmail;
    console.log(emailKuch);

    dbRef.query("select * from needers where email=?", [emailKuch], function (err, jsonAryResult) {
        console.log(jsonAryResult)
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/json-get-profile", function (req, resp) {
    var emailKuch = req.query.kuchEmail;
    console.log(emailKuch);

    dbRef.query("select * from donors where email=?", [emailKuch], function (err, jsonAryResult) {
        console.log(jsonAryResult)
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/angular-get-all-users", function (req, resp) {
    dbRef.query("select * from dbusers", function (err, jsonAryResult) {
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/angular-delete-medicine"), function (req, resp) {
    var srno = req.query.x;
    dbRef.query("delete from medsavailable where srno=?", [srno], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Deleted Successfully.");
        else
            resp.send("Invalid ID.");
    });

};

app.get("/get-angular-medicine-record", function (req, resp) {
    var email = req.query.kuchemail;
    dbRef.query("select * from medsavailable where email=?", [email], function (err, resultTableJSON) {
        if (err == null)
            resp.send(resultTableJSON);
        else
            resp.send(err);
    })
})

app.get("/fetch-email", function (req, resp) {
    dbRef.query("select distinct email from medsavailable", function (err, jsonAryResult) {
        if (err == null) {
            resp.json(jsonAryResult);
        }
        else {
            resp.send(err.toString());
        }
    });
});

app.get("/angular-delete-user", function (req, resp) {
    var email = req.query.x;
    dbRef.query("delete from dbusers where email=?", [email], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Deleted Successfully.");
        else
            resp.send("Invalid ID.");
    });
});



app.get("/angular-get-all-needys", function (req, resp) {
    dbRef.query("select * from needers", function (err, jsonAryResult) {
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/angular-delete-needy", function (req, resp) {
    var email = req.query.x;
    dbRef.query("delete from needers where email=?", [email], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Deleted Successfully.");
        else
            resp.send("Invalid ID.");
    });
});


app.get("/get-angular-del-medicine-record", function (req, resp) {
    var srno = req.query.kuchsrno;
    dbRef.query("delete from medsavailable where srno=?", [srno], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Product Unavailed Successfully..");
        else
            resp.send("Invalid ID.");
    });
});

app.get("/fetch-med", function (req, resp) {

    dbRef.query("select distinct med from medsavailable", function (err, resultTable) {
        if (err == null) {
            resp.send(resultTable);
        }
        else {
            resp.send(err);
        }
    });
});

app.get("/fetch-city", function (req, resp) {
    dbRef.query("select distinct city from donors", function (err, resultTable) {
        if (err == null) {
            resp.send(resultTable);
        }
        else {
            resp.send(err);
        }
    });
});

app.get("/fetch-vill", function (req, resp) {
    dbRef.query("select * from donors", function (err, resultTable) {
        if (err == null) {
            resp.send(resultTable);
        }
        else {
            resp.send(err);
        }
    });
});


app.get("/fetch-donors", function (req, resp) {
    var med = req.query.medKuch;
    var city = req.query.cityKuch;

    dbRef.query("SELECT donors.name,donors.email,donors.mobile,donors.address,donors.city,donors.ahours,donors.bhours,donors.pic,medsavailable.med,medsavailable.price from donors INNER JOIN medsavailable on donors.email=medsavailable.email where medsavailable.med=? and donors.city=?", [med, city], function (err, resultTable) {
        if (err == null) {
            resp.send(resultTable);
        }
        else {
            resp.send(err);
        }
    });
});


app.get("/fetch-meds", function (req, resp) {
    dbRef.query("select distinct med from medsavailable", function (err, jsonAryResult) {
        if (err == null) {
            resp.json(jsonAryResult);
        }
        else {
            resp.send(err.toString());
        }
    });

});

app.get("/angular-get-all-donors", function (req, resp) {
    dbRef.query("select * from donors", function (err, jsonAryResult) {
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});

app.get("/angular-get-all-details", function (req, resp) {
    dbRef.query("SELECT * from donors", function (err, resultTable) {
        if (err == null) {
            resp.send(resultTable);
        }
        else {
            resp.send(err);
        }
    });
});


app.get("/angular-get-all-medicines", function (req, resp) {
    dbRef.query("select * from medsavailable where email=?", function (err, jsonAryResult) {
        if (err != null)
            resp.send(err.toString());
        else
            resp.json(jsonAryResult);
    });
});


app.get("/angular-delete-donor", function (req, resp) {
    var email = req.query.x;
    dbRef.query("delete from donors where email=?", [email], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Deleted Successfully.");
        else
            resp.send("Invalid ID.");
    });
});

app.get("/angular-resume-user", function (req, resp) {
    var email = req.query.x;
    dbRef.query("update dbusers set status=1 where email=?", [email], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Resumed Successfully.");
        else
            resp.send("Invalid ID.");
    });
});

app.get("/angular-block-user", function (req, resp) {
    var email = req.query.x;
    dbRef.query("update dbusers set status=0 where email=?", [email], function (err, result) {
        if (err != null)
            resp.send(err.toString());
        else if (result.affectedRows == 1)
            resp.send("Blocked Successfully.");
        else
            resp.send("Invalid ID.");
    });
});

app.get("/fetch-village", function (req, resp) {
    dbRef.query("select distinct email from donors", function (err, jsonAryResult) {
        if (err == null) {
            resp.json(jsonAryResult);
        }
        else {
            resp.send(err.toString());
        }
    });
});

app.get("/login-user", function (req, resp) {
    var email = req.query.kuchemail;
    var password = req.query.kuchpwd;

    dbRef.query("select type,status from dbusers where email=? and password=?", [email, password], function (err, jsonAryResult) {
        if (err == null) {
            if (jsonAryResult.length == 1) {
                if (jsonAryResult[0].status == 1)
                    resp.send(jsonAryResult[0].type);
                else
                    resp.send("You are Blocked.");
            }
            else
                resp.send("Invaid User ID/Password");
        }
        else {
            resp.send(err.tostring());
        }
    });
});

app.post("/profile-process-db", function (req, resp) {
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var dos = req.body.txtDate;
    var mobile = req.body.txtMobile;
    var address = req.body.txtAddress;
    var city = req.body.txtCity;
    var idproof = req.body.txtID;
    var ahours = req.body.txtHours;
    var bhours = req.body.txtHour;

    var selFileName = req.files.profilePic.name;
    var desPath = path.join(__dirname, "public/uploads", selFileName);

    req.files.profilePic.mv(desPath, function () {
        console.log("File saved in Uploads successfully.");
    });

    dbRef.query("insert into donors(email,name,dob,mobile,address,city,idproof,pic,ahours,bhours) values(?,?,?,?,?,?,?,?,?,?)", [email, name, dos, mobile, address, city, idproof, selFileName, ahours, bhours], function (err) {
        if (err == null) {
            console.log("Record Saved Successfully.");
            resp.redirect("signup-result.html");
        }
        else {
            console.log(err.toString());
            resp.send(err.toString());
        }
    });
});

app.post("/update-process-db", function (req, resp) {
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var dob = req.body.txtDate;
    var mobile = req.body.txtMobile;
    var address = req.body.txtAddress;
    var city = req.body.txtCity;
    var idproof = req.body.txtID;
    var ahours = req.body.txtHours;
    var bhours = req.body.txtHour;
    console.log(req.body);

    // var selFileName = req.files.profilePic.name;

    if (req.files != null) {
        var pic = req.files.profilePic.name;
        var desPath = path.join(__dirname, "public/uploads", pic);
        req.files.profilePic.mv(desPath, function () {
            console.log("File saved in Uploads successfully.");
        });
    }
    else
        pic = req.body.hdn;
    dbRef.query("update donors set name=?,dob=?,mobile=?,address=?,city=?,idproof=?,pic=?,ahours=?,bhours=? where email=? ", [name, dob, mobile, address, city, idproof, pic, ahours, bhours, email], function (err, result) {
        if (err != null) {
            resp.send(err.toString());
        }
        else if (result.affectedRows === 1) {
            console.log("Record Updated");
            resp.redirect("update-result.html");
        }
        else if (result.affectedRows == 0) {
            resp.send("<center><b><u><i><h2>Invalid Id.</h2></i></u></b></center>");
        }
        else {
            console.log(err.toString());
            resp.send(err.toString());
        }
    });
});

app.post("/profile-needers-db", function (req, resp) {
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var dbirth = req.body.txtDate;
    var mobile = req.body.txtMobile;
    var address = req.body.txtAddress;
    var city = req.body.txtCity;
    var gender = req.body.txtGender;

    var selFileName = req.files.profilePic.name;
    var desPath = path.join(__dirname, "public/uploads", selFileName);

    req.files.profilePic.mv(desPath, function () {
        console.log("File saved in Uploads successfully.");
    });

    dbRef.query("insert into needers(email,name,dob,mobile,address,city,pic,gender) values(?,?,?,?,?,?,?,?)", [email, name, dbirth, mobile, address, city, selFileName, gender], function (err) {
        if (err == null) {
            console.log("Record Saved Successfully.");
            resp.redirect("signupn-result.html");
        }
        else {
            console.log(err.toString());
            resp.send(err.toString());
        }
    });
});

app.post("/update-needers-db", function (req, resp) {
    var email = req.body.txtEmail;
    var name = req.body.txtName;
    var dbirth = req.body.txtDate;
    var mobile = req.body.txtMobile;
    var address = req.body.txtAddress;
    var city = req.body.txtCity;
    var gender = req.body.txtGender;

    if (req.files != null) {
        var pic = req.files.profilePic.name;
        var desPath = path.join(__dirname, "public/uploads", pic);
        req.files.profilePic.mv(desPath, function () {
            console.log("File saved in Uploads successfully.");
        });
    }
    else
        pic = req.body.hdn;
    dbRef.query("update needers set name=?,dob=?,mobile=?,address=?,city=?,pic=?,gender=? where email=?", [name, dbirth, mobile, address, city, pic, gender, email], function (err, result) {
        if (err != null) {
            resp.send(err.toString());
        }
        else if (result.affectedRows === 1) {
            console.log("Record Updated");
            // resp.send("<center><b><u><i><h2>Updated Successfully.</h2></i></u></b></center>");
            resp.redirect("updaten-result.html");
        }
        else if (result.affectedRows == 0) {
            resp.send("<center><b><u><i><h2>Invalid Id.</h2></i></u></b></center>");
        }
        else {
            console.log(err.toString());
            resp.send(err.toString());
        }
    });
});






// app.get("/ajax-chk-user", function (req, resp) {
//     var emailKuch = req.query.kuchEmail;

//     dbRef.query("select * from dbusers where email=?", [emailKuch], function (err, jsonAryResult) {
//         if (err != null)
//             resp.send(err.toString());

//         else if (jsonAryResult.length == 1)
//             resp.send("<center><i>Sorry this ID is not available!!</i><center>");
//         else
//             resp.send("<center><i>Congratulations this ID is available.</i></center>");
//     });

// });

// app.get("/json-get-record", function (req, resp) {
//     var emailKuch = req.query.kuchEmail;
//     console.log(emailKuch);

//     dbRef.query("select * from dbusers where email=?", [emailKuch], function (err, jsonAryResult) {
//         console.log(jsonAryResult)
//         if (err != null)
//             resp.send(err.toString());
//         else
//             resp.json(jsonAryResult);
//     })
// })

// app.get("/ajax-chk-login", function (req, resp) {
//     var lEmail = req.body.loginEmail;
//     var lPass = req.body.Loginpass;

//     dbRef.query("select * from dbusers where email=? and password=?", [lEmail, lPass], function (err, jsonAryResult) {

//         if (err) {
//             resp.send("error");
//         }

//         else if (jsonAryResult.length == 0) {
//             resp.send("Invalid")
//         }
//         else if (jsonAryResult[0].status == 0) {
//             resp.send("Blocked");
//         }
//         else
//             resp.send(jsonAryResult[0].usertype);
//     });
// });


// app.get("/json-get-record", function (req, resp) {
//     var lEmail = req.body.loginEmail;
//     console.log(lEmail);

//     dbRef.query("select * from dbusers where email=?", [], function (err, jsonAryResult) {
//         console.log(jsonAryResult)
//         if (err != null)
//             resp.send(err.toString());
//         else
//             resp.json(jsonAryResult);
//     })
// })


// app.post("/update-process-db", function (req, resp) {
//     var email = req.body.txtEmail;
//     var name = req.body.txtName;
//     var contact = req.body.txtContact;
//     var address = req.body.txtAddress;
//     var city = req.body.txtCity;
//     var idproof = req.body.txtID;
//     var category = req.body.txtCategory;
//     var company = req.body.txtCompany;
//     var establishedyear = req.body.txtEYear;
//     var revenue = req.body.txtRevenue;
//     var grossmargin = req.body.txtGMargin;
//     var productdetails = req.body.txtPDetails;
//     var otherinformation = req.body.txtOInformation;

//     var pic;
//     if (req.files != null) {
//         pic = req.files.profilePic.name;
//         var desPath = path.join(__dirname, "public/uploads", pic);

//         req.files.profilePic.mv(desPath, function () {
//             console.log("File saved in Uploads Successfully.");
//         })
//     }
//     else
//         pic = req.body.hdn;

//     dbRef.query("update psignup set name=?,contact=?,address=?,city=?,idproof=?,pic=?,category=?,company=?,establishedyear=?,revenue=?,grossmargn=?,productdetails=?,otherinformation=? where email=?", [name, contact, address, city, idproof, pic, category, company, establishedyear, revenue, grossmargin, productdetails, otherinformation, email], function (err, result) {
//         if (err != null) {
//             resp.send(err.toString());
//         }
//         else if (result.affectedRows == 1) {
//             console.log("Record Updated Successfully.");
//             resp.send("<center><b><u><i><h2>Updated Successfully.</h2></i></u></b></center>");
//         }
//         else if (result.affectedRows == 0) {
//             resp.send("<center><b><u><i><h2>Invalid ID</h2></i></u></b></center>");
//         }
//         else {
//             console.log(err.toString());
//             resp.send(err.toString());
//         }
//     })
// });

// app.post("/signup-process", function (req, resp) {
//     var email = req.body.txtEmail;
//     var name = req.body.txtName;
//     var contact = req.body.txtContact;
//     var address = req.body.txtAddress;
//     var city = req.body.txtCity;
//     var idproof = req.body.txtID;
//     var category = req.body.txtCategory;
//     var company = req.body.txtCompany;
//     var establishedyear = req.body.txtEYear;
//     var revenue = req.body.txtRevenue;
//     var grossmargin = req.body.txtGMargin;
//     var productdetails = req.body.txtPDetails;
//     var otherinformation = req.body.txtOInformation;

//     var selFileName = req.files.profilePic.name;
//     var desPath = path.join(__dirname, "public/uploads", selFileName);
//     req.files.profilePic.mv(desPath, function () {
//         console.log("File saved in Uploads successfully.");
//     });

//     dbRef.query("insert into psignup(email,name,contact,address,city,idproof,pic,category,company,establishedyear,revenue,grossmargin,productdetails,otherinformation) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [email, name, contact, address, city, idproof, selFileName, category, company, establishedyear, revenue, grossmargin, productdetails, otherinformation], function (err) {
//         if (err == null) {
//             console.log("Record Saved Successfully.");
//             // resp.send("Signed Up Successfully");
//             resp.redirect("signup-result.html");
//         }
//         else {
//             console.log(err.toString());
//             resp.send(err.toString());
//         }
//     });
// });


// app.post("/signup-process-shark", function (req, resp) {
//     var email = req.body.txtEmail;
//     var firstname = req.body.txtFirstName;
//     var lastname = req.body.txtLastName;
//     var dbirth = req.body.txtDate;
//     var address = req.body.txtAddress;
//     var contact = req.body.txtContact;
//     var city = req.body.txtCity;
//     var domains = req.body.txtCategory;
//     var companyname = req.body.txtCompanyName;
//     var companyinvested = req.body.txtCompanyInvested;
//     var otherinformation = req.body.txtOInformation;

//     var selFileName = req.files.profilePic.name;
//     var desPath = path.jooin(__dirname, "public/uploads", selFileName);
//     req.files.profilePic.mv(desPath, function () {
//         console.log("File saved in Uploads successfully.");
//     });

//     dbRef.query("insert into ssignup(email,firstname,lastname,dbirth,address,contact,city,domains,companyname,companyinvested,pic,otherinformation) values(?,?,?,?,?,?,?,?,?,?,?,?)", [email, firstname, lastname, dbirth, address, contact, city, domains, companyname, companyinvested, selFileName, otherinformation], function (err) {
//         if (err == null) {
//             console.log("Record Saved Successfully.");
//             // resp.send("Signed Up Successfully");
//             resp.redirect("signup-result.html");
//         }
//         else {
//             console.log(err.toString());
//             resp.send(err.toString());
//         }
//     });
// });

// app.post("/update-process-shark", function (req, resp) {
//     var email = req.body.txtEmail;
//     var firstname = req.body.txtFirstName;
//     var lastname = req.body.txtLastName;
//     var dbirth = req.body.txtDate;
//     var address = req.body.txtAddress;
//     var contact = req.body.txtContact;
//     var city = req.body.txtCity;
//     var domains = req.body.txtCategory;
//     var companyname = req.body.txtCompanyName;
//     var companyinvested = req.body.txtCompanyInvested;
//     var otherinformation = req.body.txtOInformation;

//     var pic;
//     if (req.files != null) {
//         pic = req.files.profilePic.name;
//         var desPath = path.join(__dirname, "public/uploads", pic);

//         req.files.profilePic.mv(desPath, function () {
//             console.log("File saved in Uploads Successfully.");
//         })
//     }
//     else
//         pic = req.body.hdn;

//     dbRef.query("update ssignup set firstname=?,lastname=?,dbirth=?,address=?,contact=?,city=?,domains=?,companyname=?,companyinvested=?,pic=?,otherinformation=? where email=?", [firstname, lastname, dbirth, address, contact, city, domains, companyname, companyinvested, pic, otherinformation, email], function (err, result) {
//         if (err != null) {
//             resp.send(err.toString());
//         }
//         else if (result.affectedRows == 1) {
//             console.log("Record Updated Successfully.");
//             resp.send("<center><b><u><i><h2>Updated Successfully.</h2></i></u></b></center>");
//         }
//         else if (result.affectedRows == 0) {
//             resp.send("<center><b><u><i><h2>Invalid ID.</h2></i></u></b></center>");
//         }
//         else {
//             console.log(err.toString());
//             resp.send(err.toString());
//         }
//     })
// })