import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';
import { Notifications } from '../notifications/notifications.js';

class StreamsCollection extends Mongo.Collection {
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

const Streams = new StreamsCollection('Streams');

Streams.allow({
  insert: () => true,
  update: () => true,
  remove: () => false,
});

Streams.schema = new SimpleSchema({
  _id: { 
		type: String
  },
  dazl_id: { 
		type: String,
    optional: true
  },
  dazl_stream_type: { 
		type: String,
    allowedValues: ['stream']
  },
  presenter_user_id: { 
		type: String,
    optional: true
  },
  presenter_gym_id: { 
    type: String,
    optional: true
  },
  event_planned_start_timestamp: { 
		type: Date,
    optional: true
  },
  event_planned_duration_seconds: { 
		type: Number,
    optional: true
  },
  event_actual_start_time: { 
		type: Date,
    optional: true
  },
  event_actual_end_time: { 
		type: Date,
    optional: true
  },
  event_actual_duration: { 
		type: Number,
    optional: true
  },
  event_selected_camera: {
    type: String,
    optional: true
  },
  title: { 
    type: String,
    optional: true
  },
  description: { 
		type: String,
    optional: true
  },
  status: { 
    type: String,
    allowedValues: ['pending', 'live', 'recorded','canceled']
  },
  preview: { 
    type: String,
    optional: true
  },
  previews: {
    type: [Object],
    optional: true
  },
    'previews.$.url': { 
      type: String, 
      optional: true
    },
  viewers_live: { 
		type: [Object],
    optional: true
  },
    'viewers_live.$.userId': { 
      type: String, 
      optional: true
    },
  viewers_live_count: { 
    type: Number,
    optional: true,
    defaultValue: 0
  },
  viewers_total_count: { 
    type: Number,
    optional: true,
    defaultValue: 0
  },
  event_attending_total_count: { 
    type: Number,
    optional: true,
    defaultValue: 0
  },
  likes: { 
		type: [Object],
    optional: true
  },
    'likes.$.userId': { 
      type: String, 
      optional: true
    },
  likes_count: { 
    type: Number,
    optional: true,
    defaultValue: 0
  },
  dislikes: { 
		type: Number,
    optional: true
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

Streams.attachSchema(Streams.schema);

Streams.methods({
  create_stream: function(title, description, tags, status, dazl_id, streamType) {
    const user = Meteor.user();      
		if (user) {
      if (!title) {
        console.log('Title is required');
        return;
      }

      if (!description) {
        console.log('Description is required');
        return;
      }

      if (!tags) {
        console.log('At least one tag is required');
        return;
      }

      const stream = {
        dazl_id,
        title,
        description,
        tags,
        status,
        presenter_user_id: user._id,
        presenter_gym_id: streamAsGymId || null,
        createdBy: user._id,
        createdAt: new Date(),
      };
      return Streams.insert(stream);
		} else {
			throw new Meteor.Error(500, 'You are not authorized to add Streams.');
		}       
  },
	update_stream_field: function(streamId, fieldName, fieldValue) {
		let data = {};
		data[fieldName] = fieldValue;

		Streams.update({ _id: streamId }, { $set: data });
	},
	add_element_to_field_array: function(streamId, fieldName, value) {
		let data = {};
		data[fieldName] = value;

		Streams.update({ _id: streamId }, { $push: data });
  },
  remove_element_to_field_array: function(streamId, fieldName, value) {
		let data = {};
    data[fieldName] = value;

		Streams.update({ _id: streamId }, { $pull: data });
  },
  deleteRestoreStream: function(streamId, state) {
    Streams.update({ 
      _id: streamId 
    }, { 
      $set: { isDeleted: state } 
    });
  },
  increaseTotalViewsCount: function(streamId) {
		Streams.update({ 
      _id: streamId
     }, { 
      $inc: {
        'viewers_total_count': 1
      }
     });
  },
  increaseTotalLikeCount: function(streamId) {
    Streams.update({ 
      _id: streamId
     }, { 
      $inc: {
        'likes_count': 1
      }
     });
  },
  decreaseTotalLikeCount: function(streamId) {
    Streams.update({ 
      _id: streamId
     }, { 
      $inc: {
        'likes_count': -1
      }
     });
  }
});

if (Meteor.isServer) {
	Meteor.methods({
		checkForMoreUserStreams(userId, currentCount) {
      const streamsCount = Streams.find({
        isDeleted: false,
        presenter_user_id: userId,
        presenter_gym_id: null,
        status: {
          "$in": ["live", "recorded"]
        }
      }).count();

      if (streamsCount <= currentCount) {
        return false;
      } else {
        return true;
      }
    },
    checkForMoreLiveStream(currentCount) {
      const streamsCount = Streams.find({
        isDeleted: false,
        status: 'live'
      }).count();

      if (streamsCount <= currentCount) {
        return false;
      } else {
        return true;
      }
    },
    checkForMoreRecordings(currentCount) {
      const streamsCount = Streams.find({
        isDeleted: false,
        status: 'recorded'
      }).count();

      if (streamsCount <= currentCount) {
        return false;
      } else {
        return true;
      }
    },
    check_stream_for_push(streamId){
      var stream = Streams.findOne(streamId);
      if (stream) {
          if (stream.isDeleted) {
              return null; 
          } else if (stream.status == "live") {
              return '/viewlivestreams/' + streamId;
          } else if (stream.status == "recorded") {
              return '/viewrecordedstreams/' + streamId;
          } else { 
             return null; 
          }      
      }
    },
    check_is_liked(streamId) {
      const userId = this.userId;
      const stream = Streams.findOne(streamId);

      if (stream && stream.likes && stream.likes.length > 0) {
        const alreadyLiked = _.find(stream.likes, function(like){
          return like.userId === userId;
        });

        return !!alreadyLiked;
      }

      return false;
    },
    StreamsAddViewer: function(streamId) {
      const userId = Meteor.userId();
      //add user as live_viewer
      const user_viewer = {
          userId: userId
      }

      //check if already added
      const alreadyAdded = Streams.findOne({
        _id: streamId,
        'viewers_live.userId': userId
      });

      if (!alreadyAdded) {
        let data = {
          viewers_live: user_viewer
        };

        Streams.update({ _id: streamId }, { $push: data });

        Streams.update({ 
          _id: streamId
        }, { 
          $inc: {
            'viewers_live_count': 1
          }
        });  
      }
    },
    StreamsRemoveViewer: function(streamId) {
      const userId = Meteor.userId();
      //check if already added
      const alreadyAdded = Streams.findOne({
        _id: streamId,
        'viewers_live.userId': userId
      });

      if (alreadyAdded) {  
        const user_viewer = {
            userId: userId
        }

        let data = {
          viewers_live: user_viewer
        };

        Streams.update({ _id: streamId }, { $pull: data });

        Streams.update({ 
          _id: streamId
        }, { 
          $inc: {
            'viewers_live_count': -1
          }
        });  
      }
    },
	});
}

export { Streams };
