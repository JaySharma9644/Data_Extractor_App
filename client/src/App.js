import React, { useState } from "react";
import { read, utils, writeFile } from 'xlsx';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"

const App = () => {
  const [data, setData] = useState([]);
  const [isLoader, setLoader] = useState(false);
  const handleImport = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          let Data_List = [];
          let sheet = wb.Sheets[sheets[0]];
          //const rows = utils.sheet_to_json(sheet);
          var range = utils.decode_range(sheet['!ref']);
          for (var R = range.s.r; R <= range.e.r; ++R) {
            let object = {};
            let index = 0;
            for (var C = range.s.c; C <= range.e.c; ++C) {
              var cell_address = { c: C, r: R };
              /* if an A1-style address is needed, encode the address */
              var cell_ref = utils.encode_cell(cell_address);
              if (sheet[cell_ref] && sheet[cell_ref] !== undefined) {
                object[index.toString()] = sheet[cell_ref].v;
                if (sheet[cell_ref].l && sheet[cell_ref].l.Target) {
                  sheet[cell_ref].v = sheet[cell_ref].l.Target;
                  let link_URL = sheet[cell_ref].l.Target.trim();
                  object["Link"] = link_URL;
                }
              }
              index = index + 1;
            }
            if (Object.keys(object).length > 0) {
              Data_List.push(object);
            }


          }
          setData(Data_List)
          //console.log("json data", Data_List);
        }
      }
      reader.readAsArrayBuffer(file);
    }
  }
  const makeAPICall = () => {
    
    try {
      setLoader(true)
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      fetch('/api/process', requestOptions)
        .then(response => response.json())
        .then(data => {
          setLoader(false)
          setData(data)

        });


    }
    catch (e) {
      console.log(e)
    }
  }
  const handleExport = () => {
    console.log(data)
    makeAPICall();
  }
  const downloadReport = () => {
    const headings = [[
      'ID',
      '1',
      '2',
      '3',
      '4',
      '5',
      'Company'
    ]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    let reports = data;
    reports.forEach(object => {
      delete object['Link'];
    });

    utils.sheet_add_json(ws, reports, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'Reports.xlsx');
  }
  const Loader = () => (
    <div className="spinner-container">
      <div className="loading-spinner">
      </div>
    </div>
  )
  return (
    <>
      <div className="row mb-2 mt-5">
        <div className="col-sm-6 offset-3">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <div className="custom-file">
                  <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={handleImport}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                  <label className="custom-file-label" htmlFor="inputGroupFile">Choose file</label>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <button onClick={handleExport} className="btn btn-primary float-right">
                Process<i className="fa fa-download"></i>
              </button>
            </div>
            <div className="col-md-3">
              <button onClick={downloadReport} className="btn btn-success float-right">
                Download Report<i className="fa fa-download"></i>
              </button>
            </div>
          </div>
        </div>
        {isLoader && <Loader/>}
       
      </div>
      <div className="row">
        <div className="col-sm-6 offset-3">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">2</th>
                <th scope="col">3</th>
                <th scope="col">4</th>
                <th scope="col">5</th>
                <th scope="col">6</th>
                <th scope="col">Company</th>
              </tr>
            </thead>
            <tbody>
              {
                data.length
                  ?
                  data.map((_item, index) => (
                    <tr key={index}>
                      <th scope="row">{_item[0]}</th>
                      <td>{_item[1]}</td>
                      <td>{_item[2]}</td>
                      <td>{_item[3]}</td>
                      <td>{_item[4]}</td>
                      <td>{_item[5]}</td>
                      <td>{_item["Transporter"] ? _item["Transporter"] : ""}</td>
                    </tr>
                  ))
                  :
                  <tr>
                    <td colSpan="5" className="text-center">No Data Found.</td>
                  </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </>

  );
};

export default App;