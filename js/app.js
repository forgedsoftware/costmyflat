
(function () {
	var app = angular.module('flat', ['ui.utils.masks']);

	app.controller('FlatController', ['$scope', function ($scope) {
		$scope.rent = 500;
		$scope.rentalPeriod;
		$scope.costingPeriod;
		$scope.calculatedTotal = 0;
		$scope.periods = rentalPeriods;
		$scope.roomPalette = roomPalette;
		$scope.flatmatePalette = flatmatePalette;
		$scope.results = {
			totalFlatArea: 0,
			flatmateSummary: 'None (0)'
		};
		$scope.flat = defaultFlat.flat;
		$scope.flatmateAmounts = [];

		$scope.deserialize = function (obj) {
			obj = obj || {};
			$scope.rent = obj.rent || 500;
			$scope.rentalPeriod = {}; // TODO!!

			$scope.updateResults();
		}

		$scope.serialize = function () {
			return {
				flat: $scope.flat,
				rent: $scope.rent,
				period: $scope.rentalPeriod.days
			};
		}

		$scope.$watch('rentalPeriod', function (newVal) {
			$scope.costingPeriod = newVal;
			$scope.updateResults();
		});

		$scope.addFlatmateToPalette = function() {
			addFlatMate();
			$scope.updateResults();
		}

		$scope.removeFlatmateFromPalette = function(index) { 
			$scope.flatmatePalette.splice(index, 1);
			$scope.updateResults();
		}

		$scope.addRoomToFlat = function (room) {
			var model = {
				id: generateID('room'),
				template: room,
				width: 3,
				height: 3,
				users: []
			};
			$scope.flat.push(model);
			$scope.updateResults();
		}

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

			// And... update!
			$scope.$digest();
		}
	}]);

	var rentalPeriods = [
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
	];

	var roomPalette = [
		{
			name: 'Bedroom',
			color: 'green'
		},
		{
			name: 'Living Area',
			color: 'blue'	
		},
		{
			name: 'Bathroom',
			color: 'blue'	
		},
		{
			name: 'Kitchen',
			color: 'blue'	
		},
		{
			name: 'Garage',
			color: 'orange'	
		},
		{
			name: 'Outdoors',
			color: 'red'
		}
	];

	var flatmatePalette = [];

	function rainbow(numOfSteps, step) {
		// This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distiguishable vibrant markers in Google Maps and other apps.
		// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
		// Adam Cole, 2011-Sept-14
		var r, g, b;
		var h = step / numOfSteps;
		var i = ~~(h * 6);
		var f = h * 6 - i;
		var q = 1 - f;
		switch(i % 6){
		    case 0: r = 1, g = f, b = 0; break;
		    case 1: r = q, g = 1, b = 0; break;
		    case 2: r = 0, g = 1, b = f; break;
		    case 3: r = 0, g = q, b = 1; break;
		    case 4: r = f, g = 0, b = 1; break;
		    case 5: r = 1, g = 0, b = q; break;
		}
		var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
		return (c);
	}

	var generateID = (function () {
		var globalIdCounter = 0;
		return function (baseStr) {
			return(baseStr + globalIdCounter++);
		}
	})();

	var addFlatMate = (function () {
		var defaultFlatMateNames = [ "Anna", "Ben", "Carol", "David", "Elizabeth", "Frank", 
		"Grace", "Henry", "Irene", "James", "Karen", "Lawrence", "Mary",
		"Nicholas", "Olivia", "Paul", "Queen", "Robert", "Sarah", "Thomas" ];
		var flatMatePosition = 0;
		return function () {
			var id = generateID('flatmate');
			flatmatePalette.push({
				id: id,
				name: defaultFlatMateNames[flatMatePosition],
				color: rainbow(defaultFlatMateNames.length, flatMatePosition)
			});
			flatMatePosition++;
			if (flatMatePosition >= defaultFlatMateNames.length) {
				flatMatePosition = 0;
			}
		}
	})();

	addFlatMate();
	addFlatMate();
	addFlatMate();

	var defaultFlat = {
		flat: [
			{
				id: generateID('room'),
				template: roomPalette[1],
				width: 5,
				height: 5,
				users: []
			},
			{
				id: generateID('room'),
				template: roomPalette[2],
				width: 3,
				height: 3,
				users: []
			},
			{
				id: generateID('room'),
				template: roomPalette[0],
				width: 3,
				height: 4,
				users: [flatmatePalette[0]]
			},
			{
				id: generateID('room'),
				template: roomPalette[0],
				width: 3,
				height: 4,
				users: [flatmatePalette[1]]
			},
			{
				id: generateID('room'),
				template: roomPalette[0],
				width: 3,
				height: 4,
				users: [flatmatePalette[2]]
			}
		]
	};



})();
