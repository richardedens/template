/*global define, mango, angular, console */
(function () {
    'use strict';

    // Define main mango AngularJS app.
    var app = angular.module('mango', ['ui.bootstrap']);

    // Create a factory to get data from the database for the main mango controller.
    app.factory('mangoDataSource', function ($http) {
        var data = {
            name: 'Mango View'
        };
        return {
            fetch: function (name) {
                return data[name];
            }
        };
    });

    // Create the mango controller.
    app.controller('mango-heart', function ($scope, mangoDataSource) {
        $scope.name = mangoDataSource.fetch('name');
    });

    // Defining a dataview.
    app.directive('mangoDataview', function ($compile, mangoDataSource) {
        return {
            restrict: 'E',
            transclude: true,
            scope: { },
            controller: function ($scope, $element) {

                var scopes = [];

                if (typeof $element.attr('id') !== 'undefined') {
                    if (typeof $element.attr('action') !== 'undefined') {
                        // Async load actions
                        mango.actions.get($element.attr('action'), function (err, actions, args) {
                            // Async execute mango busines layer actions.
                            mango.actions.interperActions($element.attr('id'), actions, mango.hitch(this, function (result) {
                                var attribute, scopeid;
                                // Put the mango object values on the scope!
                                for (attribute in result.json) {
                                    if (result.json.hasOwnProperty(attribute)) {
                                        for (scopeid in scopes) {
                                            if (scopes.hasOwnProperty(scopeid)) {
                                                scopes[scopeid][attribute] = result.json[attribute];
                                            }
                                        }
                                    }
                                }
                                for (scopeid in scopes) {
                                    if (scopes.hasOwnProperty(scopeid)) {
                                        scopes[scopeid].mangoObject = result;
                                        scopes[scopeid].$digest();
                                    }
                                }
                            }));
                        }, this);
                    } else {
                        mango.logger.error('The mango dataview always need an action!');
                    }
                } else {
                    mango.logger.error('The mango dataview always need an ID tag!');
                }

                this.addScope = function (scope) {
                    scopes.push(scope);
                };

            },
            template: '<div class="mango-data-view" ng-transclude></div>',
            replace: true
        };
    });

    app.directive('mangoForm', function () {
        return {
            restrict: 'E',
            require: '^mangoDataview',
            transclude: true,
            scope: {},
            link: function (scope, element, attrs, controller) {
                controller.addScope(scope);
            },
            template: '<div><span>{{firstname}}</span><div ng-transclude></div></div>',
            replace: true
        };
    });

    // Make HTML components.
    app.directive('mangoTabs', function () {
        return {
            restrict: 'E',
            require: '^mangoDataview',
            transclude: true,
            scope: {},
            controller: function ($scope, $element) {
                var panes = $scope.panes = [];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                };

                this.addPane = function (pane) {
                    console.log(pane);
                    if (panes.length === 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                };
            },
            link: function (scope, element, attrs, controller) {
                controller.addScope(scope);
            },
            template:   '<div class="tabbable">{{firstname}}' +
                        '<ul class="nav nav-tabs">' +
                        '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' +
                        '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
                        '</li>' +
                        '</ul>' +
                        '<div class="tab-content" ng-transclude></div>' +
                        '</div>',
            replace: true
        };
    });

    app.directive('mangoTab', function () {
        return {
            require: '^mangoTabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function (scope, element, attrs, controller) {
                controller.addPane(scope);
            },
            template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',
            replace: true
        };
    });

    app.directive('mangoNav', function () {
        return {
            require: '^mangoTabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function (scope, element, attrs, controller) {
                controller.addPane(scope);
            },
            template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',
            replace: true
        };
    });

    app.directive('mangoView', function () {
        return {
            require: '^mangoTabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function (scope, element, attrs, controller) {
                controller.addPane(scope);
            },
            template: '<div class="mango-page" ng-transclude></div>',
            replace: true
        };
    });

    app.directive('mangoPageButton', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            controller: function ($scope, $element) {
                this.openPage = function (scope, element) {
                    var page, body;

                    page = angular.element('<div><mango-tabs><mango-tab title="tab1">content1</mango-tab><mango-tab title="tab2">content2</mango-tab></mango-tabs></div>');
                    page.css({
                        position: 'absolute',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'blue',
                        zIndex: '2'
                    });

                    body = angular.element(document).find('body').eq(0);

                    body.append(page);
                };
            },
            link: function (scope, element, attrs, controller) {
                scope.openPage = function () {
                    controller.openPage(scope, element);
                };
            },
            template: '<a href="" class="mango-page btn btn-primary" ng-click="openPage()">{{title}}</a>',
            replace: true
        };
    });

}());