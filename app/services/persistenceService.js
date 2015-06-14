
app.service('persistenceService', ['idService', function (idService) {

	this.save = function (key, jsonToSave) {
		// TOD0 - persist somewhere
	}

	this.load = function (key) {
		// TODO - load from somewhere
	}

	this.remove = function (key) {
		// TODO - remove from somewhere
	}

	this.getKey = function () {
		// TODO - generate new globally unique key
	}

}]);