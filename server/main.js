 import '/imports/startup/server';

// import { ViewerPlayer } 		from './viewer-player.js';
// import kurento 					from 'kurento-client';
// import io       				from 'socket.io-client';
// import { HTTP } 				from 'meteor/http';

// import { Meetings } 			from './meetings.js';
// import { Meeting } 				from './meeting.js';

// Fiber = Npm.require('fibers');

// var meetings = new Meetings();
// var socket = null;
// var sidToSockid = {};
// var candidatesQueue = {};
// var vod = {};
// var masterToMeeting = {};
// var BANDWIDTH_VIDEO_RECV = Meteor.settings.public.bandwidth.video.recv;
// var BANDWIDTH_VIDEO_SEND = Meteor.settings.public.bandwidth.video.send;
// var BANDWIDTH_AUDIO_RECV = Meteor.settings.public.bandwidth.audio;
// var GARBAGE_COLLECTING_INTERVAL = 300000;
// var KEEPING_MASTER_REFERENCE_TO_MEETING = 600000;

// // let socket = JsonProtocol.getInstance();
// // protocol.on('custom_message', (data, sessionId) => {
// // 	console.log(data);
// // 	protocol.send('custom_message', {data: 'data'}, sessionId);
// // });
// // console.log(socket);
// //'https://' + '192.168.0.42' + ':' + '3005'

// var gc = Meteor.setInterval(function(){
// 	for(var key in masterToMeeting){
// 		if(new Date() - masterToMeeting[key].timestamp > KEEPING_MASTER_REFERENCE_TO_MEETING){
// 			delete masterToMeeting[key];
// 		}
// 	}
// }, GARBAGE_COLLECTING_INTERVAL);

// var socket = io(
// 	Meteor.settings.public.socketServer.server + ":" + Meteor.settings.public.socketServer.port, 
// 	{ 
// 	 secure: true, 
// 	 reconnect: true, 
// 	 rejectUnauthorized : false
// 	});

// socket.on('connect', function(){
// 	const myIdSet = Meteor.settings.public.socketServer.selfSubId || 'meteor';
// 	socket.emit('subscribe', {myId: myIdSet});
// 	Fiber(function(){
// 		socket.on('forwarded', Meteor.bindEnvironment(function(message){
// 			var from = message.socketId;
// 			var userId = message.userId;
// 			sidToSockid[userId] = from;


// 			//Checking for a meeting existance if message has meetingId attached
// 			if(message.meetingId && 
// 				!meetings[message.meetingId] && 
// 				message.id !== 'presenter' &&
// 				message.id !== 'onIceCandidate'){
// 				sendMessage({
// 					id: 'error', 
// 					message: 'Meeting does not exist', 
// 					meetingId: message.meetingId
// 				}, socket, from);
// 				return;
// 			}

// 			console.log('Message from ' + message.userId + ': ', message);
// 				switch (message.id){

// 				//PLAYING LOGIC

// 				case 'start-playing': 
// 					console.log('start playing ' + message.file_uri);
// 					console.log('VIEWER ID ', message.viewerId);
// 					// var viewer = new ViewerPlayer(message.viewerId);
// 					var viewer = vod[message.viewerId] = new ViewerPlayer(message.viewerId);
// 					// console.log(socket);
// 					var sdpAnswer =  viewer.start({
// 						vod: vod,
// 						to: from,
// 						viewerId: message.viewerId,
// 						sdpOffer: message.sdpOffer,
// 						candidatesQueue: candidatesQueue,
// 						socket: socket,
// 						file_uri: message.file_uri
// 					});						
// 						//var sdpAnswer = startViewerPlayer(sessionId, message.sdpOffer, message.file_uri);

// 					if (sdpAnswer.lastIndexOf('Error: ', 0) === 0) {
// 						return sendMessage({
// 							id : 'viewerPlayerResponse',
// 							response : 'rejected',
// 							message : 'error'
// 						}, socket, from);
// 					}
					
