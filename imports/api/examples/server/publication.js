import { Meteor } from 'meteor/meteor';
import { Examples } from '/imports/api/examples/examples';

Meteor.publish('examples.all', function() {
  return Examples.find();
});

Meteor.publish('examples.one', function(paramId) {
  return Examples.find({
    _id: paramId 
  });
});

