import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

import '/imports/ui/layouts/app-body.js';
import '/imports/ui/pages/app-not-found.js';
import '/imports/ui/pages/example/example.js';


FlowRouter.route('/', {
  name: 'About',
  action() {
    BlazeLayout.render('App_body', { main: 'about' });
  },
  subscriptions: function(params, queryParams) {
    //this.register('examples.all', Meteor.subscribe('examples.all'));
  },
});


FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/signin',
});

AccountsTemplates.configureRoute('signUp', {
  name: 'join',
  path: '/join',
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});
