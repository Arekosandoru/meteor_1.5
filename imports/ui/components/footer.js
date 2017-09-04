import { ActiveRoute } from 'meteor/zimme:active-route';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './footer.html'; 

Template.App_footer.onRendered(function() {
    this.autorun(() => {
    });
});

Template.App_footer.helpers({
	
});

Template.App_footer.events({
});