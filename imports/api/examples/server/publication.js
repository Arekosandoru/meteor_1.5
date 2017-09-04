import { Meteor } from 'meteor/meteor';
import { Examples } from '/imports/api/examples/examples';

Meteor.publish('examples.all', function() {
  return Examples.find();
});

Meteor.publish('examples.one', function(churchId) {
  return Examples.find({
    _id: churchId 
  });
});

