'use strict';
const Alexa = require('alexa-sdk');

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'Migraine Diary';
const GET_ENTRIES_MESSAGE = "Here are all your entries: ";
const HELP_MESSAGE = 'Would you like to add a migraine entry? Or hear how regularly you\'re having migraines? Or hear all your diary entries?';
const HELP_REPROMPT = 'Would you like to add a migraine entry?';
const STOP_MESSAGE = 'Goodbye!';

let diary = []
let totalEntries = 0;
let today = new Date();

function addEntry(painNum) {
  let newEntry = [today, painNum]
  diary.push(newEntry)
	totalEntries++;
}

function getAverageDaysBetweenMigraines(today, firstDate) {
  let days = (today.getTime() - firstDate.getTime())/(1000*3600*24);
  return Math.round(days / totalEntries);
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
      this.response.speak("Would you like to add a migraine entry, hear how often you're having migraines, or list all your entries thus far?").listen("I didn't catch that. Would you like to record a migraine?");
      this.emit(':responseReady');
    },

    'GiveEntryIntent': function () {
      let filledSlots = delegateSlotCollection.call(this);
      let painLevel = this.event.request.intent.slots.painLevel.value;
      addEntry(painLevel);
    	this.response.speak("Thanks for sharing. Your migraine has been logged. You now have " + totalEntries + " migraine entries added to your diary. Feel better!");
      this.emit(':responseReady');
    },

    'GetAverageDays': function() {
      let averageDays = getAverageDaysBetweenMigraines(today, diary[0][0]);
    	let output = "You have had " + totalEntries +  " migraines since " + diary[0][0].toDateString() +
      ". That is an average of one migraine every " + averageDays + " days."
    	this.response.speak(output);
    	this.emit(':responseReady');
    },

    'GetDiaryEntries': function() {
      let entries = ''
    	for (var i = 0; i < diary.length; i++) {
    		entries += diary[i][0].toDateString() + ": " + "Pain Level of: " + diary[i][1] + ". \n"
    	}
      console.log(GET_ENTRIES_MESSAGE + entries);
	    this.response.speak(GET_ENTRIES_MESSAGE + entries);
	    this.emit(':responseReady');
    },

    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },

    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },

    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    }
};


function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}


function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}
