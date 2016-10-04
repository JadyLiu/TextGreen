var LIST_OF_RESPONSES = [
    "I miss you",
    "How are you today",
    "What are you doing"
];

var AWS = require("aws-sdk");

/**
 * This sample shows how to create a simple Lambda function for handling speechlet requests.
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
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
         console.log("TextMeIntent");
         setMessageInSession(intent, session, callback);
//=========================================================
         // var MessageToMe = intent.slots.Message;
         // TextGreen(MessageToMe, callback);
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

/**
 * Sets the message in the session and prepares the speech to reply to the user.
 */
function setMessageInSession(intent, session, callback) {
    console.log(intent)

    // var cardTitle = intent.name;
    var messageSlot = intent.slots.Message;

    console.log(messageSlot.value)
    // console.log("I think"+messageSlot)
    // var repromptText = "";
    // var sessionAttributes = {};
    var shouldEndSession = false;
    // var speechOutput = "";
    if (messageSlot.value) {

        var sns = new AWS.SNS();//call AWS sdk
        var params = {
            Message: 'JD sends you a message ' + messageSlot.value, 
            TopicArn: 'arn:aws:sns:us-east-1:097509526832:TextMe'
        };
        
        console.log("sendMessage funtion")

        message = messageSlot.value;

        Message = messageSlot.value;

        console.log(Message)

        console.log("Message slot contains: " + messageSlot.value + ".");
        sns.publish(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else
            {   
                console.log("Success"); 
                
                 if ("How are you" === Message)
                    {
                        speechOutput = "I have a good day, wish you feel great as well!" +
                        "I will ask the question to you.";
                    } 
                    else if ("What are you doing" === Message)
                    { 
                        speechOutput = "I assistant JD to Message " +
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
        // sessionAttributes = createMessageAttributes(message);
        // speechOutput = "Your message has been sent. You can ask me to repeat it by saying, "
        //         + "what's my message?";
        // repromptText = "You can ask me to repeat your message by saying, what's my message?";
        // var req = https.request(options, function(res) {
        //     res.setEncoding('utf8');
        //     res.on('data', function (chunk) {
        //         callback(sessionAttributes, 
        //         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        //     });
        // });
        // req.on('error', function(e) {
        //     console.log('problem with request: ' + e.message);
        //     context.fail(e);
        // });
        // req.write('{"channel": "#aws-lambda", "username": "webhookbot", "text": "[via Alexa]: ' + message + '", "icon_emoji": ":ghost:"}');
        // req.end();
    } else {
            var sessionAttributes = {};
            var shouldEndSession = false;
            speechOutput = "I'm not sure what message you are going to send. Please try again";
            repromptText = "I'm not sure what message you are going to send. You can tell me if " +
            "you had any message to send.";
            callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
    //     speechOutput = "I didn't hear your message clearly, please try again";
    //     repromptText = "I didn't hear your message clearly, you can give me your "
    //             + "message by saying, my message is...";
    // callback(sessionAttributes, 
    //          buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

// function createMessageAttributes(message) {
//     return {
//         message: message
//     };
// }

// function getMessageFromSession(intent, session, callback) {
//     var cardTitle = intent.name;
//     var message;
//     var repromptText = null;
//     var sessionAttributes = {};
//     var shouldEndSession = false;
//     var speechOutput = "";

//     if(session.attributes) {
//         message = session.attributes.message;
//     }

//     if(message) {
//         speechOutput = "Your message is " + message + ", goodbye";
//         shouldEndSession = true;
//     }
//     else {
//         speechOutput = "I didn't hear your message clearly. As an example, you can say, My message is 'hello, team!'";
//     }

//     // Setting repromptText to null signifies that we do not want to reprompt the user. 
//     // If the user does not respond or says something that is not understood, the app session 
//     // closes.
//     callback(sessionAttributes,
//              buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
// }