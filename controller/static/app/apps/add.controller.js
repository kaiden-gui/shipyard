(function(){
    'use strict';

    angular
        .module('shipyard.apps')
        .controller('AppsAddController', AppsAddController);

    AppsAddController.$inject = ['roles', '$http', '$state'];
    function AppsAddController(roles, $http, $state) {
        var vm = this;
        vm.request = {};
        vm.addApp = addApp;
        vm.appName = "";
        vm.label = "";
        vm.owner = "admin";
        vm.request = null;
        vm.roles = roles;
        vm.userRoles = null;
        vm.roleOptions = roles;
        vm.roleConfig = {
            create: false,
            valueField: 'role_name',
            labelField: 'description',
            delimiter: ',',
            placeholder: 'Select Roles',
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

