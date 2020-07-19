const API_URL = 'http://localhost:5000/accounts';
const accountsElement = document.querySelector('.accounts');
const addButton = document.querySelector('.add')
const editButton = document.querySelector('.edit');
const saveButton = document.querySelector('.save');
const accountButtonsElement = document.querySelector('.account-buttons');
const statusElement = document.querySelector('.status');
const loadingElement = document.querySelector('.loading');

// builds and returns a row for the given account object and using the database id as the row id name
function buildAccountRow(id, account) {
	// create row element
	const row = document.createElement('tr');
	row.className = 'account-row';
	row.idName = id;

	// properties to display
	const properties = ['institution', 'accountType', 'amount'];

	// for each (key, value) pair, create a cell in the row
	properties.forEach(property => {
		var cell = document.createElement('td');
		cell.className = property;
		cell.textContent = account[property];
		row.appendChild(cell);
	});

	return row;
}

// asynchronous function to GET the accounts from the database before trying to display them
async function getAccounts() {
	loadingElement.style.display = '';

	var accountsMap = {};

	const response = await fetch(API_URL)
	.then(response => response.json())
	.then(accounts => {
		accounts.forEach(account => {
			// save account to map
			var accountObject = { 
				'institution': account.institution,
				'accountType': account.accountType,
				'amount': account.amount,
				'category': account.category
			};
			
			accountsMap[account._id] = accountObject;
		});
	});

	return accountsMap;
}

// returns distinct categories for the given accounts, along with their properties
function getDistinctCategories(accounts) {
	var categories = {};
	Object.entries(accounts).forEach(([id, account]) => {
		if (!categories.hasOwnProperty(account.category)) {
			categories[account.category] = 1;
		} else {
			categories[account.category] += 1;
		}
	});

	return categories;
}

// builds tables from distinct categories of accounts
function buildTables(categories) {
	Object.entries(categories).forEach(([category, count]) => {
		const table = document.createElement('table');
		table.className = category.toLowerCase();

		const caption = document.createElement('caption');
		caption.textContent = category;

		const headerRow = document.createElement('tr');

		const headerInstitution = document.createElement('th');
		headerInstitution.textContent = 'Institution';

		const headerAccountType = document.createElement('th');
		headerAccountType.textContent = 'Account Type';

		const headerAmount = document.createElement('th');
		headerAmount.textContent = 'Amount';

		headerRow.appendChild(headerInstitution);
		headerRow.appendChild(headerAccountType);
		headerRow.appendChild(headerAmount);
		table.appendChild(caption);
		table.appendChild(headerRow);

		accountsElement.appendChild(table);
	});
}

// returns the totals of each distinct category for the given accounts
function getTotals(accounts) {
	var totals = {};
	Object.entries(accounts).forEach(([id, account]) => {
		if (!totals.hasOwnProperty(account.category.toLowerCase())) {
			totals[account.category.toLowerCase()] = parseFloat(account.amount);
		} else {
			totals[account.category.toLowerCase()] += parseFloat(account.amount);
		}
	});

	return totals;
}

// build a row displaying the total amount for the given table
function buildTotalRow(table, total) {
	const row = document.createElement('tr');
	row.className = 'total-row';

	const cellBlank = document.createElement('td');

	const cellTotalLabel = document.createElement('td');
	cellTotalLabel.textContent = 'Total:';

	const cellTotalAmount = document.createElement('td');
	cellTotalAmount.idName = table.className;
	cellTotalAmount.className = 'total';
	cellTotalAmount.textContent = total.toFixed(2);

	row.appendChild(cellBlank);
	row.appendChild(cellTotalLabel);
	row.appendChild(cellTotalAmount);
	table.appendChild(row);
}

// display accounts to the front-end
function displayAccounts(accounts) {
	accountsElement.innerHTML = '';

	// if no accounts exist, show message saying so
	if(!accounts || Object.keys(accounts).length === 0) {
		const noAccountsMessage = document.createElement('p');
		noAccountsMessage.textContent = 'No accounts exist.';
		statusElement.appendChild(noAccountsMessage);
	} else {
		// build tables from the distinct categories of accounts
		var categories = getDistinctCategories(accounts);
		buildTables(categories);

		// add each account to the its corresponding category table
		Object.entries(accounts).forEach(([id, account]) => {
			var table = document.querySelector('.' + account.category.toLowerCase());
			const row = buildAccountRow(id, account);
			table.appendChild(row);
		});
	}

	// calculate totals and append a total row to each category table
	var totals = getTotals(accounts);
	var tables = document.querySelector('.accounts').querySelectorAll('table');
	tables.forEach(table => { 
		buildTotalRow(table, totals[table.className]);
	});

	loadingElement.style.display = 'none';
}

