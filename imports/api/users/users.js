import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

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
		Users.update({ _id: Meteor.userId() }, { $set: data });
	},
	add_element_to_field_array: function(userId, fieldName, value) {
		let data = {};
		data[fieldName] = value;

		Users.update({ _id: Meteor.userId() }, { $push: data });
  },
  deleteRestoreUser: function(userId, state) {
    Users.update({ 
      _id: userId 
    }, { 
      $set: { isDeleted: state } 
    });
  }
});

if (Meteor.isServer) {
	Meteor.methods({
	});
}

// export { Users };