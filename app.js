//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const soap = require("soap");
const ejs = require("ejs");
const $ = require("jquery");

//Create App
let app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

//Set initial values
let elementAttribute, changeFromDate, resultLength;
let resultShortName = "";
let currencyChange = "";
let initialValue = "";
let currencies = [];
var url = "http://www.lb.lt/webservices/fxrates/FxRates.asmx?wsdl";

//Get curerent Date
var currentDate = new Date();
var options = {
  year: 'numeric',
  month: '2-digit',
  day: 'numeric'
};
currentDate = currentDate.toLocaleDateString('fr-CA', options).split("/");
currentDate = currentDate[2] + "-" + currentDate[0] + "-" + currentDate[1];

let changeToDate = currentDate;

var args = {
  tp: 'EU',
  dt: currentDate
};

app.get("/", function(req, res) {
  soap.createClient(url, function(err, client) {
    if (!err) {
      client.getFxRates(args, function(err, result) {
        for (var i = 0; i < result.getFxRatesResult.FxRates.FxRate.length; i++) {
          let currency = result.getFxRatesResult.FxRates.FxRate[i].CcyAmt[1].Ccy;
          currencies.push(currency);
        }
        res.render("index", {
          currencies: currencies,
          resultShortName: resultShortName,
          currencyChange: currencyChange,
          resultLength: resultLength,
          changeToDate: changeToDate,
          changeFromDate: changeFromDate,
          initialValue: currencies[0]
        });
      });
    } else {
      console.log("There was an error: " + err);
    }
  });
});

app.post("/", function(req, res) {
  currencies = currencies;
  var currencyShort = req.body.selectedItem;
  var fullDate = req.body.daterange.split("/").join('-').split(" ");
  // console.log(fullDate);
  // compareDates = currentDate.split;
  initialValue = currencyShort;
  var argsPost = {
    tp: 'EU',
    ccy: currencyShort,
    dtFrom: fullDate[0],
    dtTo: fullDate[2]
  };
  soap.createClient(url, function(err, client) {
    if (!err) {
      client.getFxRatesForCurrency(argsPost, function(err, result) {
        let resultShortName = result.getFxRatesForCurrencyResult.FxRates.FxRate;
        if (resultShortName.length === undefined) {
          resultLength = 1;
          currencyChange = 0;
          changeFromDate = resultShortName.Dt;
          changetoDate = changeFromDate;
        } else {
          resultLength = resultShortName.length;
          currencyChange = (resultShortName[0].CcyAmt[1].Amt - resultShortName[resultLength - 1].CcyAmt[1].Amt);
          changeFromDate = resultShortName[resultLength - 1].Dt;
          changeToDate = resultShortName[0].Dt;          
        }
        if (currencyChange > 0) {
          currencyChange = "+" + currencyChange;
          elementAttribute = 'green';
        } else if (currencyChange < 0) {
          elementAttribute = 'red';
        } else {
          elementAttribute = '';
        }
        currencyChange = currencyChange.toString().substring(0, 8);
        res.render("index", {
          currencies: currencies,
          resultShortName: resultShortName,
          currencyChange: currencyChange,
          resultLength: resultLength,
          changeFromDate: changeFromDate,
          changeToDate: changeToDate,
          elementAttribute: elementAttribute,
          initialValue: initialValue
        });
      });
    } else {
      console.log("There was an error: " + err);
    }
  });
});


app.listen(3000, function() {
  console.log("App listening on port: 3000");
});
