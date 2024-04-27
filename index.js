const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const env = require("dotenv");
const fs = require('fs');
const AWS = require('aws-sdk');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');
const app = express();
const port = 3000;
const saltRounds = 10;
const { client, connectToDB } = require('./db/db');
connectToDB();
const db = client.db('Skyvault');
env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const multer = require("multer");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "/public/uploads"),
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
AWS.config.update({
  accessKeyId: process.env.AccessKeyID,
  secretAccessKey: process.env.SecretAccessKey,
  region: process.env.region
});
const s3 = new AWS.S3();
const upload = multer({ storage });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});


app.get("/logout", (req,res)=>{
  res.redirect("/login");
})

app.post("/signup", async (req, res) => {
  const email = req.body.mailID;
  const password = req.body.password;

  try {
    const existingUser = await db.collection('users').findOne({ email: email });
    if (existingUser) {
      res.send("Email already exists. Try logging in.");
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const result = await db.collection('users').insertOne({ email: email, password: hash });
      console.log(result);
      localStorage.setItem('email', email);
      res.sendFile(path.join(__dirname, "views", "home.html"));
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.mailID;
  const loginPassword = req.body.password;

  try {
    // Find the user with the provided email
    const user = await db.collection('users').findOne({ email: email });
    if (user) {
      const storedHashedPassword = user.password;
      // Verifying the password
      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).send('Internal Server Error');
        } else {
          if (result) {
            res.sendFile(path.join(__dirname, "views", "home.html"));
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/getFiles',async (req,res)=>{
  const email=req.body.email;
  try {
    const filesArray = await db.collection('files').find({ email: email }, { projection: { file: 1, originalname: 1, _id: 0 } }).toArray();

    const link = process.env.S3 + email + "/";
    res.status(200).json({ filesArray, link });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
})
app.post('/delete', async (req, res) => {
  const file = req.body.file;
  const filename = file.split('/');
  const bucketName = 'skyvaultmugu'; // Replace with your bucket name
  const s3 = new AWS.S3();
  
  const params = {
    Bucket: bucketName,
    Key: file,
  };

  // try {
  //   // Delete file from S3
  //   await s3.deleteObject(params).promise();

  //   // Delete file record from MongoDB
  //   await db.collection('files').deleteOne({ file: filename[1] });

  //   res.status(200).json({ code: 200, message: "Deleted successfully" });
  //   console.log("File deleted successfully from S3");
  // } catch (err) {
  //   console.error("Error deleting file:", err);
  //   res.status(500).json({ code: 500, message: "Error occurred in deleting file" });
  // }
  // s3.deleteObject(params, async function (err, data) {
  //   if (err) {
  //     console.error("Error deleting file from S3:", err);
  //     res.status(200).json({ code: 500, message: "Error occured in deleting file" });
  //   } else {
  //     // await db.query(
  //     //   "DELETE FROM files WHERE file=$1",
  //     //   // [filename[1]]
  //     //   );
  //     await db.collection('files').deleteOne({ file: filename[1] });

  //     res.status(200).json({ code: 200, message: "Deleted succcesfully" });
  //     console.log("File deleted successfully from S3");
  //   }
  // });
  await db.collection('files').deleteOne({ file: filename[1] });

  res.status(200).json({ code: 200, message: "Deleted succcesfully" });
});
app.post('/upload', upload.single("file"), async (req, res) => {
  const filename = req.file.filename;
  const originalname = req.body.original_name;
  const email = req.body.email;

  // Create S3 service object
  const s3 = new AWS.S3();

  // Define the bucket name and key (path) for the file
  const bucketName = 'skyvaultmugu';
  const key = email + '/' + filename;

  // Specify the path to the file on your local machine
  const filePath = 'public/uploads/' + filename;

  try {
    // Read the file from the local file system
    const fileContent = fs.readFileSync(filePath);

    // Set the parameters for S3 upload
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent
    };
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error("Error uploading file to S3:", err);
        res.status(500).json({ code: 500, message: "Error uploading file to S3" });
      } else {
        try {
          
          await db.collection('files').insertOne({ email: email, file: filename, originalname: originalname });
          const result = data.Location.split('/')[data.Location.split('/').length - 1];
          const link = process.env.S3 + email + "/" + result;
          console.log("File uploaded successfully to S3:", data.Location);
          // Assuming fs is imported and filename is correct
          fs.unlinkSync("public/uploads/" + filename);
          res.status(200).json({ code: 200, link: link });
        } catch (error) {
          console.error("Error inserting file into database:", error);
          res.status(500).json({ code: 500, message: "Error inserting file into database" });
        }
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ code: 500, message: "Error occurred in uploading file" });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;