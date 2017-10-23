import './register.html';
import './register.less';

import { Users } from '/imports/api/users/users.js';

Template.register.onRendered(function() {
	//Language
	if (Meteor.user() && Meteor.user().profile.lang) {
		TAPi18n.setLanguage(Meteor.user().profile.lang);
		$("#" + Meteor.user().profile.lang).attr('checked', 'checked');
	} else {
		const lan = getLang();
		TAPi18n.setLanguage(lan);
	}
});

Template.register.events({
	'click #register_btn'(ev, tmpl) {
		ev.preventDefault();

		const email = tmpl.find('#email_field').value,
			password = tmpl.find('#password_field').value,
			passwordAgain = tmpl.find('#password_field_again').value;

		if (!email) {
			sAlert.error(TAPi18n.__('text.invalidEmail'));
			return;
		}

		if (password !== passwordAgain) {
			sAlert.error(TAPi18n.__('text.invalidPassword'));
			return;
		}

		//Users.register(email, password);
		Meteor.call('registerUser', email, password, function(err) {
			if (err) {
				sAlert.error(err.reason);
			} else {
				Meteor.loginWithPassword(email, password, function(error) {
					if (error) {
						sAlert.error(error);
					} else {
						FlowRouter.go('/');
					}
				});
			}
		});
	}
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