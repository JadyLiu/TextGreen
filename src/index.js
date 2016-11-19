var Alexa = require('alexa-sdk');
var AWS = require("aws-sdk");
var http = require('http');
var utils = require('util');

var states = {
    STARTMODE: '_STARTMODE',
    DESCRIPTION: '_DESKMODE',
};
// local variable holding reference to the Alexa SDK object
var alexa;

//OPTIONAL: replace with "amzn1.ask.skill.[your-unique-value-here]";
var APP_ID = ""; 

// URL to get the .ics from, in this instance we are getting from Stanford however this can be changed
//http://events.stanford.edu/eventlist.ics
var URL = "";

// Skills name 
var skillName = "TextMe:";

// Message when the skill is first called
var welcomeMessage = "You can send txt message to others or say help. What would you like? ";

// Message for help intent
var HelpMessage = "Here are some things you can say: message your message to my love, or send message to other with your message? What would you like to know?";

//var descriptionStateHelpMessage = "Here are some things you can say: Tell me about event one";

var EatMessage = "I feel hungry too, are you going to cook lots of yummy food for JD, let JD know";

var MissMessage = "I think JD is really missing you";

var HomeMessage = "JD is at home, hurry up to go home";

var SentMessage = "Ok, now, the message was sent.";

// used for title on companion app
var cardTitle = "Events";

// output for Alexa
var output = "";

// More info text
var haveEventsRepromt = "Would you want to send message to another person?";

// Used when there is no data within a time period
var NoDataMessage = "Sorry there arnt't any messages sent. Would you like to send again?";

// Used to tell user skill is closing
var shutdownMessage = "Ok see you again soon.";

////
// Message used when only 1 event is found allowing for difference in punctuation 
var oneEventMessage = "There is 1 event ";

// Message used when more than 1 event is found allowing for difference in punctuation 
var multipleEventMessage = "There are %d events ";

// text used after the number of events has been said
var scheduledEventMessage = "scheduled for this time frame. I've sent the details to your Alexa app: ";

var firstThreeMessage = "Here are the first %d. ";

// the values within the {} are swapped out for variables
var eventSummary = "The %s event is, %s at %s on %s ";

// Only used for the card on the companion app
var cardContentSummary = "%s at %s on %s ";

// Error if a date is out of range
var dateOutOfRange = "Date is out of range please choose another date";

// Error if a event number is out of range
var eventOutOfRange = "Event number is out of range please choose another event";

// Used when an event is asked for
var descriptionMessage = "Here's the description ";

// Used when an event is asked for
var killSkillMessage = "Ok, great, see you next time.";

var eventNumberMoreInfoText = "You can say the event number for more information.";

// stores events that are found to be in our date range
var relevantEvents = new Array();

// Adding session handlers
var newSessionHandlers = {
    'LaunchRequest': function () {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', skillName + " " + welcomeMessage, welcomeMessage);
    },
    'Unhandled': function() {
        var message = 'Say ask text me or open text me to start';
        this.emit(':ask', message, message);
    }
};

