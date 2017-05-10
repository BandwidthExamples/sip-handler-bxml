module.exports = function (sequelize, DataTypes) {
	return sequelize.define('SIPBinding', {
		sipUri: {
			type: DataTypes.STRING,
			field: 'sip_uri',
			allowNull: false
		},
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
			primaryKey: true
		},
		bwEndpointId: {
			type: DataTypes.STRING,
			field: 'bw_endpoint_id',
			allNull: false
		},
		bwPhoneNumberId :{
			type: DataTypes.STRING,
			field: 'bw_phone_number_id',
			allNull: false
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
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			field: 'enabled',
			allowNull: false,
			defaultValue: true
		},
		deleted: {
			type: DataTypes.BOOLEAN,
			field: 'deleted',
			allowNull: false,
			defaultValue: false
		}
	});
};