// 					sendMessage({
// 						id : 'viewerPlayerResponse',
// 						response : 'accepted',
// 						sdpAnswer : sdpAnswer
// 					}, socket, from);

// 					break;
// 				case 'stop-playing':
// 					if(vod[message.viewerId] && vod[message.viewerId].pipeline){
// 						console.log('main.js::vod[' + message.viewerId + '] pipline release');
// 						vod[message.viewerId].pipeline.release();
// 						vod[message.viewerId] = null;
// 						delete vod[message.viewerId];
// 					}
// 					break;
// 				// case 'onIceCandidate':
// 				// 	onIceCandidate(message.viewerId, message.candidate);
// 				// 	break;


// 				//MEETING LOGIC
// 				case 'new-meeting':
// 					httpRequest('/api/meeting/create', function(err, response){
// 						if(err){
// 							console.log(err);
// 							return;
// 						}
// 						if(response && response.meetingId && response.uri){
// 							masterToMeeting[response.meetingId] = {
// 								master: message.userId,
// 								uri: response.uri, 
// 								timestamp: new Date()
// 							};
// 							console.log(masterToMeeting);
// 							sendMessage({
// 								id: 'meeting-id',
// 								meetingId: response.meetingId
// 							}, socket, from);
// 						}else{
// 							var err = new Error(
// 								'meetingId in response is ' + 
// 								response.meetingId +
// 								'uri in response is ' +
// 								response.uri);
// 							console.log(err.stack);
// 						}

// 					});
// 					break;
// 				case 'presenter':
// 				  	if((!meetings[message.meetingId] && 
// 				  		masterToMeeting[message.meetingId]) &&
// 				  		masterToMeeting[message.meetingId].master === message.userId){

// 						getKurentoClient(masterToMeeting[message.meetingId].uri, function(err, kurentoClient){
// 							if(err){
// 								console.log(err);
// 								return;
// 							}
// 							var pipeline = createPipeline(kurentoClient, function(err, pipeline){
// 								if(err){
// 									console.log(err);
// 									return;
// 								}

// 						    	pipeline.on('Error', function(err){
// 						        	console.log('Error in pipeline: ', err);
// 						        });

// 								var meeting = new Meeting(pipeline, kurentoClient, message.userId);
// 								meetings.addMeeting(message.meetingId, meeting);
// 								delete masterToMeeting[message.meetingId];
// 								console.log(meetings);

// 								joinMeeting(message.userId, message.meetingId);
// 								broadcastToMeeting(message.meetingId, message.userId, socket);

// 								startPresenter({
// 									meetingId: message.meetingId,
// 									sessionId: message.userId,
// 									kurentoClient: meetings[message.meetingId.kurentoClient],
// 									sdpOffer: message.sdpOffer,
// 									socket: socket,
// 									from: from
// 								}, function(err, sdpAnswer){
// 									if(err){
// 										console.log(err);
// 										return;
// 									}
// 									if (sdpAnswer.lastIndexOf('Error: ', 0) === 0) {
// 										return sendMessage({
// 											id : 'presenterResponse',
// 											response : 'rejected',
// 											message : sdpAnswer
// 										}, socket, from);
// 									}
										
// 									sendMessage({
// 										id : 'presenterResponse',
// 										response : 'accepted',
// 										sdpAnswer : sdpAnswer
// 									}, socket, from);
// 								});

// 							});						
// 						});
// 						return; 		
// 				  	}else if(!meetings[message.meetingId]){
// 						sendMessage({
// 							id: 'error', 
// 							message: 'Meeting does not exist', 
// 							meetingId: message.meetingId
// 						}, socket, from);
// 				  		return;
// 				  	}


// 					startPresenter({
// 						meetingId: message.meetingId,
// 						sessionId: message.userId,
// 						kurentoClient: meetings[message.meetingId.kurentoClient],
// 						sdpOffer: message.sdpOffer,
// 						socket: socket,
// 						from: from
// 					}, function(err, sdpAnswer){
// 						if(err){
// 							console.log(err);
// 							return;
// 						}
// 						if (sdpAnswer.lastIndexOf('Error: ', 0) === 0) {
// 							return sendMessage({
// 								id : 'presenterResponse',
// 								response : 'rejected',
// 								message : sdpAnswer
// 							}, socket, from);
// 						}
							
