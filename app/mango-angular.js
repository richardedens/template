/*global define, mango, angular, console, alert */
(function () {
	'use strict';

	// Define main mango AngularJS app.
	var app = angular.module('mango', ['ui.bootstrap']).config(function ($sceProvider) {
		// Completely disable SCE.  For demonstration purposes only!
		// Do not use in new projects.
		$sceProvider.enabled(false);
	});

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
			scope: { id: '@', action: '@' },
			controller: function ($scope, $element) {

				var scopes = [];

				if (typeof $scope.id !== 'undefined' && $scope.id !== null && $scope.id !== '') {
					if (typeof $scope.action !== 'undefined' && $scope.action !== null && $scope.action !== '') {
						// Async load actions
						mango.actions.get($scope.action, function (err, actions, args) {
							// Async execute mango busines layer actions.
							mango.actions.interperActions($scope.id, actions, mango.hitch(this, function (result) {
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

	// Contact form
	app.directive('mangoForm', function () {
		return {
			restrict: 'E',
			transclude: true,
			scope: { title: '@', id: '@', action: '@', table: '@' },
			controller: function ($scope, $element) {

				if (typeof $scope.id !== 'undefined' && $scope.id !== null && $scope.id !== '') {
					if (typeof $scope.table !== 'undefined' && $scope.table !== null && $scope.table !== '') {
						if (typeof $scope.action !== 'undefined' && $scope.action !== null && $scope.action !== '') {
							mango.client.table.get($scope.table, function (err, data) {
								if (err) {
									mango.logger.error('[component](' + $scope.id + '): ' + err);
									return;
								}
								mango.logger.log('[component](' + $scope.id + '): got META data from the table.');
								$scope.fields = data.fields;
								$scope.name = data.name;
								$scope.okButton = data.okButton;
								$scope.cancelButton = data.cancelButton;
								$scope.$digest();
							}, this);
						} else {
							mango.logger.error('The mango formview always need an action name!');
						}
					} else {
						mango.logger.error('The mango formview always need a table name!');
					}
				} else {
					mango.logger.error('The mango formview always need an ID tag!');
				}

				this.sendData = function () {
					alert('Sending data! ' + $scope.id);
				};

			},
			link: function (scope, element, attrs, controller) {
				scope.sendData = function () {
					controller.sendData(scope, element);
				};
			},
			template:	'<form onsubmit="return false;" method="POST">' +
						'    <input type="hidden" name="table" value="{{table}}">' +
						'    <input type="hidden" name="action" value="{{action}}">' +
						'    <h1>{{name}}</h1>' +
						'        <div ng-repeat="field in fields" class="form-group" ng-switch on="field.tag.name">' +
						'            <label for="{{id}}_{{field.name}}">{{field.label}}</label>' +
						'            <input ng-switch-when="input" class="form-control" id="{{id}}_{{field.name}}" type="{{field.tag.type}}" placeholder="{{field.tag.placeholder}}" />' +
						'            <textarea ng-switch-when="textarea" class="form-control" id="{{id}}_{{field.name}}" placeholder="{{field.tag.placeholder}}" />' +
						'        </div>' +
						'    <div class="recaptcha {{id}}"></div>' +
						'    <br>' +
						'    <button id="{{id}}_submit" ng-click="sendData()" class="btn btn-primary mx-submit">{{okButton}}</button>' +
						'</form>',
			replace: true
		};
	});

	app.directive('mangoImageGalary', function () {
		return {
			restrict: 'E',
			transclude: true,
			scope: { title: '@', id: '@', action: '@' },
			controller: function ($scope, $element) {

				if (typeof $scope.id !== 'undefined' && $scope.id !== null && $scope.id !== '') {
					if (typeof $scope.action !== 'undefined' && $scope.action !== null && $scope.action !== '') {
						// Async load actions
						mango.actions.get($scope.action, function (err, actions, args) {
							// Async execute mango busines layer actions.
							mango.actions.interperActions($scope.id, actions, mango.hitch(this, function (result) {
								var attribute, scopeid;
								// Put the mango object values on the scope!
								for (attribute in result.json) {
									if (result.json.hasOwnProperty(attribute)) {
										$scope[attribute] = result.json[attribute];
									}
								}
								$scope.$digest();
							}));
						}, this);
					} else {
						mango.logger.error('The mango image galary always need an action!');
					}
				} else {
					mango.logger.error('The mango image galary always need an ID tag!');
				}

				this.sendData = function () {
				};

			},
			link: function (scope, element, attrs, controller) {
				scope.sendData = function () {
					controller.sendData(scope, element);
				};
			},
			template: '<img src="{{src}}" alt="{{alt}}" width="{{width}}" height="{{height}}">',
			replace: true
		};
	});


	app.directive('mangoGoogleMaps', function ($compile) {
		return {
			restrict: 'E',
			transclude: true,
			scope: { title: '@', id: '@', action: '@' },
			controller: function ($scope, $element) {

				$compile.aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|file):/;

				if (typeof $scope.id !== 'undefined' && $scope.id !== null && $scope.id !== '') {
					if (typeof $scope.action !== 'undefined' && $scope.action !== null && $scope.action !== '') {
						// Async load actions
						mango.actions.get($scope.action, function (err, actions, args) {
							// Async execute mango busines layer actions.
							mango.actions.interperActions($scope.id, actions, mango.hitch(this, function (result) {
								var attribute, scopeid;
								// Put the mango object values on the scope!
								for (attribute in result.json) {
									if (result.json.hasOwnProperty(attribute)) {
										$scope[attribute] = result.json[attribute];
									}
								}
								$scope.$digest();
							}));
						}, this);
					} else {
						mango.logger.error('The mango image galary always need an action!');
					}
				} else {
					mango.logger.error('The mango image galary always need an ID tag!');
				}

				this.sendData = function () {
				};

			},
			link: function (scope, element, attrs, controller) {
				scope.sendData = function () {
					controller.sendData(scope, element);
				};
			},
			template: '<iframe id="{{id}}" src="{{url}}" width="{{width}}" height="{{height}}" frameborder="0" style="border:0"></iframe>',
			replace: true
		};
	});

}());