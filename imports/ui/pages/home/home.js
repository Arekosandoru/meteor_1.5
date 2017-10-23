import './home.html';
import '../home-web/home-web.js';

//import '../home-mobile/home-mobile-material.js';

import { Template } from 'meteor/templating';

/*Template.home.onRendered(function() {});*/

Template.home.helpers({
	is_cordova() {
		return (Meteor.isCordova || Meteor.settings.public.mobileDev);
  	}
});

/*Template.home.events({});*/
