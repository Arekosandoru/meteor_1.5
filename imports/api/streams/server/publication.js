import { Meteor } from 'meteor/meteor';
import { publishComposite } from 'meteor/reywood:publish-composite';
import { Streams } from '/imports/api/streams/streams.js';
import { Users } from '/imports/api/users/users.js';

Meteor.publishComposite('streams.latest.paging.live', function(params, startParam, numParam) {

	const start = startParam || 0;
    let num = numParam || 4;

	return {
        find() {
            return Streams.find(
                {
                    status: "live",
                    isDeleted: {
                        $ne: true
                    }
                },
                {   
                    sort: {
                        createdAt: -1,
                        viewers_total_count: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                    	_id: 1,
						dazl_id: 1,
						dazl_stream_type: 1,
						presenter_user_id: 1,
                        presenter_gym_id: 1,
						event_actual_start_time: 1,
						title: 1,
						description: 1,
						tags: 1,
						status: 1,
						viewers_total_count: 1,
                        viewers_live_count: 1,
                        likes_count: 1,
						preview: 1,
                        isDeleted: 1,
                        createdAt: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 600000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
						        "profile.lastName" : 1,
						        "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publishComposite('streams.latest.paging.events', function(params, startParam, numParam) {

	const start = startParam || 0;
	const num = numParam || 4;

	return {
        find() {
            return Streams.find(
                {
                    status: "pending",
                    isDeleted: {
                        $ne: true
                    }
                },
                {
                    sort: {
                        event_planned_start_timestamp: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                    	_id: 1,
						dazl_id: 1,
						dazl_stream_type: 1,
						presenter_user_id: 1,
                        presenter_gym_id: 1,
						event_planned_start_timestamp: 1,
						event_planned_duration_seconds: 1,
						title: 1,
						description: 1,
						tags: 1,
						status: 1,
						event_attending_total_count: 1,
						event_planned_start_timestamp: 1,
                        isDeleted: 1,
                        createdAt: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 600000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
						        "profile.lastName" : 1,
						        "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publishComposite('streams.latest.paging.recorded', function(params, startParam, numParam) {

	const start = startParam || 0;
    let num = numParam || 4;

	return {
        find() {
            return Streams.find(
                {
                    status: "recorded",
                    isDeleted: {
                        $ne: true
                    }
                },
                {
                    sort: {
                    	createdAt: -1,
                        viewers_total_count: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                    	_id: 1,
						dazl_id: 1,
						dazl_stream_type: 1,
						presenter_user_id: 1,
                        presenter_gym_id: 1,
						event_actual_start_time: 1,
						event_actual_end_time: 1,
						event_actual_duration: 1,
						title: 1,
						description: 1,
						tags: 1,
						status: 1,
						viewers_total_count: 1,
                        viewers_live_count: 1,
                        likes_count: 1,
						preview: 1,
                        isDeleted: 1,
                        createdAt: 1,
                        createdBy: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 600000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
						        "profile.lastName" : 1,
						        "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publishComposite('streams.search.home.paging.recorded', function(params, startParam, numParam) {

	let userId = this.userId;

	// get this users tags

	const userTags = Users.findOne(
                    {
                        _id: userId
                    },
                    {
                        fields: {
                            tags: 1
	                    }
	                }
				);

    var searchTags = ["YrjE2rE9nJM4Pt2TW","LkfTdf2FTFPutMTer"];
    
	if(userTags && userTags.tags && userTags.tags.length > 0) {
		searchTags = userTags.tags;
	}

    if (params) {
        searchTags = params;
    }

	const start = startParam || 0;
	const num = numParam || 12;

	return {
        find() {
            return Streams.find(
                {
                    status: "recorded",
                    "tags": {
				        "$elemMatch": {
				            "tagId": {
				                "$in": searchTags
				            }
				        }
				    },
                    isDeleted: {
                        $ne: true
                    }
                },
                {
                    sort: {
                    	createdAt: -1,
                        viewers_total_count: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                    	_id: 1,
						dazl_id: 1,
						dazl_stream_type: 1,
						presenter_user_id: 1,
                        presenter_gym_id: 1,
						event_actual_start_time: 1,
						event_actual_end_time: 1,
						event_actual_duration: 1,
						title: 1,
						description: 1,
						tags: 1,
						status: 1,
                        preview: 1,
						viewers_total_count: 1,
                        viewers_live_count: 1,
                        likes_count: 1,
						isDeleted: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 180000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
						        "profile.lastName" : 1,
						        "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publishComposite('streams.search.home.paging.live.recorded', function(params, startParam, numParam) {
    let userId = this.userId;

    // get this users tags

    const userTags = Users.findOne(
                    {
                        _id: userId
                    },
                    {
                        fields: {
                            tags: 1
                        }
                    }
                );

    var searchTags = [];
    
    if(userTags && userTags.tags && userTags.tags.length > 0) {
        searchTags = userTags.tags;
    }

    if (params) {
        searchTags = params;
    }

    //console.log('searchTags ', searchTags);

    const start = startParam || 0;
    const num = numParam || 12;

    return {
        find() {
            return Streams.find(
                {
                    status: {
                        "$in": ["live", "recorded"]
                    },
                    "tags": {
                        "$elemMatch": {
                            "tagId": {
                                "$in": searchTags
                            }
                        }
                    },
                    isDeleted: {
                        $ne: true
                    }
                },
                {
                    sort: {
                        status: 1,
                        createdAt: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                        _id: 1,
                        dazl_id: 1,
                        dazl_stream_type: 1,
                        presenter_user_id: 1,
                        presenter_gym_id: 1,
                        event_actual_start_time: 1,
                        event_actual_end_time: 1,
                        event_actual_duration: 1,
                        title: 1,
                        description: 1,
                        tags: 1,
                        status: 1,
                        preview: 1,
                        viewers_total_count: 1,
                        viewers_live_count: 1,
                        isDeleted: 1,
                        likes_count: 1,
                        createdAt: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 180000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
                                "profile.lastName" : 1,
                                "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publishComposite('streams.search.home.live.recorded', function(startParam, numParam) {


    const start = startParam || 0;
    const num = numParam || 12;

    return {
        find() {
            return Streams.find(
                {
                    status: {
                        "$in": ["live", "recorded"]
                    },
                    isDeleted: {
                        $ne: true
                    }
                },
                {
                    sort: {
                        status: 1,
                        createdAt: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                        _id: 1,
                        dazl_id: 1,
                        dazl_stream_type: 1,
                        presenter_user_id: 1,
                        presenter_gym_id: 1,
                        event_actual_start_time: 1,
                        event_actual_end_time: 1,
                        event_actual_duration: 1,
                        title: 1,
                        description: 1,
                        tags: 1,
                        status: 1,
                        preview: 1,
                        viewers_total_count: 1,
                        viewers_live_count: 1,
                        isDeleted: 1,
                        likes_count: 1,
                        createdAt: 1
                    },
                    disableOplog: true,
                    pollingIntervalMs: 180000
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
                                "profile.lastName" : 1,
                                "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});

Meteor.publish('streams.events.for.user', function(userId, startParam, numParam) {
    const start = startParam || 0;
    const num = numParam || 4;
    
	return Streams.find(
		{   
            status: 'pending',
            isDeleted: {
                $ne: true
            },
			presenter_user_id: userId,
            presenter_gym_id: null,
            createdBy: userId
		}, {
            sort: {
                event_planned_start_timestamp: -1
            },
            skip: start,
            limit: num,
            fields: {
                _id: 1,
                dazl_id: 1,
                title: 1,
                description: 1,
                tags: 1,
                status: 1,
                presenter_user_id: 1,
                presenter_gym_id: 1,
                event_planned_start_timestamp: 1,
                event_planned_duration_seconds: 1,
                event_selected_camera: 1,
                createdBy: 1,
                isDeleted: 1
            }
        }
	);
});

Meteor.publish('streams.events.for.user.mobile', function(userId, startParam, numParam) {
    const start = startParam || 0;
    const num = numParam || 4;
    
    return Streams.find(
        {   
            status: 'pending',
            isDeleted: {
                $ne: true
            },
            presenter_user_id: userId,
            createdBy: userId
        }, {
            sort: {
                event_planned_start_timestamp: -1
            },
            skip: start,
            limit: num,
            fields: {
                _id: 1,
                dazl_id: 1,
                title: 1,
                description: 1,
                tags: 1,
                status: 1,
                presenter_user_id: 1,
                presenter_gym_id: 1,
                event_planned_start_timestamp: 1,
                event_planned_duration_seconds: 1,
                event_selected_camera: 1,
                createdBy: 1,
                isDeleted: 1
            }
        }
    );
});

Meteor.publish('streams.for.user', function(userId, startParam, numParam) {
    const start = startParam || 0;
    const num = numParam || 8;
    
	return Streams.find(
		{   
            isDeleted: {
                $ne: true
            },
			presenter_user_id: userId,
            presenter_gym_id: null,
            status: {
                "$in": ["live", "recorded"]
            }
		}, {
            skip: start,
            limit: num,
            sort: {
                status: 1,
                createdAt: -1
            },
            fields: {
                _id: 1,
                dazl_id: 1,
                title: 1,
                description: 1,
                tags: 1,
                status: 1,
                presenter_user_id: 1,
                presenter_gym_id: 1,
                createdBy: 1,
                isDeleted: 1,
                likes_count: 1,
                preview: 1,
                viewers_total_count: 1,
                viewers_live_count: 1,
                createdAt: 1
            }
        }
	);
});

Meteor.publishComposite('streams.org.home.paging', function(params, startParam, numParam) {
    const start = startParam || 0;
    const num = numParam || 8;

    return {
        find() {
            return Streams.find(
                {
                    status: {
                        "$in": ["live", "recorded"]
                    },
                    isDeleted: {
                        $ne: true
                    },
                    presenter_gym_id: params
                },
                {
                    sort: {
                        status: 1,
                        createdAt: -1
                    },
                    skip: start,
                    limit: num,
                    fields: {
                        _id: 1,
                        dazl_id: 1,
                        dazl_stream_type: 1,
                        presenter_user_id: 1,
                        presenter_gym_id: 1,
                        event_actual_start_time: 1,
                        event_actual_end_time: 1,
                        event_actual_duration: 1,
                        title: 1,
                        description: 1,
                        tags: 1,
                        status: 1,
                        viewers_total_count: 1,
                        viewers_live_count: 1,
                        isDeleted: 1,
                        likes_count: 1,
                        preview: 1
                    }
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
                                "profile.lastName" : 1,
                                "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});


Meteor.publishComposite('streams.one.composite', function(paramId) {

    return {
        find() {
            return Streams.find(
                {
                    _id: paramId
                },
                {
                    fields: {
                        _id: 1,
                        dazl_id: 1,
                        dazl_stream_type: 1,
                        presenter_user_id: 1,
                        presenter_gym_id: 1,
                        event_actual_start_time: 1,
                        event_actual_end_time: 1,
                        event_actual_duration: 1,
                        title: 1,
                        description: 1,
                        tags: 1,
                        status: 1,
                        viewers_total_count: 1,
                        viewers_live_count: 1,
                        likes_count: 1,
                        preview: 1,
                        isDeleted: 1,
                        createdAt: 1
                    }
                }
            );
        },
        children: [
            {
                // get users
                find(stream) {
                    return Users.find(
                        {
                            _id: stream.presenter_user_id
                        },
                        {
                            fields: {
                                _id: 1,
                                "profile.firstName" : 1,
                                "profile.lastName" : 1,
                                "profile.avatar" : 1
                            }
                        }
                    );
                }
            }
        ]
    }
});
