/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// import { Factory } from 'meteor/dburles:factory';
// import { chai, assert } from 'meteor/practicalmeteor:chai';
// import { Random } from 'meteor/random';

import { Meteor } from 'meteor/meteor';
import { Examples } from './examples.js';
// import { insertPost, updatePost, removePost } from './methods.js';

if (Meteor.isServer) {
  describe('Examples', () => {
    describe('methods', () => {
      beforeEach(() => {
        Examples.remove({});
      });

      describe('Insert', () => {
        it('Should insert a example', () => {
          return true;
        });
      });

      describe('Update', () => {
        it('Should update a example', () => {
          return true;
        });
      });

      describe('Remove', () => {
        it('Should delete a example', () => {
          return true;
        });
      });
    });
  });
}
