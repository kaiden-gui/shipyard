(function(){
    'use strict';

    angular
        .module('shipyard.appscontainers')
        .controller('AppContainersController', AppContainersController);

    AppContainersController.$inject = ['resolvedAppContainer', '$scope', 'AppContainerService', '$state', '$stateParams'];
    function AppContainersController(resolvedAppContainer, $scope, AppContainerService, $state, $stateParams) {
        var vm = this;
        
        vm.error = "";
        vm.errors = [];
        vm.containers = [];
        vm.label = $stateParams.label;
        vm.selected = {};
        vm.selectedItemCount = 0;
        vm.selectedAll = false;
        vm.numOfInstances = 1;
        vm.selectedContainer = null;
        vm.selectedContainerId = "";
        vm.newName = "";

        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.showRestartContainerDialog = showRestartContainerDialog;
        vm.showStopContainerDialog = showStopContainerDialog;
        vm.showPauseContainerDialog = showPauseContainerDialog;
        vm.showScaleContainerDialog = showScaleContainerDialog;
        vm.showRenameContainerDialog = showRenameContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.pauseContainer = pauseContainer;
        vm.unpauseContainer = unpauseContainer;
        vm.restartContainer = restartContainer;
        vm.scaleContainer = scaleContainer;
        vm.renameContainer = renameContainer;
        vm.refresh = refresh;
        vm.containerStatusText = containerStatusText;
	vm.nodeName = nodeName;
	vm.containerName = containerName;
        vm.checkAll = checkAll;
        vm.clearAll = clearAll;
        vm.destroyAll = destroyAll;
        vm.stopAll = stopAll;
        vm.restartAll = restartAll;

        refresh();

        // Apply jQuery to dropdowns in table once ngRepeat has finished rendering
        $scope.$on('ngRepeatFinished', function() {
            $('.ui.sortable.celled.table').tablesort();
            $('#select-all-table-header').unbind();
            $('.ui.right.pointing.dropdown').dropdown();
        });

        $('#multi-action-menu').sidebar({dimPage: false, animation: 'overlay', transition: 'overlay'});

        $scope.$watch(function() {
            var count = 0;
            angular.forEach(vm.selected, function (s) {
                if(s.Selected) {
                    count += 1;
                }
            });
            vm.selectedItemCount = count;
        });

        // Remove selected items that are no longer visible 
        $scope.$watchCollection('filteredContainers', function () {
            angular.forEach(vm.selected, function(s) {
                if(vm.selected[s.Id].Selected == true) {
                    var isVisible = false
                    angular.forEach($scope.filteredContainers, function(c) {
                        if(c.Id == s.Id) {
                            isVisible = true;
                            return;
                        }
                    });
                    vm.selected[s.Id].Selected = isVisible;
                }
            });
            return;
        });

        function clearAll() {
            angular.forEach(vm.selected, function (s) {
                vm.selected[s.Id].Selected = false;
            });
        }

        function restartAll() {
            angular.forEach(vm.selected, function (s) {
                if(s.Selected == true) {
                    AppContainerService.restart(s.Id)
                        .then(function(data) {
                            delete vm.selected[s.Id];
                            vm.refresh();
                        }, function(data) {
                            vm.error = data;
                        });
                }
            });
        }

        function stopAll() {
            angular.forEach(vm.selected, function (s) {
                if(s.Selected == true) {
                    AppContainerService.stop(s.Id)
                        .then(function(data) {
                            delete vm.selected[s.Id];
                            vm.refresh();
                        }, function(data) {
                            vm.error = data;
                        });
                }
            });
        }

        function destroyAll() {
            angular.forEach(vm.selected, function (s) {
                if(s.Selected == true) {
                    AppContainerService.destroy(s.Id)
                        .then(function(data) {
                            delete vm.selected[s.Id];
                            vm.refresh();
                        }, function(data) {
                            vm.error = data;
                        });
                }
            });
        }

        function checkAll() {
            angular.forEach($scope.filteredContainers, function (container) {
                vm.selected[container.Id].Selected = vm.selectedAll;
            });
        }

        function refresh() {
            AppContainerService.list(vm.label)
                .then(function(data) {
                    vm.containers = data; 
                    angular.forEach(vm.containers, function (container) {
                        vm.selected[container.Id] = {Id: container.Id, Selected: vm.selectedAll};
                    });
                }, function(data) {
                    vm.error = data;
                });

            vm.error = "";
            vm.errors = [];
            vm.containers = [];
            vm.selected = {};
            vm.selectedItemCount = 0;
            vm.selectedAll = false;
            vm.numOfInstances = 1;
            vm.selectedContainerId = "";
            vm.newName = "";
        }

        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('#destroy-modal').modal('show');
        }

        function showRestartContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('#restart-modal').modal('show');
        }

        function showStopContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('#stop-modal').modal('show');
        }

        function showPauseContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $("#pause-modal").modal('show');
        }

        function showScaleContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('#scale-modal').modal('show');
        }

        function showRenameContainerDialog(container) {
            vm.selectedContainer = container;
            $('#rename-modal').modal('show');
        }

        function destroyContainer() {
            AppContainerService.destroy(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function stopContainer() {
            AppContainerService.stop(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function pauseContainer() {
            AppContainerService.pause(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function unpauseContainer(container) {
            vm.selectedContainerId = container.Id;
            AppContainerService.unpause(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function restartContainer() {
            AppContainerService.restart(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function scaleContainer() {
            AppContainerService.scale(vm.selectedContainerId, vm.numOfInstances)
                .then(function(response) {
                    vm.refresh();
                }, function(response) {
                    // Add unique errors to vm.errors
                    $.each(response.data.Errors, function(i, el){
                            if($.inArray(el, vm.errors) === -1) vm.errors.push(el);
                    });
                });
        }

        function renameContainer() {
            AppContainerService.rename(vm.selectedContainer.Id, vm.newName)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function containerStatusText(container) {
            if(container.Status.indexOf("Up")==0){
                if (container.Status.indexOf("(Paused)") != -1) {
                    return "Paused";
                }
                return "Running";
            }
            else if(container.Status.indexOf("Exited")==0){
                return "Stopped";
            }            
            return "Unknown";
        }   
		
		function nodeName(container) {
			// Return only the node name (first component of the shortest container name)
			var components = shortestContainerName(container).split('/');
			return components[1];
		}
		
		function containerName(container) {
			// Remove the node name by returning the last name component of the shortest container name
			var components = shortestContainerName(container).split('/');
			return components[components.length-1];
		}
		
		function shortestContainerName(container) {
			// Distill shortest container name by taking the name with the fewest components
			// Names with the same number of components are considered in undefined order
			var shortestName = "";
			var minComponents = 99;
			
			var names = container.Names
			for(var i=0; i<names.length; i++) {
				var name = names[i];
				var numComponents = name.split('/').length
				if(numComponents < minComponents) {
					shortestName = name;
					minComponents = numComponents;
				}
			}

			return shortestName;			
		}
    }
})();
