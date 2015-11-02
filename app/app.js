'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdatabase', [ 'ngRoute', 'variantdatabase.login', 'variantdatabase.report', 'variantdatabase.manage', 'variantdatabase.account'])

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

    .filter('convertVariantToRange', function() {
        return function (input) {

            var split1 = input.split(":");
            var split2 = split1[1].split(">");

            var refLength = split2[0].match(/\D/g).length;
            var altLength = split2[1].match(/\D/g).length;

            var startPosition = split2[0].replace(/\D/g, '');
            var endPosition = (startPosition - refLength) + altLength;

            return split1[0] + ":" + startPosition + "-" + endPosition;
        }
    })

    .filter('convertVariantToExAC', function() {
        return function (input) {

            var split1 = input.split(":");
            var split2 = split1[1].split(">");
            var startPosition = split2[0].replace(/\D/g, '');
            var refAllele = split2[0].replace(/\d/g, '');
            var altAllele = split2[1].replace(/\d/g, '');

            return split1[0] + '-' + startPosition + '-' + refAllele + '-' + altAllele;
        }
    })

    .filter('convertAnnotationToKeywordsSearch', function() {
        return function (input) {

            var allKeywords = [];
            var returnKeywords = '';
            var hash = {};

            for (var key in input) {
                if (input.hasOwnProperty(key)) {

                    if (input[key].hasOwnProperty('SymbolId')){
                        allKeywords.push(input[key].SymbolId);
                    }

                    if (input[key].hasOwnProperty('HGVSc')){
                        allKeywords.push(input[key].HGVSc);
                    }

                    if (input[key].hasOwnProperty('HGVSp')){
                        allKeywords.push(input[key].HGVSp);
                    }

                }
            }

            //make unique list
            for (var i = 0; i < allKeywords.length; i++){
                if (!(allKeywords[i] in hash)) { //it works with objects! in FF, at least
                    hash[allKeywords[i]] = true;
                    returnKeywords += "\"" + allKeywords[i] + "\" ";
                }
            }

            return returnKeywords;
        }
    })

    .controller('VariantInformationCtrl', function ($scope, $uibModalInstance, items, $window) {

        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];
        $scope.items = items;

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                noData: "",
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: false,
                showXAxis: false,
                showYAxis: true,
                "yAxis": {
                    "axisLabel": "Percentage Coverage"
                },
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500
            }
        };

        function keywordSearchFromAnnotationObjects(annotation){

            var allKeywords = [];
            var returnKeywords = '';
            var hash = {};

            for (var key in input) {
                if (input.hasOwnProperty(key)) {

                    if (input[key].hasOwnProperty('SymbolId')){
                        allKeywords.push(input[key].SymbolId);
                    }

                    if (input[key].hasOwnProperty('HGVSc')){
                        allKeywords.push(input[key].HGVSc.substring(2));
                    }

                    if (input[key].hasOwnProperty('HGVSp')){
                        allKeywords.push(input[key].HGVSp.substring(2));
                    }

                }
            }

            //make unique list
            for (var i = 0; i < allKeywords.length; i++){
                if (!(allKeywords[i] in hash)) { //it works with objects! in FF, at least
                    hash[allKeywords[i]] = true;
                    returnKeywords += "\"" + allKeywords[i] + "\" ";
                }
            }

            return returnKeywords;
        }

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
            $window.open('https://scholar.google.co.uk/scholar?q=' + keywordSearchFromAnnotationObject(annotation), '_blank');
        };

        $scope.openClinVarLink = function(annotation){
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

            $window.open('http://www.ncbi.nlm.nih.gov/clinvar/?term=' + keywordSearchFromAnnotationObject(annotation), '_blank');
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
