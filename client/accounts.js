const API_URL = 'http://localhost:5000/accounts';
const accountsElement = document.querySelector('.accounts');
const addButton = document.querySelector('.add')
const editButton = document.querySelector('.edit');
const accountButtonsElement = document.querySelector('.account-buttons');
const statusElement = document.querySelector('.status');
const loadingElement = document.querySelector('.loading');

// object to hold accounts on back-end for later operations
var accountsMap = {};

// object to hold totals
var categoryTotalsMap = {};

function saveAccountToMap(account) {
	const accountObject = { 
		'institution': account.institution,
		'accountType': account.accountType,
		'amount': account.amount,
		'category': account.category,
		'updateFlag': 'N'
	};
	
	accountsMap[account._id] = accountObject;
}

function buildTable(categoryString) {
	const table = document.createElement('table');
	table.className = categoryString.toLowerCase();

	const caption = document.createElement('caption');
	caption.textContent = categoryString;

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

	return table;
}

// builds and returns a row for the given account object
function buildAccountRow(id, account) {
	// create row element
	const row = document.createElement('tr');
	row.className = 'account-row';
	row.idName = id;

	// for each (key, value) pair, create a cell in the row
	Object.entries(account).forEach(([key, value]) => {
		var cell = document.createElement('td');
		cell.className = key;
		cell.textContent = value;
		row.appendChild(cell);
	});

	return row;
}

function loadAccounts() {
	loadingElement.style.display = '';

	fetch(API_URL)
	.then(response => response.json())
	.then(accounts => {
		accounts.forEach(account => {
			// save account to back-end
			saveAccountToMap(account);
		});

		displayAccounts(accountsMap);
	});
	
}

function displayAccounts(accounts) {
	// if no accounts exist, show message
	if(!accounts || accounts.length == 0) {
		const noAccountsMessage = document.createElement('p');
		noAccountsMessage.textContent = 'No accounts exist';
		statusElement.appendChild(noAccountsMessage);
	} 
	// else, load the accounts
	else {
		Object.entries(accounts).forEach(([id, account]) => {
			console.log('hello');
			const categoryString = account.category.toString();
			console.log(categoryString);
			var table = document.querySelector('.' + categoryString.toLowerCase());

			// if table for the given category for the account has not been made yet, make it
			if (!table) {
				table = buildTable(categoryString);
				accountsElement.appendChild(table);
			} 
			
			// add the account to the its corresponding category table
			var accountDisplayObject = {
				'institution': account.institution,
				'accountType': account.accountType,
				'amount': account.amount
			};

			const row = buildAccountRow(id, accountDisplayObject);
			table.appendChild(row);

			// store amount in totals key value object
			if (!categoryTotalsMap.hasOwnProperty(categoryString.toLowerCase())) {
				categoryTotalsMap[categoryString.toLowerCase()] = parseFloat(account.amount);
			} else {
				categoryTotalsMap[categoryString.toLowerCase()] += parseFloat(account.amount);
			}
		});
	}

	// read all account category tables and append total rows
	const tables = document.querySelector('.accounts').querySelectorAll('table');

	tables.forEach(table => { 
		console.log(table.className);
		const row = document.createElement('tr');
		row.className = 'total-row';

		const cellBlank1 = document.createElement('td');

		const cellTotalLabel = document.createElement('td');
		cellTotalLabel.textContent = 'Total:';

		const cellTotalAmount = document.createElement('td');
		cellTotalAmount.idName = table.className;
		cellTotalAmount.className = 'total';
		cellTotalAmount.textContent = categoryTotalsMap[table.className].toFixed(2);

		row.appendChild(cellBlank1);
		row.appendChild(cellTotalLabel);
		row.appendChild(cellTotalAmount);
		table.appendChild(row);
	});

	console.log(categoryTotalsMap);
	console.log(accountsMap);

	// when edit button is clicked, convert cells to edit fields
	
	console.log(editButton);
	loadingElement.style.display = 'none';
}

loadAccounts();


editButton.addEventListener("click", editButtonClick);

