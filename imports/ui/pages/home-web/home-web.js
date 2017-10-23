import './home-web.html';
import './home-web.less';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session'
import { Template } from 'meteor/templating';
import { TemplateVar } from 'meteor/frozeman:template-var';
import { moment } from 'meteor/momentjs:moment';
import { underscore } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';

import { Users } from '/imports/api/users/users.js';




Template.home_web.onCreated(function() {

});


Template.home_web.onRendered(function() {
 
});


Template.home_web.helpers({

});

Template.home_web.events({
  
});

function getLang() {
	const allowedLan = ['en-US', 'ru-RU'];
	const language = navigator.languages && navigator.languages[0] ||
		navigator.language ||
		navigator.browserLanguage ||
		navigator.userLanguage ||
		'en-US';

	let allowed = _.find(allowedLan, function(lan){
		return lan === language;
	});

	if (allowed) {
		return language;
	} else {
		return 'en-US';
	}
}


