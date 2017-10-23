import { Meteor } from 'meteor/meteor';
import { Users } from '/imports/api/users/users.js';
import { Locations } from '/imports/api/locations/locations.js';
import { AccountsServer } from 'meteor/accounts-base'
import { underscore } from 'meteor/underscore';
import { publishComposite } from 'meteor/reywood:publish-composite';

/*Meteor.publish('users.all', function() {
  return Users.find();
});*/

Meteor.publish('users.one', function(userId) {
  return Users.find(userId);
});

Meteor.publish('users.me', function() {
  const userId = this.userId;

  return Users.find(
    {
      _id: userId
    },
    {
      fields: {
          _id: 1,
          profile: 1,
          msgEmail: 1,
          streamsNtf: 1,
          gymEmails: 1,
          following: 1,
          invitedUsers: 1,
          itemsClaimed: 1
      }
    }
  );
});

Meteor.publishComposite('users.me.withLocation', function() {

  const userId = this.userId;

  
  return {
        find() {
          return Users.find(
            {
              _id: userId
            },
            {
              fields: {
                  _id: 1,
                  profile: 1,
                  tags: 1,
                  hideLoc: 1,
                  hideGyms: 1,
                  hideStreams: 1,
                  msgEmail: 1,
                  streamsNtf: 1,
                  gymEmails: 1,
                  following: 1,
                  myTrainees: 1,
                  myCoaches: 1
              }
            }
          );
        },
        children: [
            {
              find(user) {
                if(user.profile && user.profile.locations && user.profile.locations.length > 0) {

                  let locations = [];
                      user.profile.locations.forEach(function(loc){
                      if (!loc.isDeleted) {
                        locations.push(loc._id);
                      }
                  });
                  
                  if(locations.length > 0) {
                    return Locations.find(
                        {
                            _id: {
                              $in: locations
                            }
                        },
                        {
                            fields: {
                                _id: 1,
                                address: 1,
                                isDeleted: 1
                            }
                        }
                    );                    
                  }
                }                  
              }
            }
        ]
    }
});

Meteor.publish('users.followed.users', function(id, num) {
  const userId = id || this.userId;
  const user = Users.findOne(userId);
  const limitNum = num || 8;

  if (user && user.following && user.following.length > 0) {
    let followedUsers = _.filter(user.following, function(user){
      return user.isActive;
    });
    followedUsers = _.pluck(followedUsers, 'userId');
    return Users.find({
      _id: {
        $in: followedUsers
      }
    }, {
      limit: limitNum,
      fields: {
          _id: 1,
          profile: 1,
          tags: 1
      }
    });
  }
});

Meteor.publish('users.followers.users', function(id, num) {
  const userId = id || this.userId;
  const user = Users.findOne(userId);
  const limitNum = num || 8;

  if (user && user.followers && user.followers.length > 0) {
    let followersUsers = _.filter(user.followers, function(user){
      return user.isActive;
    });
    followersUsers = _.pluck(followersUsers, 'userId');
    return Users.find({
      _id: {
        $in: followersUsers
      }
    }, {
      limit: limitNum,
      fields: {
          _id: 1,
          profile: 1,
          tags: 1
      }
    });
  }
});

Accounts.onCreateUser(function(options, user) {  
  user.profile = {
      firstName: '',
      lastName: '',
      location: '',
      info: '',
      avatar: '/images/default-avatar.png',
  };

  user.photos = [
    //array of '_id' - as photoId
  ];

  user.friends = [
    //array of '_id' - as userId
  ];

  user.tags = [
    //array of '_id' - as tagId
  ];

  user.followers = [
    //array of '_id' - as userId
  ];

  user.following = [
    //array of '_id' - as userId
  ];

  if (user.services.facebook) {
    user.emails = [{ address: user.services.facebook.email }];

    if (user.services.facebook.name) {
      const name = user.services.facebook.name.split(' ');

      user.profile.firstName = name[0];
      user.profile.lastName = name[1];
    }
  }

  if (user.services.vk) {
    const data = user.services.vk;

    if (data.email) {
      user.emails = [{ address: data.email }];
    }

    if (data.first_name) {
      user.profile.firstName = data.first_name;
    }

    if (data.last_name) {
      user.profile.lastName = data.last_name;
    }
  }

  return user;
});