// Create a new handler with a SEARCH state
var startOnIntentHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.YesIntent': function () {
        output = welcomeMessage;
        alexa.emit(':ask', output, welcomeMessage);
    },

    'AMAZON.NoIntent': function () {
        this.emit(':tell', shutdownMessage);
    },

    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', output, HelpMessage);
    },

    'onIntent': function () {
        // Declare variables
        var text = this.event.request.intent.slots.Text.value;
        var destination = this.event.request.intent.slots.Destination.value;

    if ("JD" === destination) {
        number = "+61433012483";
        var params = {
           Message: 'JD sends you a message ' + text,
           PhoneNumber: number
         // TopicArn: 'arn:aws:sns:us-east-1:097509526832:TextMe'
        };  
        console.log(text);

        sns.publish(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else
            {   
                console.log("Success"); 
                
                if ("What are we going to eat" === text){
                        output = EatMessage;
                    } 
                else if ("I miss you" === text) { 
                        output = MissMessage;
                    }
                else if ("I am at home" === text) { 
                        output = HomeMessage;
                    }    
                var output += SentMessage;
                var cardContent = text;
                alexa.emit(':askWithCard', output, haveEventsRepromt, cardTitle, cardContent);
 
            }
        });
    } else {
            output = NoDataMessage;
            alexa.emit(':ask', output, output);
    }
        
        // var parent = this;

        // Using the iCal library I pass the URL of where we want to get the data from.
        // ical.fromURL(URL, {}, function (err, data) {
        //     // Loop through all iCal data found
        //     for (var k in data) {
        //         if (data.hasOwnProperty(k)) {
        //             var ev = data[k]
        //             // Pick out the data relevant to us and create an object to hold it.
        //             var eventData = {
        //                 summary: removeTags(ev.summary),
        //                 location: removeTags(ev.location),
        //                 description: removeTags(ev.description),
        //                 start: ev.start
        //             }
        //             // add the newly created object to an array for use later.
        //             eventList.push(eventData);
        //         }
        //     }
        //     // Check we have data
        //     if (eventList.length > 0) {
        //         // Read slot data and parse out a usable date 
        //         var eventDate = getDateFromSlot(slotValue);
        //         // Check we have both a start and end date
        //         if (eventDate.startDate && eventDate.endDate) {
        //             // initiate a new array, and this time fill it with events that fit between the two dates
        //             relevantEvents = getEventsBeweenDates(eventDate.startDate, eventDate.endDate, eventList);

        //             if (relevantEvents.length > 0) {
        //                 // change state to description
        //                 parent.handler.state = states.DESCRIPTION;

        //                 // Create output for both Alexa and the content card
        //                 var cardContent = "";
        //                 output = oneEventMessage;
        //                 if (relevantEvents.length > 1) {
        //                     output = utils.format(multipleEventMessage, relevantEvents.length);
        //                 }

        //                 output += scheduledEventMessage;

        //                 if (relevantEvents.length > 1) {
        //                     output += utils.format(firstThreeMessage, relevantEvents.length);
        //                 }

        //                 if (relevantEvents[0] != null) {
        //                     var date = new Date(relevantEvents[0].start);
        //                     output += utils.format(eventSummary, "First", removeTags(relevantEvents[0].summary), relevantEvents[0].location, date.toDateString() + ".");
        //                 }
        //                 if (relevantEvents[1]) {
        //                     var date = new Date(relevantEvents[1].start);
        //                     output += utils.format(eventSummary, "Second", removeTags(relevantEvents[1].summary), relevantEvents[1].location, date.toDateString() + ".");
        //                 }
        //                 if (relevantEvents[2]) {
        //                     var date = new Date(relevantEvents[2].start);
        //                     output += utils.format(eventSummary, "Third", removeTags(relevantEvents[2].summary), relevantEvents[2].location, date.toDateString() + ".");
        //                 }

        //                 for (var i = 0; i < relevantEvents.length; i++) {
        //                     var date = new Date(relevantEvents[i].start);
        //                     cardContent += utils.format(cardContentSummary, removeTags(relevantEvents[i].summary), removeTags(relevantEvents[i].location), date.toDateString()+ "\n\n");
        //                 }

        //                 output += eventNumberMoreInfoText;
        //                 alexa.emit(':askWithCard', output, haveEventsRepromt, cardTitle, cardContent);
        //             } else {
        //                 output = NoDataMessage;
        //                 alexa.emit(':ask', output, output);
        //             }
        //         }
        //         else {
        //             output = NoDataMessage;
        //             alexa.emit(':ask', output, output);
        //         }
        //     } else {
        //         output = NoDataMessage;
        //         alexa.emit(':ask', output, output);
        //     }
        // });
    },

    'AMAZON.HelpIntent': function () {
        output = HelpMessage;
        this.emit(':ask', output, output);
    },

    'AMAZON.StopIntent': function () {
        this.emit(':tell', killSkillMessage);
    },

    'AMAZON.CancelIntent': function () {
        this.emit(':tell', killSkillMessage);
    },

    'Unhandled': function () {
        this.emit(':ask', HelpMessage, HelpMessage);
    },

    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    }

});

// Create a new handler object for description state
// var descriptionHandlers = Alexa.CreateStateHandler(states.DESCRIPTION, {
//     'eventIntent': function () {

//         var repromt = " Would you like to hear another event?";
//         var slotValue = this.event.request.intent.slots.number.value;

//         // parse slot value
//         var index = parseInt(slotValue) - 1;

//         if (relevantEvents[index]) {

//             // use the slot value as an index to retrieve description from our relevant array
//             output = descriptionMessage + removeTags(relevantEvents[index].description);

//             output += repromt;

//             this.emit(':askWithCard', output, repromt, relevantEvents[index].summary, output);
//         } else {
//             this.emit(':tell', eventOutOfRange);
//         }
//     },

//     'AMAZON.HelpIntent': function () {
//         this.emit(':ask', descriptionStateHelpMessage, descriptionStateHelpMessage);
//     },

