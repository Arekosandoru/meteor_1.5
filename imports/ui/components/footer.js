import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './footer.html'; 

Template.App_footer.events({
	'click #lp': function() {
		FlowRouter.go('/lp');
	}
});