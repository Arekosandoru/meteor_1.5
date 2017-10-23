import { Meteor } from 'meteor/meteor';
import { Locations } from '/imports/api/locations/locations';

/*Meteor.publish('locations.all', function() {
  return Locations.find();
});*/

Meteor.publish('locationsById', function(locId) {
  return Locations.find(locId);
});