import { ActiveRoute } from 'meteor/zimme:active-route';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Users } from '../../api/users/users.js';

import './nav-header.html';

Template.App_navHeader.onRendered(function() {
    if (!Meteor.userId()) {
        FlowRouter.go('/signin');
    }

    this.autorun(() => {
    });
});

Template.App_navHeader.helpers({

});

Template.App_navHeader.events({
});