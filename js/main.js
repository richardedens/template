/*global angular, $ */
(function () {
	'use strict';

	var app = angular.module('template', ['ui.bootstrap']);
	
	app.controller('templateController', ['$scope', function ($scope, $modal, $log) {
		$scope.double = function (value) {
			return value * 2;
		};

		$scope.openLogin = function (size) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'login.html',
				controller: 'templateController',
				size: size,
				resolve: {
					items: function () {
						return $scope.items;
					}
				}
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

	}]);

	$.cookieBar({
		message: 'We gebruiken cookies om u een goede website te bezorgen.', //Message displayed on bar
		acceptText: 'OK', //Text on accept/enable button
		zindex: 999999,
		append: true,
		fixed: true
	});

}());