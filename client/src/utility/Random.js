const randInt = (min, max) => {
	return Math.floor((max - min + 1) * Math.random() + min);
};

const randElement = (array) => {
	return array[randInt(0, array.length - 1)];
};

module.exports = { randInt, randElement };