// 						sendMessage({
// 							id : 'presenterResponse',
// 							response : 'accepted',
// 							sdpAnswer : sdpAnswer
// 						}, socket, from);
// 					});
// 					break;

// 				case 'viewer':
// 					startViewer({
// 						meetingId: message.meetingId,
// 						sessionId: message.userId,
// 						kurentoClient: meetings[message.meetingId.kurentoClient],
// 						sdpOffer: message.sdpOffer,
// 						presenterId: message.presenterId,
// 						socket: socket,
// 						from: from
// 					}, function(err, sdpAnswer){
// 						if(err){
// 							console.log(err);
// 							return;
// 						}
// 						if (sdpAnswer.lastIndexOf('Error: ', 0) === 0) {
// 							return sendMessage({
// 								id : 'viewerResponse',
// 								response : 'rejected',
// 								presenterId: message.presenterId,
// 								message : 'error'
// 							}, socket, from);
// 						}
						
// 						sendMessage({
// 									id : 'viewerResponse',
// 									response : 'accepted',
// 									presenterId: message.presenterId,
// 									sdpAnswer : sdpAnswer
// 						}, socket, from);
// 					});
// 					break;

// 			case 'stop':
// 					if(message.type === 'presenter'){
// 						stop(message.userId, message.meetingId);
// 						sendMessage({
// 							id: 'markStreamFinished',
// 							presenterId: message.userId
// 						}, socket, from);
// 						broadcastToMeeting(message.meetingId, message.userId, socket);
// 		          	}
// 					break;

// 			case 'onIceCandidate':
// 					onIceCandidate(message.userId, message.candidate, message.type, message.meetingId, message.presenterId);
// 					break;

// 			case 'join-meeting':
// 				if(!message.meetingId) return;

// 				joinMeeting(message.userId, message.meetingId);

// 				broadcastToMeeting(message.meetingId, message.userId, socket);

// 				break;
// 			case 'leave-meeting':
// 				if(!message.meetingId) return;
// 				console.log('Leaving meeting: ' + message.meetingId + ' user: ' + message.userId);
// 				var closed = leaveMeeting(message.userId, message.meetingId);
// 				if(!closed){
// 					broadcastToMeeting(message.meetingId, message.userId, socket);
// 				}
// 				break;

// 				default:
// 					sendMessage({
// 						id: 'error',
// 						message: 'No id found'
// 					}, socket, from);
// 					break;
// 				}
// 		}));
// 	}).run();
// });

// function httpRequest(path, callback){
// 	if (typeof api_login !== 'undefined' && api_login !== null) {
// 		console.log(Meteor.settings.private.dazl.apiServer + path);
// 		var result = HTTP.call(
// 			"POST", Meteor.settings.private.dazl.apiServer + path,
// 			{ 
// 				headers: { 
// 					'X-User-Id': api_login.userId, 'X-Auth-Token': api_login.authToken
// 				}
// 			},
// 			function(err, result){
// 				if(err) {
// 					return callback(err);
// 				}
// 				console.log(result.data);
// 				return callback(null, result.data);
// 			});

