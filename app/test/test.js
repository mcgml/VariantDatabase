'use strict';

angular.module('variantdatabase.test', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui-notification', 'nvd3' ,'ngFileSaver'])

    .controller('TestCtrl', ['$rootScope', '$scope', '$http', 'Notification', '$uibModal', '$window','framework', '$anchorScroll','FileSaver', 'Blob', function ($rootScope, $scope, $http, Notification, $uibModal, $window, framework, $anchorScroll, FileSaver, Blob) {

        $scope.searchPubmedByTerm = function(){

            var pubmedIds;
            var pubmedIdsConcat = "";

            //get Ids
            $http({
                method: 'GET',
                url: 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=20&term=' + $scope.searchTerm
            }).then(function successCallback(response) {
                pubmedIds = response.data.esearchresult.idlist;

                for (var key in pubmedIds){
                    if (pubmedIds.hasOwnProperty(key)) {
                        pubmedIdsConcat = pubmedIdsConcat + pubmedIds[key] + ",";
                    }
                }

                $http({
                    method: 'GET',
                    url: 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=text&rettype=abstract&id=' + pubmedIdsConcat
                }).then(function successCallback(response) {
                    $scope.pubmedAbstracts = response.data;
                    Notification('Operation successful');
                }, function errorCallback(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            }, function errorCallback(response) {
                Notification.error(response);
                console.log("ERROR: " + response);
            });


        };

    }]);