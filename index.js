/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Alexa Fact Skill - Sample for Beginners
//

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const wait = require('./wait').default;
const variance = require('./variance').default;
const proximity = require('./proximity.js').default;
const quality = require('./quality').default;
const outages = require('./outages').default;
const updateUser = require('./updateUser').default;

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log('AHHH', request.type, request.intent);
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && (request.intent.name === 'FindNearMeA'
        || request.intent.name === 'GetMCDInfo'
        || request.intent.name === 'ProductOutage'
        || request.intent.name === 'GeneralProductOutage'
        || request.intent.name === 'ProductQuality'
        || request.intent.name === 'productVariance'
        || request.intent.name === 'waitTime'
        || request.intent.name === 'IceCreamMeme'
        || request.intent.name === 'updateUser'));
  },
  async handle(handlerInput) {
    console.log(JSON.stringify(handlerInput, null, 2));
    const request = handlerInput.requestEnvelope.request;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let speakOutput = 'hello there';

    if (request.intent.name === 'waitTime') {
      speakOutput = await wait({
        item: request.intent.slots.item.value,
        waitType: request.intent.slots.waitType.value
      });
    }
    
    if (request.intent.name === 'productVariance') {
      speakOutput = await variance({
        itemType: request.intent.slots.itemType.value,
      });
    }
    
    if (request.intent.name === 'FindNearMeA') {
      speakOutput = await proximity();
    }
    
    if (request.intent.name === 'ProductQuality') {
      speakOutput = await quality({
        MenuItem: request.intent.slots.MenuItem.value,
        QualityItem: request.intent.slots.QualityItem.value,
      });
    }
    
    if (request.intent.name === 'ProductOutage' || request.intent.name === 'GeneralProductOutage') {
      if (request.intent.name === 'GeneralProductOutage')
        speakOutput = await outages({item: ''});
      else
        speakOutput = await outages({
            item: request.intent.slots.item.value
          });
    }
    
    if (request.intent.name === 'IceCreamMeme') {
      const memes = [
        'Only Area 51 has a working machine',
        'So the employees can laugh at you when ordering ice cream',
        'Only the ice cream machines in Narnia work.'
      ]
      const memeIndex = Math.floor(Math.random() * 2);
      speakOutput = memes[memeIndex];
    }
    
    if (request.intent.name === 'updateUser') {
      speakOutput = await updateUser({
        Location: request.intent.slots.Location.value
      });
    }
    
    console.log(`saying ${speakOutput}`)

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      // .withSimpleCard(requestAttributes.t('SKILL_NAME'), 'hello there')
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    console.log(handlerInput.requestEnvelope.request);
    return handlerInput.responseBuilder
      .speak('error')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
