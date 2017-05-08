module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Binding', {
		sipUri: {
			type: DataTypes.STRING,
			field: 'sip_uri',
			allowNull: false
		},
		number: {
			type: DataTypes.STRING,
			field: 'number',
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			field: 'password',
			allowNull: false
		}
	});
};