// 	}else {
// 		console.log('Error: [server/main.js] api_login havent been initialized');
// 	}
//  //    var opts = 	{
// 	// 			    headers: {
// 	// 			    	'Content-Type': 'application/x-www-form-urlencoded',
// 	// 			    	'Cache-Control': 'no-cache'
// 	// 			    },
// 	// 	            protocol: 'https:',
// 	// 	            //hostname: 'dazlme-server-shaunst.c9users.io',
// 	// 	            host: '192.168.1.10',
// 	// 	            port: '8000',
// 	// 	            //port: '443',
// 	// 			    method: 'POST'
// 	// 			}
// 	// var externalApiResponse = '';
// 	// opts.headers['X-User-Id'] = app._credentials.userId || '';
// 	// opts.headers['X-Auth-Token'] = app._credentials.hash || '';
// 	// opts['path'] = "/api" + path;
// 	// //console.log(opts);
// 	// var r = https.request(opts, (res) => {
// 	// 	console.log('/api/meeting/create response');
// 	// 	res.on('data', (d) => {
// 	// 		externalApiResponse += d;
// 	// 	});
// 	// 	res.on('end', function() {
// 	// 		console.log(externalApiResponse);
// 	// 		var obj = JSON.parse(externalApiResponse);
// 	// 		if(obj.status === 'success'){
// 	// 			callback(null, JSON.parse(externalApiResponse));
// 	// 		}else{
// 	// 			callback(new Error('Error requesting api'));
// 	// 		}
// 	// 	});
// 	// });
// 	// r.on('error', (e) => {
// 	// 	console.error(`problem with request: ${e.message}`);
// 	// 	console.error(e.stack);
// 	// });
// 	// r.end();	
// }

// function onIceCandidate(userId, _candidate) {
// 	var candidate = kurento.register.complexTypes.IceCandidate(_candidate);
// 	if (!candidatesQueue[userId]) {
// 			candidatesQueue[userId] = [];
// 	}
// 	candidatesQueue[userId].push(candidate);
		
// }

// function sendMessage(message, socket, to){
// 	message.socketId = to;
// 	socket.emit('forward-to-client', message);
// }

// // function sendMessage(message, sessionId){
// // 	socket.send('custom_message', message, sessionId);
// // }

// function createPipeline(kurento, callback){
// 	kurento.create('MediaPipeline', function(err, pipeline){
// 		if(err){
// 			callback(err);
// 			return;
// 		}
// 		callback(null, pipeline);
// 	});
// }

// function getKurentoClient(uri, callback) {
//     kurento(uri, function(error, _kurentoClient) {
//         if (error) {
//             console.log("Could not find media server at address " + uri);
//             return callback("Could not find media server at address" + uri
//                     + ". Exiting with error " + error);
//         }

//         kurentoClient = _kurentoClient;
//         callback(null, kurentoClient);
//         //
//         //!DEVELOPMENT
//         //!Getting kurento server manager and clearing all pipelines on kurento server
//         // 
//         // kurentoClient.getServerManager(function(error, sm){
//         // 	sm.getInfo(function(errror, info){
//         // 		console.log(info);
//         // 	});
//         // 	sm.getPipelines(function(error, pipelines){
//         // 		console.log(pipelines);
//         // 		pipelines.forEach(function(el){
//         // 			el.release();
//         // 		});
//         // 		callback(null, kurentoClient);
//         // 	});
//         // 	sm.getSessions(function(error, sessions){
//         // 		//console.log(sessions);
//         // 	});
//         // });
//     });
// }

// function stop(id, meetingId) {
//     var removedMaster = meetings[meetingId] && meetings[meetingId].removePresenter(id);
//     if(removedMaster){
//     	delete meetings[meetingId];
//     }
// }

// function onIceCandidate(sessionId, _candidate, type, meetingId, presenterId) {
// 	console.log('---onIceCandidate function---', type, presenterId);
// 	var candidate = kurento.register.complexTypes.IceCandidate(_candidate);
// 	var meeting = meetings[meetingId];
// 	if(meeting){
// 		if(meeting.presenters[sessionId] && type === 'presenter'){
// 			meeting.presenters[sessionId].webRtcEndpoint.addIceCandidate(candidate);
// 		}else if(presenterId && 
// 			meeting.presenters[presenterId] && meeting.presenters[presenterId].viewers[sessionId] && 
// 			type === 'viewer'){

