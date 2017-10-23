import './login.html';
import './login.less';

Template.login.onRendered(function() {
	//Language
	if (Meteor.user() && Meteor.user().profile.lang) {
		TAPi18n.setLanguage(Meteor.user().profile.lang);
		$("#" + Meteor.user().profile.lang).attr('checked', 'checked');
	} else {
		const lan = getLang();
		TAPi18n.setLanguage(lan);
	}
});

Template.login.events({
	'click #login_in_btn'(ev, tmpl) {
		ev.preventDefault();
		
		const email = tmpl.find('#email_field').value,
			password = tmpl.find('#password_field').value;

		const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/;

      	if (!emailRegex.test(email)) {
        	sAlert.error(TAPi18n.__('text.invalidEmail'));
        	return;
      	}

      	if (password.length < 6) {
      		sAlert.error(TAPi18n.__('text.invalidPassword'));
      		return;
      	}

		Meteor.loginWithPassword(email, password, function(err) {
			if (err) {
				sAlert.error(TAPi18n.__('text.wrongCredentials'));
			} else {
				FlowRouter.go('/');
			}
		});
	},
	'click #login_with_facebook'() {
		Meteor.signInWithFacebook({ }, signInCallback);
	},
	'click #login_with_vk'() {
		Meteor.signInWithVk({ }, signInCallback);
	}
});

function signInCallback(err, mergetUserId) {
    if (err) {
        // Process Error
    } else {
    	FlowRouter.go('/');
    }

    if (mergetUserId) {
        //console.log(mergetUserId, 'merged with', Meteor.userId());
    }
}

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