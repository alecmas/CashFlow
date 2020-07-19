const express = require('express');
const cors = require('cors');
const monk = require('monk');

const app = express();

const db = monk('localhost/cashflow'); // connect to the cashflow db
const accounts = db.get('accounts');


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: 'Meower!'
	});
});

app.get('/accounts', (req, res) => {
	accounts
		.find()
		.then(accounts => {
			res.json(accounts);
		});
});

function isValidAccount(account) {
	return account.institution && account.institution.toString().trim() !== '' &&
		account.accountType && account.accountType.toString().trim() !== '' &&
		account.amount && account.amount.toString().trim() !== '' &&
		account.category && account.category.toString().trim() !== '';
}

app.post('/accounts', (req, res) => {
	if (isValidAccount(req.body)) {
		// insert to db
		const account = {
			institution: req.body.institution.toString(),
			accountType: req.body.accountType.toString(),
			amount: req.body.amount.toString(),
			category: req.body.category.toString(),
			createdDate: new Date(),
			lastModifiedDate: new Date()
		};

		accounts
			.insert(account)
			.then(createdAccount => {
				if (res.statusCode !== 200) {
					res.json({
						failedStatus: res.statusCode
					});
					console.log('[SERVER] Insert failed with status ' + res.statusCode);
				} else {
					res.json(createdAccount);
					console.log('[SERVER] Insert succeeded with status ' + res.statusCode);
				}
			});
	} else {
		res.status(422);
		res.json({
			message: 'All fields are required.'
		});
	}
});

app.put('/accounts', (req, res) => {
	Object.entries(req.body).forEach(([id, amount]) => {
		accounts.update({_id: id}, {$set: {amount: amount.toString()}});
		accounts.update({_id: id}, {$set: {lastModifiedDate: new Date()}});
		console.log('[SERVER] Account ID ' + id + ' was successfully updated');
	});

	if (res.statusCode !== 200) {
		res.json({
			failedStatus: res.statusCode
		});
		console.log('[SERVER] Update failed with status ' + res.statusCode);
	} else {
		res.json({
			successStatus: res.statusCode
		});
		console.log('[SERVER] Update succeeded with status ' + res.statusCode);
	}
});

app.delete('/accounts', (req, res) => {
	console.log('Accound ID ' + req.body.id + ' deleted');
	accounts.remove({_id: req.body.id});

	if (res.statusCode !== 200) {
		res.json({
			failedStatus: res.statusCode
		});
		console.log('[SERVER] Delete failed with status ' + res.statusCode);
	} else {
		res.json({
			successStatus: res.statusCode
		});
		console.log('[SERVER] Delete succeeded with status ' + res.statusCode);
	}
});

app.listen(5000, () => {
	console.log('Listening on http://localhost:5000');
});