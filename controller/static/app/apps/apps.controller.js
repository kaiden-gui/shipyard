(function(){
	'use strict';

	angular
		.module('shipyard.apps')
		.controller('AppsController', AppsController);

	AppsController.$inject = ['apps', 'owners', 'AppsService', '$state', '$timeout'];
	function AppsController(apps, owners, AppsService, $state, $timeout) {
            var vm = this;
            vm.apps = apps;
            vm.refresh = refresh;
            vm.selectedApp = null;
            vm.removeApp = removeApp;
            vm.showRemoveAppDialog = showRemoveAppDialog;

            function showRemoveAppDialog(app) {
                vm.selectedApp = app;
                $('#remove-modal').modal('show');
            }

            function refresh() {
                AppsService.list()
                    .then(function(data) {
                        vm.apps = data;
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }

            function removeApp() {
                AppsService.removeApp(vm.selectedApp)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }

	}
})();
