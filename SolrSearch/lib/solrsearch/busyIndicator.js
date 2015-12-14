define(['plugins/http', 'durandal/app', 'knockout', 'jquery'], function dataaccess(http, app, ko, $) {
    var ctor = function (observable) {
        var self = this;

        var $loading = document.getElementById('loading');

        ko.applyBindingsToNode($loading, { text: observable }, observable);

    }
});