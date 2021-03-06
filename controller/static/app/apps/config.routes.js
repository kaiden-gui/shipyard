(function(){
	'use strict';

	angular
		.module('shipyard.apps')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('dashboard.apps', {
			    url: '^/apps',
			    templateUrl: 'app/apps/apps.html',
                            controller: 'AppsController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                apps: ['AppsService', '$state', '$stateParams', function (AppsService, $state, $stateParams) {
                                    return AppsService.list().then(null, function(errorData) {	                            
                                        $state.go('error');
                                    }); 
                                }],
                                owners: ['AppsService', '$state', '$stateParams', function (AppsService, $state, $stateParams) {
                                    return AppsService.owners().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }]
	
                            }
			})
                        .state('dashboard.addApp', {
                            url: '^/apps/add',
                            templateUrl: 'app/apps/add.html',
                            controller: 'AppsAddController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                owners: ['AppsService', '$state', '$stateParams', function (AppsService, $state, $stateParams) {
                                    return AppsService.owners().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }] 
                            }
                        })
                        .state('dashboard.editApp', {
                            url: '^/apps/edit/{id}',
                            templateUrl: 'app/apps/edit.html',
                            controller: 'AppsEditController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                app: ['AppsService', '$state', '$stateParams', function (AppsService, $state, $stateParams) {
                                    return AppsService.getApp($stateParams.id).then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }],
                                owners: ['AppsService', '$state', '$stateParams', function (AppsService, $state, $stateParams) {
                                    return AppsService.owners().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }] 
                            }
                        });
	}
})();
