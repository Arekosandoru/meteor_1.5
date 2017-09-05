import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'underscore';
import { Examples } from './examples.js';

const insertExample = new ValidatedMethod({
  name: 'examples.insert',
  validate: Examples.schema.validator({ clean: true, filter: false }),
  run(example) {
    return Examples.insert(example);
  },
});

const updateExample = new ValidatedMethod({
  name: 'examples.update',
  validate: Examples.schema.validator({ clean: true, filter: false }),
  run(example) {
    const exampleFound = Examples.findOne(example._id);

    if (!exampleFound.editableBy(this.userId)) {
      throw new Meteor.Error(
        'example.update.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Example.update(example._id, { $set: example });
  },
});

const removeExample = new ValidatedMethod({
  name: 'examples.remove',
  validate: Examples.schema.validator({ clean: true, filter: false }),
  run({ exampleId }) {
    const example = Examples.findOne(exampleId);

    if (!example.editableBy(this.userId)) {
      throw new Meteor.Error(
        'example.remove.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Examples.remove(exampleId);
  },
});

const CURRENT_METHODS = _.pluck([
  insertExample,
  updateExample,
  removeExample,
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

export { insertExample, updateExample, removeExample };