function editButtonClick() {
	var element = event.target;
	if (element.classList.contains('edit')) {
		const accountRows = document.querySelectorAll('.account-row');
		console.log(accountRows);
		accountRows.forEach(accountRow => {
			console.log(accountRow.idName);

			const cellInstitution = accountRow.querySelector('.institution');
			const inputInstitution = document.createElement('input');
			inputInstitution.className = 'u-full-width institution-input';
			inputInstitution.type = 'text';
			inputInstitution.value = cellInstitution.textContent;
			cellInstitution.textContent = '';
			cellInstitution.appendChild(inputInstitution);

			const cellAccountType = accountRow.querySelector('.accountType');
			const inputAccountType = document.createElement('input');
			inputAccountType.className = 'u-full-width account-type-input';
			inputAccountType.type = 'text';
			inputAccountType.value = cellAccountType.textContent;
			cellAccountType.textContent = '';
			cellAccountType.appendChild(inputAccountType);

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
		const saveButton = document.createElement('button');
		saveButton.className = 'button-primary save';
		saveButton.textContent = 'Save Changes';
		saveButton.addEventListener("click", saveButtonClick);
		accountButtonsElement.appendChild(saveButton);
	}
}

// when save button is clicked, post changes to DB
function saveButtonClick() {
 	var element = event.target;
 	var saveAccountsMap = {}; // map to hold updated values

 	if (element.classList.contains('save')) {
 		loadingElement.style.display = '';

		console.log('I think it worked');
 		const accountRows = document.querySelectorAll('.account-row');
		accountRows.forEach(accountRow => {

			const id = accountRow.idName;

			const inputInstitution = accountRow.querySelector('.institution-input');
			const cellInstitution = accountRow.querySelector('.institution');

			// if the new value does not match the old value, it has been updated
			if (!(accountsMap[id].institution === inputInstitution.value)) {
				accountsMap[id].institution = inputInstitution.value;
				accountsMap[id].updateFlag = 'Y';
			}

			cellInstitution.textContent = inputInstitution.value;

			const inputAccountType = accountRow.querySelector('.account-type-input');
			const cellAccountType = accountRow.querySelector('.accountType');

			if (!(accountsMap[id].accountType === inputAccountType.value)) {
				accountsMap[id].accountType = inputAccountType.value;
				accountsMap[accountRow.idName].updateFlag = 'Y';
			}

			cellAccountType.textContent = inputAccountType.value;

			const inputAmount = accountRow.querySelector('.amount-input');
			const cellAmount = accountRow.querySelector('.amount');
			
			if (!(accountsMap[id].amount === inputAmount.value)) {
				// update total
				const category = accountsMap[id].category;
				categoryTotalsMap[category.toLowerCase()] -= parseFloat(accountsMap[id].amount); // subtract old amount
				categoryTotalsMap[category.toLowerCase()] += parseFloat(inputAmount.value); // add new amount
				
				accountsMap[id].amount = inputAmount.value;
				accountsMap[accountRow.idName].updateFlag = 'Y';
			}
 			
			cellAmount.textContent = inputAmount.value;

			inputInstitution.remove();
			inputAccountType.remove();
			inputAmount.remove();
 		});
		
		// refresh totals
		const totals = document.querySelectorAll('.total');
		console.log(totals);
		totals.forEach(total => {
			console.log(total.idName);
			total.textContent = categoryTotalsMap[total.idName].toFixed(2);
		});

 		console.log(JSON.stringify(accountsMap));

		//update db
		fetch(API_URL, {
			method: 'PUT',
			body: JSON.stringify(accountsMap),
			headers: {
				'content-type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(updatedAccounts => {
			loadingElement.style.display = 'none';
		  	console.log('client received update response');
		  	
		  	if (updatedAccounts.failedStatus) {
		  		console.log('Update failed with response status ' + updatedAccounts.failedStatus);
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
		});

 		element.style.display = 'none';
 		addButton.style.display = '';
 		editButton.style.display = '';
 	}
}

function deleteButtonClick() {
 	var element = event.target;

 	if (element.classList.contains('delete')) {
 		var confirmation = confirm('Are you sure you\'d like to delete this account?');
 		var id = element.parentElement.parentElement.idName;
 		if (confirmation) {
 			loadingElement.style.display = '';

 			var idObject = { 
 				'id': id
 			};

 			fetch(API_URL, {
 				method: 'DELETE',
 				body: JSON.stringify(idObject),
 				headers: {
 					'content-type': 'application/json'
 				}
 			})
 			.then(response => response.json())
 			.then(deletedAccount => {
 				loadingElement.style.display = 'none';

 				if (deletedAccount.failedStatus) {
			  		console.log('Delete failed with response status ' + deletedAccount.failedStatus);
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

 			// subtract amount from totals
 			var category = accountsMap[id].category.toLowerCase();
 			categoryTotalsMap[category] -= accountsMap[id].amount;

 			// remove the account row and account from map
 			element.parentElement.parentElement.remove();
 			delete accountsMap[id];
 			console.log(accountsMap);

 			// refresh totals
			const totals = document.querySelectorAll('.total');
			totals.forEach(total => {
				console.log(total.idName);
				total.textContent = categoryTotalsMap[total.idName].toFixed(2);
			});

 			console.log('Account deleted');
 		}
 	}
 }