// 			meeting.presenters[presenterId].viewers[sessionId].addIceCandidate(candidate);
// 		}else if(type === 'viewer' && presenterId){
// 			if (!candidatesQueue[sessionId]) {
// 					candidatesQueue[sessionId] = {};
// 			}
// 			if(!candidatesQueue[sessionId][presenterId]){
// 				candidatesQueue[sessionId][presenterId] = [];
// 			}
// 			candidatesQueue[sessionId][presenterId].push(candidate);
// 		}else{
// 			if (!candidatesQueue[sessionId]) {
// 					candidatesQueue[sessionId] = {};
// 			}
// 			if(!candidatesQueue[sessionId].noPresenterId){
// 				candidatesQueue[sessionId].noPresenterId = [];
// 			}
// 			candidatesQueue[sessionId].noPresenterId.push(candidate);
// 		}
// 	}else{
// 		if (!candidatesQueue[sessionId]) {
// 				candidatesQueue[sessionId] = {};
// 		}
// 		if(!candidatesQueue[sessionId].noPresenterId){
// 			candidatesQueue[sessionId].noPresenterId = [];
// 		}
// 		candidatesQueue[sessionId].noPresenterId.push(candidate);
// 	}
// }

// function clearCandidatesQueue(sessionId) {
//   if (candidatesQueue[sessionId]) {
//     delete candidatesQueue[sessionId];
//   }
// }

// function clearCandidatesQueueViewer(sessionId, presenterId){
// 	if((candidatesQueue[sessionId] && presenterId) && candidatesQueue[sessionId][presenterId]){
// 		delete candidatesQueue[sessionId][presenterId];
// 	}
// 	if(candidatesQueue[sessionId] && candidatesQueue[sessionId].noPresenterId){
// 		delete candidatesQueue[sessionId].noPresenterId;
// 	}
// }

// function startPresenter(opts, callback) {
//   	clearCandidatesQueue(sessionId);

//    	var meetingId = opts.meetingId;
//   	var sessionId = opts.sessionId;
//   	var kurentoClient = opts.kurentoClient;
//   	var sdpOffer = opts.sdpOffer;
//   	var socket = opts.socket;
//   	var from = opts.from;

// 	var meeting = meetings[meetingId];
// 	if(meeting && meeting.presenters.hasOwnProperty(sessionId)){
// 		meeting.removePresenter(sessionId);
// 	}

// 	if(!meeting) {
// 		console.log('Meeting not found');
// 		return;
// 	}

// 	var pipeline = meeting.pipeline;

// 	pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
//         if (error) {
//         	console.log(error);
//           //stop(sessionId, name);
//           return callback(error);
//         }

//         meeting.addPresenter({id: sessionId, webRtcEndpoint: webRtcEndpoint});

// 		setBandwidth(webRtcEndpoint, {
// 			video: {
// 				send: BANDWIDTH_VIDEO_SEND, 
// 				recv: BANDWIDTH_VIDEO_RECV
// 			}, 
// 			audio: {
// 				recv: BANDWIDTH_AUDIO_RECV
// 			}
// 		});

//         webRtcEndpoint.on('MediaFlowOutStateChange', function(event){
//           console.log('PRESENTER MEDIA EVENT ', event);
//           if(event.state === 'NOT_FLOWING' && event.mediaType === 'VIDEO'){
//             var removedMaster = meeting && meeting.removePresenter(sessionId);
//             if(removedMaster){
//             	delete meetings[meetingId];
//             }
//           }else if(event.state === 'FLOWING' && event.mediaType === 'VIDEO'){
//           	broadcastToMeeting(meetingId, sessionId, socket);
//           }
//         });

//         webRtcEndpoint.on('MediaFlowInStateChange', function(event){
//           console.log(event);
//         });

//         if (candidatesQueue[sessionId] && candidatesQueue[sessionId].noPresenterId) {
//         	console.log('already arrived ice candidates: ', candidatesQueue[sessionId].noPresenterId.length);
//             while(candidatesQueue[sessionId].noPresenterId.length) {
//                 let candidate = candidatesQueue[sessionId].noPresenterId.shift();
//                 console.log(candidate);
//                 webRtcEndpoint.addIceCandidate(candidate);
//             }
//         }

