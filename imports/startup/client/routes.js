import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';

import { Users } from '/imports/api/users/users.js';

import '/imports/ui/layouts/app-body.js';

import '/imports/ui/pages/login-register/login/login.js';
import '/imports/ui/pages/login-register/register/register.js';
// import '/imports/ui/pages/login-register-mobile/login-mobile/login-mobile.js';
// import '/imports/ui/pages/login-register-mobile/register-mobile/register-mobile.js';

import '/imports/ui/pages/app-not-found.js';
import '/imports/ui/pages/home/home.js';
//import '/imports/ui/pages/home-mobile/home-mobile-material.js';

//import '/imports/ui/pages/streams/streams.js';
//import '/imports/ui/pages/streams/streams-material.js';

FlowRouter.route('/', {
  name: 'Home',
  action() {
    const userId = Meteor.userId();

    if (Meteor.isCordova) {
      if (userId) {
        BlazeLayout.render('App_body', { main: 'home' });
      } else {
        FlowRouter.go('/signin');
      }
    } else {
        BlazeLayout.render('App_body', { main: 'home' });
    }
  },
  subscriptions: function(params, queryParams) {
    // ############# Streams
    // top live videos and upcoming events
      
    //this.register('streams.latest.paging.live', Meteor.subscribe('streams.latest.paging.live'));
    //this.register('streams.latest.paging.recorded', Meteor.subscribe('streams.latest.paging.recorded'));
    //this.register('tags.all', TAPi18n.subscribe('tags.all'));
    //this.register('notifications.opened.withUsersAndStreamsStatus', Meteor.subscribe('notifications.opened.withUsersAndStreamsStatus'));
    
    // me
    this.register('users.me', Meteor.subscribe('users.me'));

    if (Meteor.isCordova) {  
      //this.register('streams.events.for.user.mobile', Meteor.subscribe('streams.events.for.user.mobile', Meteor.userId()));
    }
  }
});

FlowRouter.route('/streams', {
  name: 'Streams',
  action() {
    const userId = Meteor.userId();

    if (!userId) {
      FlowRouter.go('/');
    } else {
      BlazeLayout.render('App_body', { main: 'streams' });
    };
  },
  subscriptions: function(params, queryParams) {
    // me
    this.register('users.me', Meteor.subscribe('users.me'));
  }
});


FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

FlowRouter.route('/signin', {
  name: 'Sign In',
  action: function() {
    if (!Meteor.userId()) {
      if (Meteor.isCordova) {
        BlazeLayout.render('App_body', {
          //main: 'login_mobile'
          main: 'login'
        });
      } else {
        BlazeLayout.render('App_body', {
          main: 'login'
        });
      }
    } else {
      FlowRouter.go('/');
    }
  }
});

FlowRouter.route('/register', {
  name: 'Register',
  action: function() {
    if (!Meteor.userId()) {
      if (Meteor.isCordova) {
        BlazeLayout.render('App_body', {
          //main: 'register_mobile'
          main: 'register'
        });
      } else {
        BlazeLayout.render('App_body', {
          main: 'register'
        });
      }
    } else {
      FlowRouter.go('/');
    }
  }
});

// AccountsTemplates.configureRoute('signIn', {
//   name: 'signin',
//   path: '/signin',
// });

// AccountsTemplates.configureRoute('signUp', {
//   name: 'join',
//   path: '/join',
// });

// AccountsTemplates.configureRoute('forgotPwd');

// AccountsTemplates.configureRoute('resetPwd', {
//   name: 'resetPwd',
//   path: '/reset-password',
// });
