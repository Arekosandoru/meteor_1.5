import './example.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TemplateVar } from 'meteor/frozeman:template-var';
import { moment } from 'meteor/momentjs:moment';
import { underscore } from 'meteor/underscore';
import { $ } from 'meteor/jquery';

import { Examples } from '../../../api/examples/examples.js';

Template.example.onRendered(function() {
    this.autorun(() => {
    });
});

Template.example.helpers({
});

Template.example.events({
});
