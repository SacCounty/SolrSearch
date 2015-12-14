/*global jasmine, describe, beforeEach, it, expect, require */
describe('viewmodels/search', function() {
    "use strict";

    var search = require('viewmodels/search');
    var ko = require('knockout');

    it('should return a title', function() {
        expect(search.Title).toBeDefined();
    });

    it('should return "images" as ko.observableArray ', function() {
        expect(ko.isObservable(search.Results)).toBeTruthy();
        expect(ko.unwrap(search.Results).length).toBeDefined();
    });

    it('should have a "activate" property of type function', function() {
        expect(typeof search.activate).toBe('function');
    });

    it('should have a "select" property of type function', function() {
        expect(typeof search.goQuery).toBe('function');
    });
});