//         webRtcEndpoint.on('OnIceCandidate', function(event) {
//         	//console.log('iceCandidate event');
//             let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
//             sendMessage({
//                 id : 'iceCandidate',
//                 type: 'presenter',
//                 presenterId: sessionId,
//                 candidate : candidate
//             }, socket, from);
//         });

//         webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
//           if (error) {
//             meeting && meeting.removePresenter(sessionId);
//             return callback(error);
//           }
          
//           callback(null, sdpAnswer);
//         });

//         webRtcEndpoint.gatherCandidates(function(error) {
//             if (error) {
//                 meeting && meeting.removePresenter(sessionId);
//                 return callback(error);
//             }
//         });
//     });

// }

// function startViewer(opts, callback) {
//   	clearCandidatesQueueViewer(sessionId, opts.presenterId);

//   	var meetingId = opts.meetingId;
//   	var sessionId = opts.sessionId;
//   	var presenterId = opts.presenterId;
//   	var kurentoClient = opts.kurentoClient;
//   	var sdpOffer = opts.sdpOffer;
//   	var socket = opts.socket;
//   	var from = opts.from;

// 	var meeting = meetings[meetingId];
// 	var pipeline = meeting.pipeline;
//   //check if there is refer.presenter.pipeline

//   	if(!meeting) {
// 		console.log('Meeting not found');
// 		return;
// 	}

//   pipeline.create('WebRtcEndpoint', function(error, webRtcEndpoint) {
//     if (error) {
//       //stop(ws.id, ws.request.session.name);
//       return callback(error);
//     }

//     meeting.presenters[presenterId].viewers[sessionId] = webRtcEndpoint;

// 	setBandwidth(webRtcEndpoint, {
// 		video: {
// 			send: BANDWIDTH_VIDEO_SEND, 
// 			recv: BANDWIDTH_VIDEO_RECV
// 		}, 
// 		audio: {
// 			recv: BANDWIDTH_AUDIO_RECV
// 		}
// 	});

//     if (candidatesQueue[sessionId] && candidatesQueue[sessionId][presenterId]) {
//       while(candidatesQueue[sessionId][presenterId].length) {
//         let candidate = candidatesQueue[sessionId][presenterId].shift();
//         webRtcEndpoint.addIceCandidate(candidate);
//       }
//     }else if(candidatesQueue[sessionId] && candidatesQueue[sessionId].noPresenterId){
//       while(candidatesQueue[sessionId].noPresenterId.length) {
//         let candidate = candidatesQueue[sessionId].noPresenterId.shift();
//         webRtcEndpoint.addIceCandidate(candidate);
//       }
//     }

//     webRtcEndpoint.on('MediaFlowInStateChange', function(event){
//     	console.log('Viewer webRtcEndpoint ', event);
// 		if(event.state === 'FLOWING'){
// 		}
//     });

//     webRtcEndpoint.on('OnIceCandidate', function(event) {
//         let candidate = kurento.getComplexType('IceCandidate')(event.candidate);
//         sendMessage({
//             id : 'iceCandidate',
//             type: 'viewer',
//             presenterId: presenterId,
//             candidate : candidate
//         }, socket, from);
//     });

//     webRtcEndpoint.processOffer(sdpOffer, function(error, sdpAnswer) {
//       if (error) {
//         //stop(ws.id, ws.request.session.name);
//         return callback(error);
//       }

//       meeting.presenters[presenterId].webRtcEndpoint.connect(webRtcEndpoint, function(error) {
//         if (error) {
//           //stop(ws.id,ws.request.session.name);
//           return callback(error);
//         }

//         callback(null, sdpAnswer);
//         webRtcEndpoint.gatherCandidates(function(error) {
//             if (error) {
//               //stop(ws.id, ws.request.session.name);
//               return callback(error);
//             }
//         });
//         });
//       });
//   });
// }

