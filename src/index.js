
var AWS = require("aws-sdk");

/**
 * This sample shows how to create a simple Lambda function for handling speechlet requests.
 */

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
        console.log("TextMeIntent received");
        setMessageInSession(intent, session, callback);
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

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var speechOutput = "Hello JD " +
        "I'm excited to help you sending message. What would you want to send?";
    var repromptText = "Tell me if you have any message to send ";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}

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
    console.log(intent);

    var text = intent.slots.Text.value;
    var destination = intent.slots.Destination.value;

    console.log("Sending sms to : "+ destination +" with text: "+ text);

    // var repromptText = "";
    // var sessionAttributes = {};
    var shouldEndSession = false;
    // var speechOutput = "";
    var number;
    // messageSlot.value
    var sns = new AWS.SNS();

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
                        speechOutput = "I feel hungry too, are you going to cook lots of yummy food for JD" +
                        "Let JD know";
                    } 
                else if ("I miss you" === text) { 
                        speechOutput = "I assistant JD to Message " +
                        "I think JD is really missing you";
                    }
                else if ("I am at home" === text) { 
                        speechOutput = "I assistant JD to Message " +
                        "JD is at home, hurry up to go home";
                    }
                    
                    var sessionAttributes = {};
                    var speechOutput = speechOutput + "and Ok, now, the message was sent.";
                            
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
    } else if ("love" === destination) {
        number = "+61452377055";
        var params = {
           Message: 'Alexa helps JD send you a message: ' + text,
           PhoneNumber: number
         // TopicArn: 'arn:aws:sns:us-east-1:097509526832:TextMe'
        };  
        console.log(text);

        sns.publish(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else
            {   
                console.log("Success"); 
                
                if ("What are we going to eat" === text){
                        speechOutput = "I feel hungry too, are you going to cook lots of yummy food for JD" +
                        "Let JD know";
                    } 
                else if ("I miss you" === text) { 
                        speechOutput = "I assistant JD to Message " +
                        "I think JD is really missing you";
                    }
                else if ("I am at home" === text) { 
                        speechOutput = "I assistant JD to Message " +
                        "JD is at home, hurry up to go home";
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
    else {
            var sessionAttributes = {};
            var shouldEndSession = false;
            speechOutput = "I'm not sure what message you are going to send. Please try again";
            repromptText = "I'm not sure what message you are going to send. You can tell me if " +
            "you had any message to send.";
            callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
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