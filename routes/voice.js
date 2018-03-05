//routes/voice.js

var express = require("express");
var router = express.Router();
const VoiceResponse = require("twilio").twiml.VoiceResponse;
var Visit = require("./../models/visit");
var Caregiver = require("./../models/caregiver");
var Client = require("./../models/client");
var Activity = require("./../models/recentActivity");
var moment = require("moment");

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
router.post("/", function(req, res) {
  const twiml = new VoiceResponse();
  //twiml.say({ voice: 'alice' }, 'Welcome to the Peachy service!');

  /** helper function to set up a <Gather> */
  function gather() {
    const gatherNode = twiml.gather({ numDigits: 4, timeout:5 });
    gatherNode.say('Welcome to the peachy service');

    // If the user doesn't enter input, loop
    twiml.redirect('/voice');
  }

  function communicate(sentence){
    twiml.say(sentence);

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());

  }

  function checker(sentence){
    twiml.say(sentence);

    twiml.redirect('/voice');
    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());

  }

  // If the user entered digits, process their request
  if (req.body.Digits) {
     if(req.body.Digits.length == 5){
      Visit.findOne({visitId: req.body.From+req.body.Digits}, function(err, visit){
        if(err) return err;
   
        if(visit==null) {
          checker('No scheduled visit found');
          Visit.create({
            visitId:req.body.From+req.body.Digits,
            caregiverName: 'Unconfirmed',
            clientName:'Unconfirmed',
            date:new moment(),
            startTime: new moment(),
            endTime:new moment(),
            scheduledDuration:0,
            replyNumberC:'Not available',
            status:'reported'
          });
          return;
        } 
        else if(visit.status == 'Completed'){
          checker('This visit has been completed already');
        } else if(visit.status == 'reported'){
          checker('This visit has been reported to the manager for lack of response');
        }
        else if (visit.active){

          communicate('You have just clocked out!')

          var endTime = new moment()
          //duration in minutes
          var duration = (endTime.diff(visit.clockInTime,'minutes',true));
          
          visit.clockOutTime = endTime;
          visit.duration = duration;
          visit.active = false;
          if (visit.status != 'reported'){
            visit.status = 'Completed';
          }
          Client.findOne({id:req.body.From}, function(err,client){
            if(err) return err;
            if(client==null) return 'No client found';
            client.billedHours += visit.scheduledDuration;
            client.billedVisits.push(visit);
    
            Caregiver.findOne({phoneNumber:client.schedule[moment().format('dddd')][2]}, function(err,carer){
              if (err) return err;
              if(carer==null) {
                checker('No carer found with the given ID');
                return 'No caregivers found';
              };
    
              carer.payingHours += visit.scheduledDuration;
              carer.billedVisits.push(visit);
              carer.visits.push(visit);
    
              carer.save();
    
              //client.visitsBy[carer.name].push(visit);
              client.save();
            });
          });
        } else {

          communicate('You have just clocked in!');

          visit.clockInTime= new Date();
          visit.active = true;
          visit.status = 'In process';
        }
    
        visit.save();
      })
     } 
     else {
       gather();

      // Render the response as XML in reply to the webhook request
      res.type('text/xml');
      res.send(twiml.toString());
     }
  } else {
    // If no input was sent, use the <Gather> verb to collect user input
    gather();


    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  }


});


router.post("/message", function(req,res){
  console.log('receiving message');
  //implement handling for errors
})
module.exports = router;