// when edit button is clicked, convert amount fields to inputs to allow for changes
function editButtonClick() {
	var element = event.target;
	if (element.classList.contains('edit')) {
		const accountRows = document.querySelectorAll('.account-row');
		accountRows.forEach(accountRow => {
			const cellAmount = accountRow.querySelector('.amount');
			const inputAmount = document.createElement('input');
			inputAmount.className = 'amount-input';
			inputAmount.type = 'text';
			inputAmount.value = cellAmount.textContent;
			cellAmount.textContent = '';
			cellAmount.appendChild(inputAmount);

			// create trash can row for deletion
			const deleteIcon = document.createElement('i');
			deleteIcon.className = 'material-icons delete';
			deleteIcon.textContent = 'delete_forever';
			deleteIcon.style.color = 'red';
			deleteIcon.addEventListener("click", deleteButtonClick);
			cellAmount.appendChild(deleteIcon);
		});

		addButton.style.display = 'none';
		editButton.style.display = 'none';
		saveButton.style.display = '';
	}
}

// function to PUT account updates into the db
function putAccounts(updatedAccounts) {
	loadingElement.style.display = '';

	fetch(API_URL, {
		method: 'PUT',
		body: JSON.stringify(updatedAccounts),
		headers: {
			'content-type': 'application/json'
		}
	})
	.then(response => response.json())
	.then(updateStatus => {
		loadingElement.style.display = 'none';
	  	
		// refresh accounts after update to db
	  	getAccounts().then(accounts => {
	  		displayAccounts(accounts);
	  	});

	  	// show a status message for user feedback if an update attempt was made
	  	if (Object.keys(updatedAccounts).length !== 0) {
	  		if (updateStatus.failedStatus) {
		  		console.log('Update failed with response status ' + updateStatus.failedStatus);
		  		var failMessage = document.createElement('p');
		  		failMessage.style.color = '#cf5353';
		  		failMessage.textContent = 'Failed to update accounts.';
		  		statusElement.appendChild(failMessage);
		  		setTimeout(function() {
		  			failMessage.remove();
		  		}, 3000);
		  	} else {
		  		console.log('Update succeeded!');
		  		var successMessage = document.createElement('p');
		  		successMessage.style.color = '#53cf74';
		  		successMessage.textContent = 'Updated accounts successfully.';
		  		statusElement.appendChild(successMessage);
		  		setTimeout(function() {
		  			successMessage.remove();
		  		}, 3000);
		  	}
		}
	});
}

// when save button is clicked, post changes to the db
function saveButtonClick() {
	var element = event.target;
 	if (element.classList.contains('save')) {
 		loadingElement.style.display = '';

 		// get accounts from db for comparison
 		getAccounts().then(accounts => {
			// map to hold updated values
			var updatedAccounts = {};

	 		const accountRows = document.querySelectorAll('.account-row');
			accountRows.forEach(accountRow => {
				const id = accountRow.idName;
				const inputAmount = accountRow.querySelector('.amount-input');

				if (accounts[id].amount !== inputAmount.value) {
					updatedAccounts[id] = inputAmount.value;
				}
	 		});

			// perform update and refresh accounts
			putAccounts(updatedAccounts);

	 		element.style.display = 'none';
	 		addButton.style.display = '';
	 		editButton.style.display = '';
 		});
 	}
}

function deleteAccount(id) {
	fetch(API_URL, {
		method: 'DELETE',
		body: JSON.stringify(id),
		headers: {
			'content-type': 'application/json'
		}
	})
	.then(response => response.json())
	.then(updateStatus => {
		// refresh accounts after update to db
	  	getAccounts().then(accounts => {
	  		displayAccounts(accounts);
	  	});

		if (updateStatus.failedStatus) {
	  		console.log('Delete failed with response status ' + updateStatus.failedStatus);
	  		var failMessage = document.createElement('p');
	  		failMessage.style.color = '#cf5353';
	  		failMessage.textContent = 'Failed to delete account.';
	  		statusElement.appendChild(failMessage);
	  		setTimeout(function() {
	  			failMessage.remove();
	  		}, 3000);
		} else {
	  		console.log('Delete succeeded!');
	  		var successMessage = document.createElement('p');
	  		successMessage.style.color = '#53cf74';
	  		successMessage.textContent = 'Deleted account successfully.';
	  		statusElement.appendChild(successMessage);
	  		setTimeout(function() {
	  			successMessage.remove();
	  		}, 3000);
		}
	});
}

// when delete button is clicked, delete the account from the db
function deleteButtonClick() {
 	var element = event.target;
 	if (element.classList.contains('delete')) {
 		var confirmation = confirm('Are you sure you\'d like to delete this account?');

 		if (confirmation) {
 			loadingElement.style.display = '';
 			var id = element.parentElement.parentElement.idName;

 			// delete account and refresh accounts
 			deleteAccount({'id': id});

 			saveButton.style.display = 'none';
	 		addButton.style.display = '';
	 		editButton.style.display = '';
 		}
 	}
 }

// GET the accounts then display them
getAccounts().then(accounts => {
	displayAccounts(accounts);
});

editButton.addEventListener("click", editButtonClick);
saveButton.addEventListener("click", saveButtonClick);