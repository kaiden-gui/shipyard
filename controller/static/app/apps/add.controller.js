(function(){
    'use strict';

    angular
        .module('shipyard.apps')
        .controller('AppsAddController', AppsAddController);

    AppsAddController.$inject = ['owners', '$http', '$state'];
    function AppsAddController(owners, $http, $state) {
        var vm = this;
        vm.request = {};
        vm.addApp = addApp;
        vm.appName = "";
        vm.label = "";
        vm.request = null;
        vm.owner = null;
        vm.owners = owners;
        vm.ownerOptions = owners;
        vm.ownerConfig = {
            create: false,
            valueField: 'username',
            labelField: 'username',
            delimiter: ',',
            placeholder: 'Select Owners',
            onInitialize: function(selectize){
            },
        };

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function addApp() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                appname: vm.appName,
                label: vm.label,
                owner: vm.owner
            }
            $http
                .post('/api/apps', vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.apps');
                })
            .error(function(data, status, headers, config) {
                vm.error = data;
            });
        }
    }
})();

