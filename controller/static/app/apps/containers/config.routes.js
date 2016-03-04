(function(){
    'use strict';

    angular
        .module('shipyard.appscontainers')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('dashboard.appscontainers', {
                url: '^/apps/containers/{label}',
                templateUrl: 'app/apps/containers/containers.html',
                controller: 'AppContainersController',
                controllerAs: 'vm',
                authenticate: true,
	    	resolve: {
			resolvedAppContainer: ['AppContainerService', '$state', '$stateParams', function(AppContainerService, $state, $stateParams) {
		    		return AppContainerService.list($stateParams.label).then(null, function(errorData) {
					$state.go('error');
		    		});
			}]
	    	}
            })
        .state('dashboard.appsinspect', {
            url: '^/apps/container/{id}',
            templateUrl: 'app/apps/containers/inspect.html',
            controller: 'AppContainerController',
            controllerAs: 'vm',
            authenticate: true,
            resolve: {
                resolvedContainer: ['AppContainerService', '$state', '$stateParams', function(AppContainerService, $state, $stateParams) {
                    return AppContainerService.inspect($stateParams.id).then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        })
        .state('dashboard.appsdeploy', {
            url: '^/apps/deploy',
            templateUrl: 'app/apps/containers/deploy.html',
            controller: 'AppContainerDeployController',
            controllerAs: 'vm',
            authenticate: true,
            resolve: {
                containers: ['AppContainerService', '$state', '$stateParams', function(AppContainerService, $state, $stateParams) {
                    return AppContainerService.list($stateParams.label).then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        })
        .state('dashboard.appsexec', {
            url: '^/apps/exec/{id}',
            templateUrl: 'app/apps/containers/exec.html',
            controller: 'AppExecController',
            controllerAs: 'vm',
            authenticate: true
        })
        .state('dashboard.appsstats', {
            url:'^/apps/container/{id}/stats',
            templateUrl: 'app/apps/containers/stats.html',
            controller: 'AppContainerStatsController',
            controllerAs: 'vm',
            authenticate: true
        })
        .state('dashboard.appslogs', {
            url:'^/apps/container/{id}/logs',
            templateUrl: 'app/apps/containers/logs.html',
            controller: 'AppLogsController', 
            controllerAs: 'vm',
            authenticate: 'true',
            resolve: {
                resolvedLogs: ['AppContainerService', '$state', '$stateParams', function(AppContainerService, $state, $stateParams) {
                    return AppContainerService.logs($stateParams.id).then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        });
    }
})();
