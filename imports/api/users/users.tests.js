/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// import { Factory } from 'meteor/dburles:factory';
// import { chai, assert } from 'meteor/practicalmeteor:chai';
// import { Random } from 'meteor/random';

import { Meteor } from 'meteor/meteor';
import { Users } from './users.js';
// import { insertPost, updatePost, removePost } from './methods.js';

if (Meteor.isServer) {
  describe('Users', () => {
    describe('methods', () => {
      beforeEach(() => {
        Users.remove({});
      });

      describe('Insert', () => {
        it('Should insert a user', () => {
          return true;
        });
      });

      describe('Update', () => {
        it('Should update a user', () => {
          return true;
        });
      });

      describe('Remove', () => {
        it('Should delete a user', () => {
          return true;
        });
      });
    });
  });
}
