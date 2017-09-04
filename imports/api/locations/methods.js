import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'underscore';
import { Locations } from './locations.js';

const insertLocation = new ValidatedMethod({
  name: 'locations.insert',
  validate: Locations.schema.validator({ clean: true, filter: false }),
  run(location) {
    return Locations.insert(location);
  },
});

const updateLocation = new ValidatedMethod({
  name: 'locations.update',
  validate: Locations.schema.validator({ clean: true, filter: false }),
  run(location) {
    const locationFound = Locations.findOne(location._id);

    if (!locationFound.editableBy(this.userId)) {
      throw new Meteor.Error(
        'location.update.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Location.update(location._id, { $set: location });
  },
});

const removeLocation = new ValidatedMethod({
  name: 'locations.remove',
  validate: Locations.schema.validator({ clean: true, filter: false }),
  run({ locationId }) {
    const location = Locations.findOne(locationId);

    if (!location.editableBy(this.userId)) {
      throw new Meteor.Error(
        'location.remove.accessDenied',
        'You don\'t have permission to edit this list.'
      );
    }

    Locations.remove(locationId);
  },
});

const LOCATION_METHODS = _.pluck([
  insertLocation,
  updateLocation,
  removeLocation,
], 'name');

if (Meteor.isServer) {
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(LOCATION_METHODS, name);
    },

    connectionId() {
      return true;
    },
  }, 5, 1000);
}

export { insertLocation, updateLocation, removeLocation };
