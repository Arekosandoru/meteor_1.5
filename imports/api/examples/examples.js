import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class ExamplesCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    const result = super.insert(ourDoc, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  remove(selector) {
    const result = super.remove(selector);
    //We don't like remove data.
    return false;
  }
}

const Examples = new ExamplesCollection('Examples');

Examples.allow({
  insert: () => true,
  update: () => true,
  remove: () => false,
});

Examples.schema = new SimpleSchema({
  _id: { 
		type: String
	},
  createdBy: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  isDeleted: {
		type: Boolean,
		defaultValue: false
	}
});

Examples.attachSchema(Examples.schema);


Examples.methods({
  create_example: function(param) {
    const user = Meteor.user();
		if (user) {
      if (param) {
        const example = {
          createdBy: user._id,
          createdAt: new Date(),
        };
        return Examples.insert(example);  
      }
		} else {
			throw new Meteor.Error(500, 'You are not authorized to add Examples.');
		}       
	},
	update_example_field: function(exampleId, fieldName, fieldValue) {
		let data = {};
		data[fieldName] = fieldValue;

		Examples.update({ _id: exampleId }, { $set: data });
	},
	add_element_to_field_array: function(exampleId, fieldName, value) {
		let data = {};
		data[fieldName] = value;

		Examples.update({ _id: exampleId }, { $push: data });
  },
  deleteRestoreExample: function(exampleId, state) {
    Examples.update({ 
      _id: exampleId 
    }, { 
      $set: { isDeleted: state } 
    });
  }
});

if (Meteor.isServer) {
	Meteor.methods({
		
	});
}

export { Examples };
