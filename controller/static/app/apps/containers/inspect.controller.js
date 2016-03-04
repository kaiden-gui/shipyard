(function(){
	'use strict';

	angular
		.module('shipyard.appscontainers')
		.controller('AppContainerController', AppContainerController);

	AppContainerController.$inject = ['resolvedContainer', 'AppContainerService', '$state'];
	function AppContainerController(resolvedContainer, AppContainerService, $state) {
        var vm = this;
        vm.container = resolvedContainer;
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.showRestartContainerDialog = showRestartContainerDialog;
        vm.showStopContainerDialog = showStopContainerDialog;
        vm.showPauseContainerDialog = showPauseContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.pauseContainer = pauseContainer;
        vm.unpauseContainer = unpauseContainer;
        vm.restartContainer = restartContainer;
        vm.parseLinkingString = parseLinkingString;
        vm.isEmptyObject = isEmptyObject;
        vm.top;
        vm.stats;
        vm.links = parseContainerLinks(vm.container.HostConfig.Links);

        if(resolvedContainer.State.Running) {
            AppContainerService.top(resolvedContainer.Id).then(function(data) {
                vm.top = data
            }, null);
        }

        function parseContainerLinks(links) {
            var l = [];
            if (links == null) {
                return l;
            }
            for (var i=0; i<links.length; i++) {
                var parts = links[i].split(':');
                var link = {
                    container: parts[0].slice(1),
                    link: parts[1].split('/')[2]
                }
                l.push(link)
            }

            return l;
        }

        function parseLinkingString(linkingString) {
            var linkedTo = linkingString.split(':')[0].replace('/','');
            var alias = linkingString.split(':')[1];

            return linkedTo + String.fromCharCode(8594) + alias.substring(alias.lastIndexOf('/')+1, alias.length);
        }

        function isEmptyObject(obj) {
            for (var k in obj) {
                return false;
            }

            return true;
        }

        function showDestroyContainerDialog() {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.destroy.modal').modal('show');
        }

        function showRestartContainerDialog() {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.restart.modal').modal('show');
        }

        function showStopContainerDialog() {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.stop.modal').modal('show');
        }

        function showPauseContainerDialog() {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.pause.modal').modal('show');
        }

        function destroyContainer() {
            AppContainerService.destroy(vm.selectedContainerId)
                .then(function(data) {
                    $state.transitionTo('dashboard.appcontainers');
                }, function(data) {
                    vm.error = data;
                });
        }

        function stopContainer() {
            AppContainerService.stop(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }

        function pauseContainer() {
            AppContainerService.pause(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }

        function unpauseContainer(container) {
            vm.selectedContainerId = container.Id;
            AppContainerService.unpause(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }

        function restartContainer() {
            AppContainerService.restart(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }
	}
})();
