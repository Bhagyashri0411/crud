const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true }
	},
	{ collection: 'usersdata' }
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model