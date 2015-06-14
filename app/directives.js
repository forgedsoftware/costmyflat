
function addSimpleAppDirective(name, func) {
	angular.module('flat').directive(name, function () {
		return {
			restrict:'A',
			link: func
		};
	});
}

addSimpleAppDirective('autoCompleteCost', function ($scope, element, attrs) {
	var autocompleteCosts = [];
	for(var i = 0; i < 25; i++) {
		autocompleteCosts.push("$" + i * 100)
	}
	$(element).autocomplete({
		source: autocompleteCosts
	});
});

addSimpleAppDirective('flatmateDrag', function ($scope, element, attrs) {
	$(element).draggable({
		helper: "clone",
		start: function (event, ui) {
			$("#flat-container > .room").addClass("room-border");
		},
		stop: function (event, ui) {
			$("#flat-container > .room").removeClass("room-border");
		}
	});
});

addSimpleAppDirective('roomDrag', function ($scope, element, attrs) {
	$(element).draggable({
		helper: "clone",
		start: function (event, ui) {
			$("#flat-container").addClass("flat-border");
		},
		stop: function (event, ui) {
			$("#flat-container").removeClass("flat-border");
		}
	});
});

addSimpleAppDirective('sortableGrid', function ($scope, element, attrs) {
	var sortableIn;
	$(element).sortable({
		grid: [40, 40],
		start: function(e, ui) {
			ui.item.data('start', ui.item.index());
		},
		update: function(e, ui) {
			var start = ui.item.data('start'),
				end = ui.item.index();
			$scope.flat.splice(end, 0,
				$scope.flat.splice(start, 1)[0]);
			$scope.$apply();
		},
		receive: function(e, ui) { sortableIn = 1; },
		over: function(e, ui) { sortableIn = 1; },
		out: function(e, ui) { sortableIn = 0; },
		beforeStop: function(e, ui) {
			if (sortableIn == 0) {
				var room = angular.element(ui.item).scope().room;
				$scope.removeFromArrayById($scope.flat, room);
				ui.item.remove();
				$scope.updateResults();
				$scope.$apply();
			}
		}
	});
	$(element).disableSelection();
});

addSimpleAppDirective('sortableMembers', function ($scope, element, attrs) {
	var sortableIn;
	$(element).sortable({
		start: function(e, ui) {
			ui.item.data('start', ui.item.index());
		},
		update: function(e, ui) {
			var start = ui.item.data('start'),
				end = ui.item.index();
			$scope.room.users.splice(end, 0,
				$scope.room.users.splice(start, 1)[0]);
			$scope.$apply();
		},
		receive: function(e, ui) { sortableIn = 1; },
		over: function(e, ui) { sortableIn = 1; },
		out: function(e, ui) { sortableIn = 0; },
		beforeStop: function(e, ui) {
			if (sortableIn == 0) {
				var user = angular.element(ui.item).scope().user;
				$scope.removeFromArrayById($scope.room.users, user);
				ui.item.remove();
				$scope.updateResults();
				$scope.$apply();
			}
		}
	});
	$(element).disableSelection();
});

addSimpleAppDirective('roomDrop', function ($scope, element, attrs) {
	var sortableIn;
	$(element).droppable({
		accept: ".room-drag",
		drop: function(event, ui) {
			var roomTemplate = angular.element(ui.draggable).scope().room;
			$scope.addRoomToFlat(roomTemplate);
			$scope.$apply();
		}
	});
});

addSimpleAppDirective('roomResize', function ($scope, element, attrs) {
	$(element).resizable({
		connectWith: "#flat-container",
		grid: [30, 30],
		resize: function (event, ui) {
			var width = ui.element.width() / 30;
			var height = ui.element.height() / 30;
			$scope.room.width = width;
			$scope.room.height = height;
			$scope.updateResults();
			$scope.$apply();
		}
	});
});

addSimpleAppDirective('flatmateDrop', function ($scope, element, attrs) {
	$(element).droppable({
		accept: ".flatmate-drag-image",
		drop: function (event, ui) {
			var flatmate = angular.element(ui.draggable).scope().flatmate;
			if ($.inArray(flatmate, $scope.room.users) < 0) {
				$scope.room.users.push(flatmate);
				$scope.updateResults();
				$scope.$apply();
			}
		}
	});
});