// function joinMeeting(id, meetingId){
// 	var meeting = meetings[meetingId];
// 	if(meeting && meeting.participants && meeting.participants.indexOf(id) === -1){
// 		meeting && meeting.participants.push(id);
// 		return true;
// 	}
// 	console.log('Meeting ', meetingId, ' does not exist');
// 	return false;
// }

// function leaveMeeting(id, meetingId){
// 	var meeting = meetings[meetingId];
// 	if(meeting){

// 		//Closing meeting if master leaving
// 		if(meeting.master === id){
// 			meeting.close();
// 			meetings[meetingId] = null;
// 			delete meetings[meetingId];
// 			return true;
// 		}

// 		//Removing from viewers
// 		for (var key in meeting.presenters){
// 			var viewerWRE = meeting.presenters[key].viewers[id];
// 			viewerWRE && viewerWRE.release();
// 			delete meeting.presenters[key].viewers[id];
// 		}
// 		//Removing from presenters
// 		meeting.presenters[id] && meeting.presenters[id].webRtcEndpoint.release();
// 		meeting.presenters[id] && delete meeting.presenters[id];
// 		//Removing from participants
// 		var index = meeting.participants.indexOf(id);
// 		if(index !== -1){
// 			meeting.participants.splice(index, 1);
// 		}
// 		return false;
// 	}
// 	return true;
// }

// function broadcastToMeeting(meetingId, sessionId, socket){
// 	console.log('broadcastToMeeting ', meetingId);
// 	console.log('userId', sessionId);
// 	var meeting = meetings[meetingId];
//   	var ids = [];
//   	if(meeting && meeting.participants){
//       	// for (var key in meeting.presenters[sessionId].viewers){
//       	// 	if(meeting.presenters[sessionId].hasOwnProperty(key)){
//       	// 		ids.push(key);
//       	// 	}
//       	// }
//       	ids = meeting.participants;

//       	//Get presenters
//       	var presenters = [];
//       	for (var key in meeting.presenters){
//       		if(meeting.presenters.hasOwnProperty(key)){
//       			presenters.push(key);
//       		}
//       	}
//       	console.log('Participants ', meeting.participants);
//   		console.log(sidToSockid);
//   		console.log('PRESENTERS ARRAY ', presenters);	
//       	ids.forEach(function(el){
      		
//       		var filtered;
//       		var master = meeting.master;
//       		console.log('MASTER', master);
//       		console.log(el);
//       		console.log(el !== master);
//       		//returning only master stream id for anyone but master
//       		var masterPresenting = presenters.indexOf(master) !== -1;
//       		console.log('Master presenting ', masterPresenting);
//       		if(el !== master && masterPresenting) {
//       			filtered = [master];
//       			console.log(filtered);
//       			sendMessage({id: 'meeting-update', presenters: filtered}, socket, sidToSockid[el]);
//       			return;
//       		}else if(el !== master && !masterPresenting){
//       			filtered = [];
//       			console.log(filtered);
//       			sendMessage({id: 'meeting-update', presenters: filtered}, socket, sidToSockid[el]);
//       			return;
//       		}

//           	filtered = presenters.filter(function(id){
//       			return id !== el;
//       		});
//       		console.log(filtered);
//       		sendMessage({id: 'meeting-update', presenters: filtered}, socket, sidToSockid[el]);
// 			//io.to(sidToSockid[el]).emit('message', {id: 'meeting-update', presenters: filtered});
//       	});
//   	}
// }

// function setBandwidth(webRtcEndpoint, opts){
// 	if(!webRtcEndpoint || !opts) return;
// 	var videoSend = opts.video.send || 7000;
// 	var videoRecv = opts.video.recv || 7000;
// 	var audioRecv = opts.audio.recv || 7000;
	
// 	webRtcEndpoint.setMaxVideoRecvBandwidth(videoRecv);
// 	webRtcEndpoint.setMaxVideoSendBandwidth(videoSend);
// 	webRtcEndpoint.setMaxAudioRecvBandwidth(audioRecv);
// }