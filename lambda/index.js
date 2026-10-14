const Alexa = require('ask-sdk-core');
const sounds = require('./sounds.json');

// Suono riprodotto quando dici solo "Alexa, apri suoni di tokyo"
const DEFAULT_SOUND = 'famima';

// Gli URL nel markup SSML devono avere le & scritte come &amp;
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function audioTag(key) {
  return `<audio src="${escapeXml(sounds[key].url)}"/>`;
}

// Legge l'id del suono scelto dallo slot (es. "famima", "yamanote")
function getSoundKey(handlerInput) {
  const slot = Alexa.getSlot(handlerInput.requestEnvelope, 'sound');
  const authorities =
    slot && slot.resolutions && slot.resolutions.resolutionsPerAuthority;
  const match =
    authorities && authorities.find((a) => a.status.code === 'ER_SUCCESS_MATCH');
  const id = match && match.values[0].value.id;
  return id && sounds[id] ? id : null;
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(audioTag(DEFAULT_SOUND))
      .withShouldEndSession(true)
      .getResponse();
  },
};

const PlaySoundIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlaySoundIntent'
    );
  },
  handle(handlerInput) {
    const key = getSoundKey(handlerInput);
    if (!key) {
      const names = Object.values(sounds).map((s) => s.label).join(', ');
      return handlerInput.responseBuilder
        .speak(`Non conosco questo suono. Puoi scegliere tra: ${names}.`)
        .reprompt('Quale suono vuoi ascoltare?')
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak(audioTag(key))
      .withShouldEndSession(true)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const names = Object.values(sounds).map((s) => s.label).join(', ');
    return handlerInput.responseBuilder
      .speak(`Puoi dire: riproduci, seguito dal nome del suono. Suoni disponibili: ${names}.`)
      .reprompt('Quale suono vuoi ascoltare?')
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      ['AMAZON.CancelIntent', 'AMAZON.StopIntent', 'AMAZON.NavigateHomeIntent'].includes(
        Alexa.getIntentName(handlerInput.requestEnvelope)
      )
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Non ho capito. Dì per esempio: riproduci famima.')
      .reprompt('Quale suono vuoi ascoltare?')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('Sessione terminata:', JSON.stringify(handlerInput.requestEnvelope.request.reason));
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Errore:', error.stack || error.message);
    return handlerInput.responseBuilder
      .speak('Si è verificato un problema. Riprova tra poco.')
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    PlaySoundIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
