const express = require('express')
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path')
const bodyparser = require('body-parser')
const multer = require('multer')
const xl = require('xlsx');
const rp = require('request-promise');
const cheerio = require('cheerio');
const excelJs = require('exceljs');
const cors = require('cors');
const PORT = process.env.PORT || 3001;

const app = express();
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions)); // Use this after the variable declaration
app.use(express.static('./public'));
app.use(bodyparser.json());
app.use(
  bodyparser.urlencoded({
    extended: true,
  }),
);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
  },
})
const uploadFile = multer({ storage: storage })

app.post('/api/process', async (req, res) => {
  let list_data = req.body;
  let promises = [];
  if(list_data && list_data.length>0){
    list_data.map((element) => {
      let promise = new Promise(async (resolve, reject) => {
        const response = await fetch(element["Link"]);
        const body = await response.text();
        const $ = cheerio.load(body);
        let transporter_name = $('#lbltransporter').text();
        element["Transporter"] =transporter_name;
        //console.log(transporter_name);
        resolve(transporter_name);
      });
      promises.push(promise);
    });
  
    let result = await Promise.all(promises);
  }else{
    list_data =[];
  }
  
  res.json(list_data);

})

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});