//     'AMAZON.StopIntent': function () {
//         this.emit(':tell', killSkillMessage);
//     },

//     'AMAZON.CancelIntent': function () {
//         this.emit(':tell', killSkillMessage);
//     },

//     'AMAZON.NoIntent': function () {
//         this.emit(':tell', shutdownMessage);
//     },

//     'AMAZON.YesIntent': function () {
//         output = welcomeMessage;
//         alexa.emit(':ask', eventNumberMoreInfoText, eventNumberMoreInfoText);
//     },

//     'Unhandled': function () {
//         this.emit(':ask', HelpMessage, HelpMessage);
//     },

//     'SessionEndedRequest': function () {
//         this.emit('AMAZON.StopIntent');
//     }

// });

// register handlers - this is the entry point
exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, startOnIntentHandlers);
    alexa.execute();
};
//======== HELPER FUNCTIONS ==============

// Remove HTML tags from string
function removeTags(str) {
    return str.replace(/<(?:.|\n)*?>/gm, '');
}

// Given an AMAZON.DATE slot value parse out to usable JavaScript Date object
// Utterances that map to the weekend for a specific week (such as �this weekend�) convert to a date indicating the week number and weekend: 2015-W49-WE.
// Utterances that map to a month, but not a specific day (such as �next month�, or �December�) convert to a date with just the year and month: 2015-12.
// Utterances that map to a year (such as �next year�) convert to a date containing just the year: 2016.
// Utterances that map to a decade convert to a date indicating the decade: 201X.
// Utterances that map to a season (such as �next winter�) convert to a date with the year and a season indicator: winter: WI, spring: SP, summer: SU, fall: FA)
function getDateFromSlot(rawDate) {
    // try to parse data
    var date = new Date(Date.parse(rawDate));
    var result;
    // create an empty object to use later
    var eventDate = {

    };

    // if could not parse data must be one of the other formats
    if (isNaN(date)) {
        // to find out what type of date this is, we can split it and count how many parts we have see comments above.
        var res = rawDate.split("-");
        // if we have 2 bits that include a 'W' week number
        if (res.length === 2 && res[1].indexOf('W') > -1) {
            var dates = getWeekData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // if we have 3 bits, we could either have a valid date (which would have parsed already) or a weekend
        } else if (res.length === 3) {
            var dates = getWeekendData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // anything else would be out of range for this skill
        } else {
            eventDate["error"] = dateOutOfRange;
        }
        // original slot value was parsed correctly
    } else {
        eventDate["startDate"] = new Date(date).setUTCHours(0, 0, 0, 0);
        eventDate["endDate"] = new Date(date).setUTCHours(24, 0, 0, 0);
    }
    return eventDate;
}

// Given a week number return the dates for both weekend days
function getWeekendData(res) {
    if (res.length === 3) {
        var saturdayIndex = 5;
        var sundayIndex = 6;
        var weekNumber = res[1].substring(1);

        var weekStart = w2date(res[0], weekNumber, saturdayIndex);
        var weekEnd = w2date(res[0], weekNumber, sundayIndex);

        return Dates = {
            startDate: weekStart,
            endDate: weekEnd,
        };
    }
}

// Given a week number return the dates for both the start date and the end date
function getWeekData(res) {
    if (res.length === 2) {

        var mondayIndex = 0;
        var sundayIndex = 6;

        var weekNumber = res[1].substring(1);

        var weekStart = w2date(res[0], weekNumber, mondayIndex);
        var weekEnd = w2date(res[0], weekNumber, sundayIndex);

        return Dates = {
            startDate: weekStart,
            endDate: weekEnd,
        };
    }
}

// Used to work out the dates given week numbers
var w2date = function (year, wn, dayNb) {
    var day = 86400000;

    var j10 = new Date(year, 0, 10, 12, 0, 0),
        j4 = new Date(year, 0, 4, 12, 0, 0),
        mon1 = j4.getTime() - j10.getDay() * day;
    return new Date(mon1 + ((wn - 1) * 7 + dayNb) * day);
};

// Loops though the events from the iCal data, and checks which ones are between our start data and out end date
function getEventsBeweenDates(startDate, endDate, eventList) {

    var start = new Date(startDate);
    var end = new Date(endDate);

    var data = new Array();

    for (var i = 0; i < eventList.length; i++) {
        if (start <= eventList[i].start && end >= eventList[i].start) {
            data.push(eventList[i]);
        }
    }

    console.log("FOUND " + data.length + " events between those times")
    return data;
}



