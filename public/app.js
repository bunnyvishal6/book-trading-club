(function () {
    var app = angular.module("book-trading", []);

    app.config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });

    app.controller("FeaturesCtrl", function () {
        this.features = [
            "Catalogue his/her books online",
            "See all the books other users own",
            "Request to borrow other users books",
            "Easily manage books and requests from  dashboard"
        ]
    });

    app.directive("features", function () {
        return {
            restrict: "E",
            templateUrl: 'features.html',
            controller: 'FeaturesCtrl',
            controllerAs: 'users'
        }
    });
})();