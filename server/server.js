const express = require('express');
const cors = require('cors');
const monk = require('monk');

const app = express();

const db = monk('localhost/cashflow'); // connect to the cashflow db
const accounts = db.get('accounts');   // get accounts collection
const transactions = db.get('transactions');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: 'CashFlow Server'
	});
});

/***************** BEGIN ACCOUNTS *****************/
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
	console.log('Account ID ' + req.body.id + ' deleted');
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
/***************** END ACCOUNTS *****************/

/***************** BEGIN TRANSACTIONS *****************/
app.get('/transactions', (req, res) => {
	transactions
		.find()
		.then(transactions => {
			res.json(transactions);
		});
});

app.post('/transactions', (req, res) => {
	// insert to db
	const transaction = {
		transactionDate: req.body.transactionDate,
		category: req.body.category.toString(),
		vendor: req.body.vendor.toString(),
		description: req.body.description.toString(),
		amount: req.body.amount.toString(),
		createdDate: new Date(),
		lastModifiedDate: new Date()
	};

	transactions
		.insert(transaction)
		.then(createdTransaction => {
			if (res.statusCode !== 200) {
				res.json({
					failedStatus: res.statusCode
				});
				console.log('[SERVER] Insert failed with status ' + res.statusCode);
			} else {
				res.json(createdTransaction);
				console.log('[SERVER] Insert succeeded with status ' + res.statusCode);
			}
		});

});

app.put('/transactions', (req, res) => {
	Object.entries(req.body).forEach(([id, amount]) => {
		transactions.update({_id: id}, {$set: {amount: amount.toString()}});
		transactions.update({_id: id}, {$set: {lastModifiedDate: new Date()}});
		console.log('[SERVER] Transaction ID ' + id + ' was successfully updated');
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

app.delete('/transactions', (req, res) => {
	console.log('Transaction ID ' + req.body.id + ' deleted');
	transactions.remove({_id: req.body.id});

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
/***************** END TRANSACTIONS *****************/

app.listen(5000, () => {
	console.log('Listening on http://localhost:5000');
});