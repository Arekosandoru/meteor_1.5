import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'underscore';
import { Users } from './users.js';

const insertUser = new ValidatedMethod({
  name: 'users.insert',
  validate: Users.schema.validator({ clean: true, filter: false }),
  run(user) {
    return Users.insert(user);
  },
});

const updateUser = new ValidatedMethod({
  name: 'users.update',
  validate: Users.schema.validator({ clean: true, filter: false }),
  run(user) {
    const userFound = Users.findOne(user._id);

    if (!userFound.editableBy(this.userId)) {
      throw new Meteor.Error(
        'user.update.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    User.update(user._id, { $set: user });
  },
});

const removeUser = new ValidatedMethod({
  name: 'users.remove',
  validate: Users.schema.validator({ clean: true, filter: false }),
  run({ userId }) {
    const user = Users.findOne(userId);

    if (!user.editableBy(this.userId)) {
      throw new Meteor.Error(
        'user.remove.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Users.remove(userId);
  },
});

const USERS_METHODS = _.pluck([
  insertUser,
  updateUser,
  removeUser,
], 'name');

if (Meteor.isServer) {
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(USERS_METHODS, name);
    },

    connectionId() {
      return true;
    },
  }, 5, 1000);
}

export { insertUser, updateUser, removeUser };
