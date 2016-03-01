(function(){
    'use strict';

    angular
        .module('shipyard.apps')
        .controller('AppsEditController', AppsEditController);

    AppsEditController.$inject = ['app','roles', '$http', '$state'];
    function AppsEditController(app, roles, $http, $state) {
        var vm = this;
        vm.app = app;
        vm.editApp = editApp;
        vm.request = {};
        vm.password = null;
        vm.firstName = app.first_name;
        vm.lastName = app.last_name;
        vm.request = null;
        vm.roles = roles;
        vm.userRoles = app.roles;
        vm.roleOptions = vm.roles;
        vm.roleConfig = {
            create: false,
            valueField: 'role_name',
            labelField: 'description',
            delimiter: ',',
            items: vm.userRoles,
            placeholder: 'Select Roles'
        };

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function editApp() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                username: app.username,
                password: vm.password,
                first_name: vm.firstName,
                last_name: vm.lastName,
                roles: vm.userRoles
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

