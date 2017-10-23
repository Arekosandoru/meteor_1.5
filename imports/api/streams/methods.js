import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'underscore';
import { Streams } from './streams.js';

const insertStream = new ValidatedMethod({
  name: 'streams.insert',
  validate: Streams.schema.validator({ clean: true, filter: false }),
  run(stream) {
    return Streams.insert(stream);
  },
});

const updateStream = new ValidatedMethod({
  name: 'streams.update',
  validate: Streams.schema.validator({ clean: true, filter: false }),
  run(stream) {
    const streamFound = Streams.findOne(stream._id);

    if (!streamFound.editableBy(this.userId)) {
      throw new Meteor.Error(
        'stream.update.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Stream.update(stream._id, { $set: stream });
  },
});

const removeStream = new ValidatedMethod({
  name: 'streams.remove',
  validate: Streams.schema.validator({ clean: true, filter: false }),
  run({ streamId }) {
    const stream = Streams.findOne(streamId);

    if (!stream.editableBy(this.userId)) {
      throw new Meteor.Error(
        'stream.remove.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Streams.remove(streamId);
  },
});

const CURRENT_METHODS = _.pluck([
  insertStream,
  updateStream,
  removeStream,
], 'name');

if (Meteor.isServer) {
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(CURRENT_METHODS, name);
    },

    connectionId() {
      return true;
    },
  }, 5, 1000);
}

export { insertStream, updateStream, removeStream };
