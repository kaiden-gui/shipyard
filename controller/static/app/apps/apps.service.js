(function(){
	'use strict';

	angular
    	    .module('shipyard.apps')
            .factory('AppsService', AppsService);

	AppsService.$inject = ['$http'];
        function AppsService($http) {
            return {
                list: function() {
                    var promise = $http
                        .get('/api/apps')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
		owners: function() {
                    var promise = $http
                        .get('/api/accounts')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                role: function(name) {
                    var promise = $http
                        .get('/api/roles/'+name)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                getApp: function(username) {
                    var promise = $http
                        .get('/api/apps/' + username)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                removeApp: function(app) {
                    var promise = $http
                        .delete('/api/apps/'+app.id+'/'+app.owner)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
            } 
        } 
})();
