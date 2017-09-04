/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// import { Factory } from 'meteor/dburles:factory';
// import { chai, assert } from 'meteor/practicalmeteor:chai';
// import { Random } from 'meteor/random';

import { Meteor } from 'meteor/meteor';
import { Locations } from './locations.js';
// import { insertPost, updatePost, removePost } from './methods.js';

if (Meteor.isServer) {
  describe('Locationes', () => {
    describe('methods', () => {
      beforeEach(() => {
        Locations.remove({});
      });

      describe('Insert', () => {
        it('Should insert a location', () => {
          return true;
        });
      });

      describe('Update', () => {
        it('Should update a location', () => {
          return true;
        });
      });

      describe('Remove', () => {
        it('Should delete a location', () => {
          return true;
        });
      });
    });
  });
}
