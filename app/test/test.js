'use strict';

angular.module('variantdatabase.test', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui-notification', 'nvd3' ,'ngFileSaver'])

    .controller('TestCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll','FileSaver', 'Blob', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework, $anchorScroll, FileSaver, Blob) {

        $scope.companies = [
            { 'name':'Infosys Technologies',
                'employees': 125000,
                'headoffice': 'Bangalore'},
            { 'name':'Cognizant Technologies',
                'employees': 100000,
                'headoffice': 'Bangalore'},
            { 'name':'Wipro',
                'employees': 115000,
                'headoffice': 'Bangalore'},
            { 'name':'Tata Consultancy Services (TCS)',
                'employees': 150000,
                'headoffice': 'Bangalore'},
            { 'name':'HCL Technologies',
                'employees': 90000,
                'headoffice': 'Noida'}
        ];

        $scope.addRow = function(){
            $scope.companies.push({ 'name':$scope.name, 'employees': $scope.employees, 'headoffice':$scope.headoffice });
            $scope.name='';
            $scope.employees='';
            $scope.headoffice='';
        };

        $scope.removeRow = function(name){
            var index = -1;
            var comArr = eval( $scope.companies );
            for( var i = 0; i < comArr.length; i++ ) {
                if( comArr[i].name === name ) {
                    index = i;
                    break;
                }
            }
            if( index === -1 ) {
                alert( "Something gone wrong" );
            }
            $scope.companies.splice( index, 1 );
        };

    }]);