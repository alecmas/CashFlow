const API_URL = 'http://localhost:5000/accounts';
const accountsElement = document.querySelector('.accounts');
const saveEditButton = document.querySelector('.save-edit');
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
	accountButtonsElement.innerHTML = '';

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

		// calculate totals and append a total row to each category table
		var totals = getTotals(accounts);
		var tables = document.querySelector('.accounts').querySelectorAll('table');
		tables.forEach(table => { 
			buildTotalRow(table, totals[table.className]);
		});
	}

	var addButton = document.createElement('button');
	addButton.className = 'button-primary add';
	addButton.textContent = 'Add Account';
	addButton.addEventListener("click", addButtonClick);
	accountButtonsElement.appendChild(addButton);

	var editButton = document.createElement('button');
	editButton.className = 'button-primary edit';
	editButton.textContent = 'Edit Accounts';
	editButton.addEventListener("click", editButtonClick);
	accountButtonsElement.appendChild(editButton);

	accountButtonsElement.style.display = '';
	loadingElement.style.display = 'none';
}

// when add button is clicked, show form on this page to add account
function addButtonClick() {
	var element = event.target;
	if (element.classList.contains('add')) {
		accountsElement.innerHTML = '';
		accountButtonsElement.innerHTML = '';
		statusElement.innerHTML = '';

		var form = document.createElement('form');
		form.className = 'account-form';
		form.setAttribute('autocomplete', 'off');

		var labelInstitution = document.createElement('label');
		labelInstitution.setAttribute('for', 'institution');
		labelInstitution.textContent = 'Institution';
		var inputInstitution = document.createElement('input');
		inputInstitution.className = 'u-full-width';
		inputInstitution.idName = 'institution';
		inputInstitution.type = 'text';
		// inputInstitution.setAttribute('pattern', '[a-zA-Z][a-zA-Z ]+');
		// inputInstitution.setAttribute('title', 'Only letters are allowed');
		inputInstitution.setAttribute('name', 'institution');
		inputInstitution.setAttribute('required', 'required');

		var labelAccountType = document.createElement('label');
		labelAccountType.setAttribute('for', 'account-type');
		labelAccountType.textContent = 'Account Type';
		var inputAccountType = document.createElement('input');
		inputAccountType.className = 'u-full-width';
		inputAccountType.idName = 'account-type';
		inputAccountType.type = 'text';
		// inputAccountType.setAttribute('pattern', '[a-zA-Z][a-zA-Z ]+');
		// inputAccountType.setAttribute('title', 'Only letters are allowed');
		inputAccountType.setAttribute('name', 'account-type');
		inputAccountType.setAttribute('required', 'required');

		var labelAmount = document.createElement('label');
		labelAmount.setAttribute('for', 'amount');
		labelAmount.textContent = 'Amount';
		var inputAmount = document.createElement('input');
		inputAmount.className = 'u-full-width';
		inputAmount.idName = 'amount';
		inputAmount.type = 'number';
		inputAmount.setAttribute('step', '0.01');
		inputAmount.setAttribute('name', 'amount');
		inputAmount.setAttribute('required', 'required');

		var labelCategory = document.createElement('label');
		labelCategory.setAttribute('for', 'category');
		labelCategory.textContent = 'Category';
		var inputCategory = document.createElement('input');
		inputCategory.className = 'u-full-width';
		inputCategory.idName = 'category';
		inputCategory.type = 'text';
		// inputCategory.setAttribute('pattern', '[a-zA-Z][a-zA-Z ]+');
		// inputCategory.setAttribute('title', 'Only letters are allowed');
		inputCategory.setAttribute('name', 'category');
		inputCategory.setAttribute('required', 'required');

		var buttonDiv = document.createElement('div');
		buttonDiv.style.textAlign = 'center';

		var saveAddButton = document.createElement('button');
		saveAddButton.className = 'button-primary';
		saveAddButton.textContent = 'Save Account';
		buttonDiv.appendChild(saveAddButton);

		form.appendChild(labelInstitution);
		form.appendChild(inputInstitution);
		form.appendChild(labelAccountType);
		form.appendChild(inputAccountType);
		form.appendChild(labelAmount);
		form.appendChild(inputAmount);
		form.appendChild(labelCategory);
		form.appendChild(inputCategory);
		form.appendChild(buttonDiv);
		accountsElement.appendChild(form);

		form.addEventListener('submit', (submit) => {
 			// stop default submission action so we can handle it
			submit.preventDefault();

			console.log('form submitted');

			const formData = new FormData(form);
			const institution = formData.get('institution');
			const accountType = formData.get('account-type');
			const amount = formData.get('amount');
			const category = formData.get('category');

			const account = {
				institution,
				accountType,
				amount,
				category
			};

			console.log(JSON.stringify(account));

			fetch(API_URL, {
				method: 'POST',
				body: JSON.stringify(account),
				headers: {
					'content-type': 'application/json'
				}
			})
			.then(response => response.json())
			.then(createdAccount => {
			  	console.log(createdAccount);

				// refresh accounts after add to db
			  	getAccounts().then(accounts => {
			  		displayAccounts(accounts);
			  	});
			 });
		});
	}
}

// when edit button is clicked, convert amount fields to inputs to allow for changes
function editButtonClick() {
	var element = event.target;
	if (element.classList.contains('edit')) {
		accountButtonsElement.innerHTML = '';
		statusElement.innerHTML = '';

		const accountRows = document.querySelectorAll('.account-row');
		accountRows.forEach(accountRow => {
			const cellAmount = accountRow.querySelector('.amount');
			const inputAmount = document.createElement('input');
			inputAmount.className = 'amount-input';
			inputAmount.type = 'number';
			inputAmount.setAttribute('min', '0.01');
			inputAmount.setAttribute('step', '0.01');
			inputAmount.setAttribute('name', 'amount');
			inputAmount.setAttribute('required', 'required');
			inputAmount.value = parseFloat(cellAmount.textContent).toFixed(2);
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

		var saveEditButton = document.createElement('button');
		saveEditButton.className = 'button-primary save-edit';
		saveEditButton.textContent = 'Save Changes';
		saveEditButton.addEventListener("click", saveEditButtonClick);

		accountButtonsElement.appendChild(saveEditButton);
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
function saveEditButtonClick() {
	var element = event.target;
 	if (element.classList.contains('save-edit')) {
 		accountButtonsElement.innerHTML = '';
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

	 		element.remove();

	 		var addButton = document.createElement('button');
			addButton.className = 'button-primary add';
			addButton.textContent = 'Add Account';
			addButton.addEventListener("click", addButtonClick);
			accountButtonsElement.appendChild(addButton);

			var editButton = document.createElement('button');
			editButton.className = 'button-primary edit';
			editButton.textContent = 'Edit Accounts';
			editButton.addEventListener("click", editButtonClick);
			accountButtonsElement.appendChild(editButton);
 		});
 	}
}

// function to DELETE account from the db
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

 			var saveEditButton = document.querySelector('.save-edit');
 			saveEditButton.remove();

	 		accountButtonsElement.style.display = '';
 		}
 	}
 }

// GET the accounts then display them
getAccounts().then(accounts => {
	displayAccounts(accounts);
});