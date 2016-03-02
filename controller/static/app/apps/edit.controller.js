(function(){
    'use strict';

    angular
        .module('shipyard.apps')
        .controller('AppsEditController', AppsEditController);

    AppsEditController.$inject = ['app','owners', '$http', '$state'];
    function AppsEditController(app, owners, $http, $state) {
        var vm = this;
        vm.app = app;
        vm.editApp = editApp;
        vm.request = {};
        vm.appName = app.appname;
        vm.label = app.label;
        vm.request = null;
        vm.owners = owners;
        vm.appOwners = app.owner;
        vm.ownerOptions = vm.owners;
        vm.ownerConfig = {
            create: false,
            valueField: 'username',
            labelField: 'username',
            delimiter: ',',
            items: vm.owners,
            placeholder: 'Select Owners'
        };

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function editApp() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                id: app.id,
                appname: vm.appName,
                label: vm.label,
                owners: vm.appOwners
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

