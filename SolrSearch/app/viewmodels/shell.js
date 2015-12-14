define(['plugins/router', 'durandal/app'], function (router, app) {
    return {
        router: router,
        search: function() {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        activate: function () {
            router.map([
                { route: '', title: 'Search', moduleId: 'viewmodels/search', nav: false },
                { route: 'search(/:query)', title: 'Search', moduleId: 'viewmodels/search', nav: false }
    ]).buildNavigationModel();
            
            return router.activate();
        }
    };
});