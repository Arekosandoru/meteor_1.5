import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SSR } from 'meteor/meteorhacks:ssr';
import { TAPi18n } from 'meteor/tap:i18n';

//import { Invitations } from '/imports/api/invitations/invitations.js';

// Users = Meteor.users;
export const Users = Meteor.users;

Users.allow({
  insert: function(userId, doc) {
      return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
      return true;
  },
  remove: function(userId, doc) {
      return false;
  }
});

Users.methods({
	update_user_field: function(userId, fieldName, fieldValue) {
		let data = {};
		data[fieldName] = fieldValue;
		Users.update({ _id: userId }, { $set: data });
	},
	add_element_to_field_array: function(userId, fieldName, value) {
		let data = {};
		data[fieldName] = value;

		Users.update({ _id: userId }, { $push: data });
  },
  remove_element_from_field_array: function(userId, fieldName, value) {
		let data = {};
		data[fieldName] = value;

		Users.update({ _id: userId }, { $pull: data });
  },
  deleteRestoreUser: function(userId, state) {
    Users.update({ 
      _id: userId 
    }, { 
      $set: { isDeleted: state } 
    });
  },
  add_update_location: function(locationId) {
    const userId = Meteor.userId();
    const user = Users.findOne({ _id: userId });

    if (user) {
      const newLocation = {
        _id: locationId,
        isDeleted: false
      };

      if (user.profile && user.profile.locations && user.profile.locations.length > 0) {
        const locationIndex = user.profile.locations.length - 1;

        let setDeleted = {};
        setDeleted['profile.locations.' + locationIndex + '.isDeleted'] = true;

        Users.update({ _id: userId }, { $set: setDeleted });
      }

      Users.update({
        _id: userId
      }, {
        $push: {
          'profile.locations': newLocation
        }
      });
    } else {
      //console.log('User not found');
    }
  },
});

if (Meteor.isServer) {
	Meteor.methods({
    changeUserPasswordById: function(newPassword, newPasswordAgain) {
      const userId = this.userId;
      const user = Users.findOne({ _id: userId });

      if (newPassword.length >= 6 && newPasswordAgain.length >= 6) {
        if (newPassword !== newPasswordAgain) {
          throw new Meteor.Error(500, TAPi18n.__('text.passwordsDoNotMatch', {}, user.profile.lang));      
        }
      } else {
        throw new Meteor.Error(500, TAPi18n.__('text.invalidPassword', {}, user.profile.lang));
      }
        
      Accounts.setPassword(userId, newPassword, { logout: false });
    },
    updateUserEmail: function(newEmail) {
      const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/;
      const userId = this.userId;
      const user = Users.findOne({ _id: userId }); 

      if (!emailRegex.test(newEmail)) {
        throw new Meteor.Error(500, TAPi18n.__('text.invalidEmail', {}, user.profile.lang));
      }

      Users.update({
        _id: userId
      }, {
        $set: {
          'emails.0.address': newEmail
        }
      });
    },
    checkUserPassword: function(password) {
      const userId = this.userId;

      if (userId) {
        const user = Users.findOne({ _id: userId });

        if (user) {
          const passwordData = { password: password, algorithm: 'sha-256' };
          const result = Accounts._checkPassword(user, password);

          return result.error == null;
        } else {
          throw new Meteor.Error(500, 'User not found.');
        }
      }

      return false;
    },
    registerUser: function(email, password) {
      const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/;
      const isValidEmail = emailRegex.test(email);

      if (!isValidEmail) {
        throw new Meteor.Error(500, 'Invalid Email');
      } else if (password.length < 6) {
        throw new Meteor.Error(500, 'Password must be at least 6 chars long.');
      }

      Accounts.createUser({
        email: email,
        password: password
      });
    },
    UsersIsSubscribed() {
      const userId = this.userId;
      const user = Users.findOne(userId);
      if (user) {
        return !!user.profile.isSubscribed;
      }
      return false;
    },
    UsersIsSubscribedUsersPremium() {
      const userId = this.userId;
      const user = Users.findOne(userId);
      if (user) {
        return !!(user.profile.isSubscribed && user.profile.plan === "1-personal-monthly-plan");
      }
      return false;
    },
    UsersIsSubscribedOrganizationPremium(gymId) {
      const gym = Organizations.findOne(gymId);
      if (gym) {
        const user = Users.findOne(gym.createdBy);
        if (user) {
          return !!(user.profile.isSubscribed && user.profile.plan === "2-monthly-plan");
        }  
      }
      return false;
    },
    updateUserFirstLastName(firstName, lastName) {
      const userId = this.userId;

      if (userId) {
        Users.update({
          _id: userId
        }, {
          $set: {
            'profile.firstName': firstName,
            'profile.lastName': lastName
          }
        });
      } else {
        throw new Meteor.Error(500, 'User not found.');
      }
    }
	});
}

//EMAIL VALIDATOR
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function generatePassword() {
  var randomstring = Math.random().toString(36).slice(-8);
  return randomstring;
}