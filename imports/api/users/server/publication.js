import { Meteor } from 'meteor/meteor';
import { Users } from '/imports/api/users/users';
import { AccountsServer } from 'meteor/accounts-base'

Meteor.publish('users.all', function() {
  return Users.find();
});

Meteor.publish('users.one', function(userId) {
  return Users.findOne(userId);
});

Accounts.onCreateUser(function(options, user) {  
  user.profile = {
      name: '',
      profileImage: '/images/default-avatar.png',
  };
  return user;
});