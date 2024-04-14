var page = require("webpage").create();
var moment = require("moment.min");
var system = require("system");


// retrieve proxy user and password from command line options
// (!! I havent found any easier way to do it: no slimerjs API for it !!)
// use Array.findIndex in ECMAScript 6
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
var proxyauth = (system.env["__SLIMER_ARGS"]).split(" ");
var idx = proxyauth.findIndex(function(elem, i, array) {
   return elem.match(/auth/);});

// use Destructuring assignment in ECMAScript 6
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
var [puser, ppwd] = (proxyauth[++idx]).split(":");

// extract the in/out badge clockings
// return an array like
// a["1"] = ["08:53", "12:13"]  // 1 is Monday
// ...
// a["7"] = ["08:53", "12:13"]  // 7 is Sunday
var extractClockings = function(selector) {
   var elems = $(selector);
   var week = [];
   // iterate thru the "Clockings" table
   $(elems).each(function(index){ // index starts from 1
      var tmp = [];
      // collect the readings for this one day
      var clocks = $(this).find("a");
      if (clocks.length) {
         var c;
         for (var i = 0; i < clocks.length; i++) {
            tmp.push($(clocks[i]).text());
         }
      }
      week[index-1] = tmp;
      console.log(week[index]);
   });

   return week;
};

// could use Template string,
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings
// but Firefox supports it as of ver 34 (at Eurocontrol we are at 28)
var data = 'LOGIN=' + puser + '&PASSWORD=' + ppwd;

// pass (it is arg[0]) any day in the week you want to have the clockings
// and here we find the relevant Monday
var ref_date = moment(phantom.args[0], "DD/MM/GGGG").isoWeekday(1);

// ChronoGestor URLs
var url = "http://flexitime.eurocontrol.int:81/modintrachronotique/login";
var clock = "http://flexitime.eurocontrol.int:81/modintrachronotique/planning/pointages?&jour_sel=" + ref_date.format("DD/MM/YYYY");

// selector for clockings (sub)table [use Firefox Devtools to find it!]
var sel = "#divText > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(6) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) td";


// STEP 1: login
page.open(url, 'post', data, function(status){
  if (status == "success") {

      var npage = require("webpage").create();
      // in order to eventually be able to console.log inside the call to evaluate...
      npage.onConsoleMessage = function (msg) {
         console.log(msg);
      };

      // STEP 2: navigate to "Daily Movements" page, i.e. 'clock' URL
      npage.open(clock, function(status) {
         if (status == "success") {
            // include JQuery for easy selection of the 'Clockings' (sub)table via CSS
            npage.includeJs("http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js", function() {
               var week = npage.evaluate(extractClockings, sel);

               // for each day
               for (var d = 0; d < week.length; d++) {
                  // calculate the worked minutes
                  var clock_in, clock_out,
                      minutes = 0, decimal_hour, decimal_minutes,
                      sum_minutes = 0, sum_decimal_minutes, sum_decimal_hours;

                  console.log("");
                  // take couples or readings
                  for (var c = 0; c < ~~(week[d].length/2); c++) {
                     // read in and out
                     clock_in  = moment(week[d][2*c],"HH:mm");
                     clock_out = moment(week[d][2*c+1],"HH:mm");

                     // minutes between out and in
                     minutes = clock_out.diff(clock_in) / 60000;

                     sum_minutes += minutes; // cumulative minutes for the relevant day

                     // decimal format transformations
                     decimal_hour = Math.floor(minutes / 60);
                     decimal_minutes = (minutes % 60) * 5 / 3;
                     decimal_hour = Math.floor10(decimal_hour + (decimal_minutes/100), -2);

                     console.log(ref_date.format("dddd") + " -> hours worked (decimal): " + decimal_hour + " (" + minutes + " min)");
                  }

                  console.log("--------------------------------------");
                  sum_decimal_hour = Math.floor(sum_minutes / 60);
                  sum_decimal_minutes = (sum_minutes % 60) * 5 / 3;
                  sum_decimal_hour = Math.floor10(sum_decimal_hour + (sum_decimal_minutes/100), -2);

                  console.log(ref_date.format("dddd DD/MM/YYYY") + " -> total hours worked (decimal): " + sum_decimal_hour + " (" + sum_minutes + " min)");
                  console.log("");

                  ref_date.add(1, 'd');
               }
            });
         }
         else {
            console.log("The loading of clockings has failed");
         }
      });
   }
   else {
      console.log("Sorry, the login page is not loaded");
   }
   slimer.wait(5000);
   slimer.exit();
});


// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
(function(){

   /**
    * Decimal adjustment of a number.
    *
    * @param   {String} type  The type of adjustment.
    * @param   {Number} value The number.
    * @param   {Integer}   exp      The exponent (the 10 logarithm of the adjustment base).
    * @returns {Number}       The adjusted value.
    */
   function decimalAdjust(type, value, exp) {
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
         return Math[type](value);
      }
      value = +value;
      exp = +exp;
      // If the value is not a number or the exp is not an integer...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
         return NaN;
      }
      // Shift
      value = value.toString().split('e');
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
      // Shift back
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
   }

   // Decimal round
   if (!Math.round10) {
      Math.round10 = function(value, exp) {
         return decimalAdjust('round', value, exp);
      };
   }
   // Decimal floor
   if (!Math.floor10) {
      Math.floor10 = function(value, exp) {
         return decimalAdjust('floor', value, exp);
      };
   }
   // Decimal ceil
   if (!Math.ceil10) {
      Math.ceil10 = function(value, exp) {
         return decimalAdjust('ceil', value, exp);
      };
   }

})();