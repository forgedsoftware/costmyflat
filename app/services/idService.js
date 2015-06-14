
app.service('idService', [function () {

	var globalIdCounter = 0;

	this.generate = function (baseStr) {
		return(baseStr + globalIdCounter++);
	};

}]);