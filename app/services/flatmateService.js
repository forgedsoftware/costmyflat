
app.service('flatmateService', ['idService', function (idService) {

	var defaultFlatmateNames = [ "Anna", "Ben", "Carol", "David", "Elizabeth", "Frank", 
	"Grace", "Henry", "Irene", "James", "Karen", "Lawrence", "Mary",
	"Nicholas", "Olivia", "Paul", "Queen", "Robert", "Sarah", "Thomas" ];

	var flatmatePosition = 0;

	this.get = function () {
		var id = idService.generate('flatmate');
		var flatMate = {
			id: id,
			name: defaultFlatmateNames[flatmatePosition],
			color: rainbow(defaultFlatmateNames.length, flatmatePosition)
		};
		flatmatePosition++;
		if (flatmatePosition >= defaultFlatmateNames.length) {
			flatmatePosition = 0;
		}
		return flatMate;
	};

	this.reset = function () {
		flatmatePosition = 0;
	};

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
}]);