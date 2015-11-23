'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdatabase', [ 'ngRoute', 'variantdatabase.login', 'variantdatabase.report', 'variantdatabase.search', 'variantdatabase.account', 'variantdatabase.admin', 'variantdatabase.about'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise(
            {
                redirectTo: '/login'
            });
    }])

    .config(function(NotificationProvider) {
        NotificationProvider.setOptions(
            {
                delay: 2500,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'right',
                positionY: 'bottom'
            }
        )
    })

    .controller('VariantOccurrenceCtrl', function ($scope, $uibModalInstance, items, $window) {
        $scope.items = items;

        function convertVariantToRangeFunction(variantId){
            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");

            var refLength = split2[0].match(/\D/g).length;
            var altLength = split2[1].match(/\D/g).length;

            var startPosition = split2[0].replace(/\D/g, '');
            var endPosition = (startPosition - refLength) + altLength;

            return split1[0] + ":" + startPosition + "-" + endPosition;
        }

        $scope.launchIGV = function (remoteBamFilePath, variantId){
            $window.open('http://localhost:60151/load?file=' + remoteBamFilePath + '&locus=' + convertVariantToRangeFunction(variantId) + '&genome=37', '_blank');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    })

    .controller('VariantAnnotationCtrl', function ($scope, $uibModalInstance, items, $window) {
        $scope.items = items;

        function keywordSearchFromAnnotationObject(annotation){
            var keywords = '';

            if (annotation.hasOwnProperty('SymbolId')){
                keywords += " \"";
                keywords += annotation.SymbolId;
                keywords += "\"";
            }

            if (annotation.hasOwnProperty('HGVSc')){
                keywords += " \"";
                keywords += annotation.HGVSc.substring(2);
                keywords += "\"";
            }

            if (annotation.hasOwnProperty('HGVSp')){
                if (annotation.HGVSp !== "p.="){
                    keywords += " \"";
                    keywords += annotation.HGVSp.substring(2);
                    keywords += "\"";
                }
            }

            return keywords;
        }

        $scope.openGoogleScholarLink = function(annotation){
            var search = keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open('https://scholar.google.co.uk/scholar?q=' + search, '_blank');
        };

        $scope.openClinVarLink = function(annotation){
            var search = keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open('http://www.ncbi.nlm.nih.gov/clinvar/?term=' + search, '_blank');
        };

        $scope.openPfamLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://pfam.xfam.org/family/' + accessions[i], '_blank');
            }
        };

        $scope.openPantherLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://www.pantherdb.org/panther/family.do?clsAccession=' + accessions[i], '_blank');
            }
        };

        $scope.openPrositeLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://prosite.expasy.org/' + accessions[i], '_blank');
            }
        };

        $scope.openSuperfamilyLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?sunid=' + accessions[i].replace('SSF', ''), '_blank');
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });
