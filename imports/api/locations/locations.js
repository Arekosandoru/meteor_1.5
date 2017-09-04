import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class LocationsCollection extends Mongo.Collection {
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

const Locations = new LocationsCollection('Locations');

Locations.allow({
  insert: () => true,
  update: () => true,
  remove: () => false,
});

// Locations.deny({
//   insert: () => true,
//   update: () => true,
//   remove: () => true,
// });

Locations.schema = new SimpleSchema({
  _id: { 
		type: String
	},
  zipCode: {
		type: String,
		optional: true,
		defaultValue: null
  },
  address: {
		type: String,
    optional: true
	},
	city: {
		type: String,
		optional: true,
		defaultValue: null
	},
	state: {
		type: String,
		optional: true,
		defaultValue: null
	},
	country: {
		type: String,
		optional: true
	},
	description: {
		type: String,
		optional: true
	},
	hundredsBlockRange: {
		type: String,
		optional: true
	},
	intersection: {
		type: String,
		optional: true
	},
	latitude: {
		type: Number,
		decimal: true,
		optional: true
	},
	longitude: {
		type: Number,
		decimal: true,
		optional: true
	},
	googleRawData: {
		type: Object,
		optional: true,
		blackbox: true
	},
  createdBy: {
    type: String,
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

Locations.attachSchema(Locations.schema);

Locations.methods({
  create_location: function(churchId, location, type, createdBy, description) {
    const user = Meteor.user();

		if (user) {
      if (churchId && location && type && createdBy) {
        const location = {
          churchId: churchId,
          location: location,
          type: type,
          description: description || null,
          createdBy: user._id,
          createdAt: new Date()
        };
        return Locations.insert(location);  
      }
		} else {
			throw new Meteor.Error(500, 'You are not authorized to add Locations.');
		}       
	},
	create_location_from_google_places_data: function(data) {
		const createdBy = Meteor.userId();
		let zipCode,
    		city,
    		state,
				country;

		// Get all data from the "address components" array
    	data.address_components.forEach(function(component) {
    		if (component.types[0] === 'postal_code') {
    			zipCode = component.long_name;
    		} else if (component.types[0] === 'locality') {
    			city = component.long_name;
    		} else if (component.types[0] === 'administrative_area_level_1') {
    			state = component.long_name;
    		} else if (component.types[0] === 'administrative_area_level_2') {
    			country = component.long_name;
    		}
    	});

    const address = data.formatted_address,
					googleRawData = data;

		let latitude,
				longitude;

		if (typeof data.geometry.location.lat === 'function' && typeof data.geometry.location.lng === 'function') {
			latitude = data.geometry.location.lat(),
			longitude = data.geometry.location.lng();
		} else {
			latitude = data.geometry.location.lat,
			longitude = data.geometry.location.lng;
		}

		const location = {
			address,
			zipCode,
			city,
			state,
			country,
			latitude,
			longitude,
			googleRawData,
			createdBy
		};

		return Locations.insert(location);
	},
	update_location_from_google_places_data: function(locationId, data) {
		let zipCode,
    		city,
    		state,
    		country;

		// Get all data from the "address components" array
    	data.address_components.forEach(function(component) {
    		if (component.types[0] === 'postal_code') {
    			zipCode = component.long_name;
    		} else if (component.types[0] === 'locality') {
    			city = component.long_name;
    		} else if (component.types[0] === 'administrative_area_level_1') {
    			state = component.long_name;
    		} else if (component.types[0] === 'administrative_area_level_2') {
    			country = component.long_name;
    		}
    	});

    	const address = data.formatted_address,
			googleRawData = data;

		let latitude,
			longitude;

		if (typeof data.geometry.location.lat === 'function' && typeof data.geometry.location.lng === 'function') {
			latitude = data.geometry.location.lat(),
			longitude = data.geometry.location.lng();
		} else {
			latitude = data.geometry.location.lat,
			longitude = data.geometry.location.lng;
		}

	    const location = {
				address,
				zipCode,
				city,
				state,
				country,
				latitude,
				longitude,
				googleRawData
	    };

    	Locations.update({ _id: locationId }, { $set: location });
	},
	update_location_field: function(locationId, fieldName, fieldValue) {
		let data = {};
		data[fieldName] = fieldValue;

		Locations.update({ _id: locationId }, { $set: data });
	},
	// add_element_to_field_array: function(locationId, fieldName, value) {
	// 	let data = {};
	// 	data[fieldName] = value;

	// 	Locations.update({ _id: locationId }, { $push: data });
  // },
  deleteRestoreLocations: function(locationId, state) {
    Locations.update({ 
      _id: locationId 
    }, { 
      $set: { isDeleted: state } 
    });
  },
});

if (Meteor.isServer) {
	Meteor.methods({
		
	});
}

export { Locations };
