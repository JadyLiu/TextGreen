
var LIST_OF_RESPONSES = [
    "I miss you",
    "How are you today",
    "What are you doing"
];

var AWS = require("aws-sdk");
var APP_ID = undefined;
var AlexaSkill = require('./AlexaSkill');

exports.handler = function (event, context) {

    console.log('Loading function');
    TextGreen(event.to, 'Text Me', 
                function (status) { context.done(null, status); });  
};

function TextGreen(MessageToMe, callback) {
    var message = MessageToMe.value;
    console.log("Message is " + message);
    
    if (message)
    {
        var sns = new AWS.SNS();
        var params = {
            Message: 'JD sends you a message ' + message, 
            TopicArn: 'arn:aws:sns:us-east-1:097509526832:TextMe'
        };
    
        sns.publish(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else
            {   
                console.log("Success"); 
                
                 if ("How are you today" === message)
                    {
                        speechOutput = "I have a good day, wish you feel great as well!" +
                        "I will ask the question to you.";
                    } 
                    else if ("What are you doing" === message)
                    { 
                        speechOutput = "I assistant JD to message " +
                        "I will ask the question to you.";
                    }
                    
                    var sessionAttributes = {};
                    var speechOutput = speechOutput + "Ok, the message was sent.";
                            
                    var repromptText = "";
                    var shouldEndSession = true;
                    
                    callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
 
            }
        });
    }
    else
        {
            var sessionAttributes = {};
            var shouldEndSession = false;
            speechOutput = "I'm not sure what message you are going to send. Please try again";
            repromptText = "I'm not sure what message you are going to send. You can tell me if " +
            "you had any message to send.";
            callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
        }
    }


exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session, 
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ("TextMeIntent" === intentName) {
         var MessageToMe = intent.slots.Message;
         TextGreen(MessageToMe, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var speechOutput = "Hello JD " +
        "I'm excited to help you sending message. What would you want to send?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Tell me if you have any message to send ";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}