// import { Restivus } from 'meteor/nimble:restivus';
// import { HTTP } from 'meteor/http';
// import { Meteor } from 'meteor/meteor';

// var Api = new Restivus({
//   useDefaultAuth: true,
//   prettyJson: true
// });

// var api_login;
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// HTTP.call("POST", Meteor.settings.private.dazl.apiServer + "/api/login",
//   { 
//     data: { 
//       email: Meteor.settings.private.dazl.user, password: Meteor.settings.private.dazl.password
//     }
//   },
//   function (error, result) {
//     if (!error) {
//       api_login = result.data.data;
//     } else {
//       console.log('error', error);
//     }
// });

// Api.addRoute('streams', {
//   post: {
//     authRequired: false,
//     action: function () {
//       if (api_login) {
//         var result = 
//         HTTP.call("POST", Meteor.settings.private.dazl.apiServer + "/api/streams/show",
//           { 
//             headers: { 
//               'X-User-Id': api_login.userId, 'X-Auth-Token': api_login.authToken
//             }
//           });
//         if (result) {
//           return result.data.data;
//         } else {
//           console.log('Ups.. looks like there some errors');
//           return "";
//        }
//       }
//       return "";
//     }
//   }
// });

// Api.addRoute('stream', {
//   post: {
//     authRequired: false,
//     action: function () {
//       if (api_login) {
//         var result = 
//         HTTP.call("POST", Meteor.settings.private.dazl.apiServer + "/api/stream/video_stream_create",
//           { 
//             headers: { 
//               'X-User-Id': api_login.userId, 'X-Auth-Token': api_login.authToken
//             }
//           });
//         //console.log('result', result);
//         if (result) {
//           console.log('success');
//           return result.data.streamId;
//         } else {
//           console.log('Ups.. looks like there some errors');
//           return "";
//        }
//       }
//       return "";
//     }
//   }
// });