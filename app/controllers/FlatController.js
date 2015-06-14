
app.controller('FlatController', ['$scope', '$location', 'idService', 'flatmateService', 'persistenceService',
		function ($scope, $location, idService, flatmateService, persistenceService) {
	$scope.rent;
	$scope.flat;
	$scope.rentalPeriod;
	$scope.flatmatePalette;
	$scope.costingPeriod;

	// Calculated

	$scope.calculatedTotal = 0;
	$scope.periods = data.rentalPeriods;
	$scope.roomPalette = data.roomPalette;
	$scope.results = {
		totalFlatArea: 0,
		flatmateSummary: 'None (0)'
	};
	$scope.flatmateAmounts = [];
	$scope.showWeighting = false;

	// Persistence

	$scope.key = null;

	$scope.setup = function () {
		var defaultFlat = $scope.getDefaultFlat();
		$scope.rent = defaultFlat.rent;
		$scope.flat = defaultFlat.flat;
		$scope.rentalPeriod = defaultFlat.period;
		$scope.flatmatePalette = defaultFlat.flatmates;
	}

	$scope.reset = function () {
		flatmateService.reset();
		$scope.setup();
		$scope.updateResults();
	}

	$scope.save = function() {
		if ($scope.key) {
			$scope.key = persistenceService.getKey();
			$location.search('id', $scope.key);
		}
		persistenceService.save($scope.key, $scope.serialize());
	}

	$scope.load = function() {
		$scope.key = ($location.search().id || null);
		if ($scope.key) {
			$scope.deserialize(persistenceService.load($scope.key));
		}
	}

	$scope.remove = function() {
		if ($scope.key) {
			persistenceService.remove($scope.key);
			$scope.key = null;
			$location.search('id', $scope.key);
		}
	}

	$scope.deserialize = function (obj) {
		flatmateService.reset();

		var defaultFlat = $scope.getDefaultFlat();
		obj = obj || {};

		$scope.rent = obj.rent || defaultFlat.rent;
		$scope.flat = obj.flat || defaultFlat.flat;
		$scope.rentalPeriod = obj.period || defaultFlat.period;
		$scope.costingPeriod = $scope.rentalPeriod;
		$scope.flatmatePalette = obj.flatmates || defaultFlat.flatmates;

		$scope.updateResults();
	}

	$scope.serialize = function () {
		return {
			flat: $scope.flat,
			rent: $scope.rent,
			period: $scope.rentalPeriod,
			flatmates: $scope.flatmatePalette
		};
	}

	// General Operations

	$scope.$watch('rentalPeriod', function (newVal) {
		$scope.costingPeriod = newVal;
		$scope.updateResults();
	});

	$scope.addFlatmateToPalette = function() {
		$scope.flatmatePalette.push(flatmateService.get());
		$scope.updateResults();
	}

	$scope.removeFlatmateFromPalette = function(index) {
		var user = $scope.flatmatePalette[index];
		$scope.flat.forEach(function (room) {
			$scope.removeFromArrayById(room.users, user);
		});
		$scope.flatmatePalette.splice(index, 1);
		$scope.updateResults();
	}

	$scope.addRoomToFlat = function (room) {
		var model = {
			id: idService.generate('room'),
			template: room,
			width: 3,
			height: 3,
			users: []
		};
		$scope.flat.push(model);
		$scope.updateResults();
	}

	$scope.removeFromArrayById = function (array, item) {
		var indexToRemove = -1;
		array.forEach(function (arrayItem, index) {
			if (arrayItem.id == item.id) {
				indexToRemove = index;
			}
		});
		if (indexToRemove >= 0) {
			array.splice(indexToRemove, 1);
		}
	}

	// Update

	$scope.updateResults = function () {
		var area = 0;
		var flatMates = [];
		var flatMatesFull = [];
		$scope.flat.forEach(function (room) {
			area += room.width * room.height;
			room.users.forEach(function (flatmate) {
				if (flatMates.indexOf(flatmate.name) < 0) {
					flatMates.push(flatmate.name);
				}
				var found = false;
				flatMatesFull.forEach(function (fmFull) {
					if (fmFull.id == flatmate.id) {
						found = true;
					}
				});
				if (!found) {
					flatMatesFull.push(flatmate);
				}
			});
		});

		// Area
		$scope.results.totalFlatArea = area;

		// Flatmate Summary
		var flatmateSummary = (flatMates.length > 0) ? flatMates.join(', ') : "None";
		flatmateSummary += " (" + flatMates.length + ")";
		$scope.results.flatmateSummary = flatmateSummary;

		// Costs
		$scope.flatmateAmounts = [];
		if (area > 0 && flatMates.length > 0) {
			var costPerMeterSq = $scope.rent / $scope.rentalPeriod.days * $scope.costingPeriod.days / area;
			var calAmountTotal = 0;
			// for each flatmate
			flatMatesFull.forEach(function (fm) {
				$scope.flatmatePalette
				var fmAmount = {
					name: fm.name,
					color: fm.color
				};
				var calculatedAmount = 0;
				// what amount of each room
				$scope.flat.forEach(function (room) {
					// add amount to total
					var numUsers = room.users.length;
					var roomArea = room.width * room.height;
					var roomCost = costPerMeterSq * roomArea;
					if (numUsers == 0) {
						// Empty rooms used by all!
						var roomCostPerUserAll = roomCost / flatMatesFull.length
						calculatedAmount += roomCostPerUserAll;
					} else {
						var roomCostPerUser = roomCost / numUsers;
						room.users.forEach(function (flatmate) {
							if (flatmate.id == fm.id) {
								calculatedAmount += roomCostPerUser;
							}
						});
					}
				});
				// save flatmate
				fmAmount.amount = Math.round(calculatedAmount * 100) / 100; // Round to 2dp
				calAmountTotal += fmAmount.amount;
				$scope.flatmateAmounts.push(fmAmount);
			});
			$scope.calculatedTotal = Math.round(calAmountTotal * 100) / 100; // Round to 2dp;
		}
	}

	$scope.getDefaultFlat = function () {
	
		var flatmatePalette = [];
		flatmatePalette.push(flatmateService.get());
		flatmatePalette.push(flatmateService.get());
		flatmatePalette.push(flatmateService.get());

		return {
			rent: 500,
			period: data.rentalPeriods[1],
			flatmates: flatmatePalette,
			flat: [
				{
					id: idService.generate('room'),
					template: data.roomPalette[1],
					width: 5,
					height: 5,
					users: []
				},
				{
					id: idService.generate('room'),
					template: data.roomPalette[0],
					width: 3,
					height: 4,
					users: [flatmatePalette[0]]
				},
				{
					id: idService.generate('room'),
					template: data.roomPalette[0],
					width: 3,
					height: 4,
					users: [flatmatePalette[1]]
				},
				{
					id: idService.generate('room'),
					template: data.roomPalette[0],
					width: 3,
					height: 4,
					users: [flatmatePalette[2]]
				},
				{
					id: idService.generate('room'),
					template: data.roomPalette[2],
					width: 3,
					height: 3,
					users: []
				}
			]
		};
	}

	$scope.setup();
	$scope.load();
}]);

var data = {
	rentalPeriods: [
		{
			name: 'day',
			days: 1
		},
		{
			name: 'week',
			days: 7
		},
		{
			name: 'fortnight',
			days: 14
		},
		{
			name: 'month',
			days: 30
		},
		{
			name: 'year',
			days: 365
		}
	],
	roomPalette: [
		{
			name: 'Bedroom',
			color: '#16a085',
			weighting: 1
		},
		{
			name: 'Living Area',
			color: '#d35400',
			weighting: 1
		},
		{
			name: 'Bathroom',
			color: '#8e44ad',
			weighting: 1
		},
		{
			name: 'Kitchen',
			color: '#c0392b',
			weighting: 1
		},
		{
			name: 'Garage',
			color: '#34495e',
			weighting: 0.5
		},
		{
			name: 'Outdoors',
			color: '#27ae60',
			weighting: 0.2
		}
	]
};