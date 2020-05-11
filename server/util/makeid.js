module.exports.makeid = function(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	return new Array(length).fill(null).map(() => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
}