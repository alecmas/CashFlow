const API_URL = 'http://localhost:5000/transactions';
const transactionsElement = document.querySelector('.transactions');
const saveEditButton = document.querySelector('.save-edit');
const transactionButtonsElement = document.querySelector('.transaction-buttons');
const statusElement = document.querySelector('.status');
const loadingElement = document.querySelector('.loading');

// asynchronous function to GET the transactions from the database before trying to display them
async function getTransactions() {
	loadingElement.style.display = '';

	var transactionsMap = {};

	const response = await fetch(API_URL)
	.then(response => response.json())
	.then(transactions => {
		transactions.forEach(transaction => {
			// save transaction to map
			var transactionObject = { 
				'transactionDate': transaction.transactionDate,
				'category': transaction.category,
				'vendor': transaction.vendor,
				'description': transaction.description,
				'amount': transaction.amount
			};
			
			transactionsMap[transaction._id] = transactionObject;
		});
	});

	return transactionsMap;
}

// builds tables from distinct categories of accounts
function buildTable() {
	const table = document.createElement('table');
	table.className = 'transactions-table';

	const caption = document.createElement('caption');
	caption.textContent = 'Transactions';

	const headerRow = document.createElement('tr');

	const headerTransactionDate = document.createElement('th');
	headerTransactionDate.textContent = 'Transaction Date';

	const headerCategory = document.createElement('th');
	headerCategory.textContent = 'Category';

	const headerVendor = document.createElement('th');
	headerVendor.textContent = 'Vendor';

	const headerDescription = document.createElement('th');
	headerDescription.textContent = 'Description';

	const headerAmount = document.createElement('th');
	headerAmount.textContent = 'Amount';

	headerRow.appendChild(headerTransactionDate);
	headerRow.appendChild(headerVendor);
	headerRow.appendChild(headerDescription);
	headerRow.appendChild(headerCategory);
	headerRow.appendChild(headerAmount);
	table.appendChild(caption);
	table.appendChild(headerRow);

	transactionsElement.appendChild(table);

	return table;
}

// builds and returns a row for the given transaction object and using the database id as the row id name
function buildTransactionRow(id, transaction) {
	// create row element
	const row = document.createElement('tr');
	row.className = 'transaction-row';
	row.idName = id;

	// properties to display
	const properties = ['transactionDate', 'category', 'vendor', 'description', 'amount'];

	// for each (key, value) pair, create a cell in the row
	properties.forEach(property => {
		var cell = document.createElement('td');
		cell.className = property;
		cell.textContent = transaction[property];
		row.appendChild(cell);
	});

	return row;
}

// returns the total for the given transactions
function getTotal(transactions) {
	var total = 0;
	Object.entries(transactions).forEach(([id, transaction]) => {
		total += parseFloat(transaction.amount);
	});

	return total;
}

// build a row displaying the total amount for the given table
function buildTotalRow(table, total) {
	console.log(table);

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

// display transactions to the front-end
function displayTransactions(transactions) {
	transactionsElement.innerHTML = '';
	transactionButtonsElement.innerHTML = '';

	// if no transactions exist, show message saying so
	if(!transactions || Object.keys(transactions).length === 0) {
		const noTransactionsMessage = document.createElement('p');
		noTransactionsMessage.textContent = 'No transactions exist.';
		statusElement.appendChild(noTransactionsMessage);
	} else {
		// build table
		var table = buildTable();

		// add each transaction to the its corresponding category table
		Object.entries(transactions).forEach(([id, transaction]) => {
			const row = buildTransactionRow(id, transaction);
			table.appendChild(row);
		});

		// calculate total and append a total row
		var total = getTotal(transactions);
		buildTotalRow(table, total);
	}

	

	var addButton = document.createElement('button');
	addButton.className = 'button-primary add';
	addButton.textContent = 'Add Transaction';
	addButton.addEventListener("click", addButtonClick);
	transactionButtonsElement.appendChild(addButton);

	var editButton = document.createElement('button');
	editButton.className = 'button-primary edit';
	editButton.textContent = 'Edit Transactions';
	editButton.addEventListener("click", editButtonClick);
	transactionButtonsElement.appendChild(editButton);

	transactionButtonsElement.style.display = '';
	loadingElement.style.display = 'none';
}

// when add button is clicked, show form on this page to add transaction
function addButtonClick() {
	console.log('add clicked');

	var element = event.target;
	if (element.classList.contains('add')) {
		transactionsElement.innerHTML = '';
		transactionButtonsElement.innerHTML = '';
		statusElement.innerHTML = '';

		var form = document.createElement('form');
		form.className = 'transaction-form';
		form.setAttribute('autocomplete', 'off');

		var labelTransactionDate = document.createElement('label');
		labelTransactionDate.setAttribute('for', 'transaction-date');
		labelTransactionDate.textContent = 'Transaction Date';
		var inputTransactionDate = document.createElement('input');
		inputTransactionDate.className = 'u-full-width';
		inputTransactionDate.idName = 'transaction-date';
		inputTransactionDate.type = 'text';
		//inputTransactionDate.setAttribute('pattern', '[a-zA-Z]+');
		//inputTransactionDate.setAttribute('title', 'Only letters are allowed');
		inputTransactionDate.setAttribute('name', 'transaction-date');
		inputTransactionDate.setAttribute('required', 'required');

		var labelCategory = document.createElement('label');
		labelCategory.setAttribute('for', 'category');
		labelCategory.textContent = 'Category';
		var inputCategory = document.createElement('input');
		inputCategory.className = 'u-full-width';
		inputCategory.idName = 'category';
		inputCategory.type = 'text';
		//inputCategory.setAttribute('pattern', '[a-zA-Z][a-zA-Z\s]+');
		//inputCategory.setAttribute('title', 'Only letters are allowed');
		inputCategory.setAttribute('name', 'category');
		inputCategory.setAttribute('required', 'required');

		var labelVendor = document.createElement('label');
		labelVendor.setAttribute('for', 'vendor');
		labelVendor.textContent = 'Vendor';
		var inputVendor = document.createElement('input');
		inputVendor.className = 'u-full-width';
		inputVendor.idName = 'vendor';
		inputVendor.type = 'text';
		//inputVendor.setAttribute('pattern', '[a-zA-Z][a-zA-Z\s]+');
		//inputVendor.setAttribute('title', 'Only letters are allowed');
		inputVendor.setAttribute('name', 'vendor');
		inputVendor.setAttribute('required', 'required');

		var labelDescription = document.createElement('label');
		labelDescription.setAttribute('for', 'description');
		labelDescription.textContent = 'Description';
		var inputDescription = document.createElement('input');
		inputDescription.className = 'u-full-width';
		inputDescription.idName = 'description';
		inputDescription.type = 'text';
		//inputDescription.setAttribute('pattern', '[a-zA-Z]+');
		//inputDescription.setAttribute('title', 'Only letters are allowed');
		inputDescription.setAttribute('name', 'description');
		inputDescription.setAttribute('required', 'required');

		var labelAmount = document.createElement('label');
		labelAmount.setAttribute('for', 'amount');
		labelAmount.textContent = 'Amount';
		var inputAmount = document.createElement('input');
		inputAmount.className = 'u-full-width';
		inputAmount.idName = 'amount';
		inputAmount.type = 'number';
		inputAmount.setAttribute('min', '0.01');
		inputAmount.setAttribute('step', '0.01');
		inputAmount.setAttribute('name', 'amount');
		inputAmount.setAttribute('required', 'required');

		var buttonDiv = document.createElement('div');
		buttonDiv.style.textAlign = 'center';

		var saveAddButton = document.createElement('button');
		saveAddButton.className = 'button-primary';
		saveAddButton.textContent = 'Save Transaction';
		buttonDiv.appendChild(saveAddButton);

		form.appendChild(labelTransactionDate);
		form.appendChild(inputTransactionDate);
		form.appendChild(labelCategory);
		form.appendChild(inputCategory);
		form.appendChild(labelVendor);
		form.appendChild(inputVendor);
		form.appendChild(labelDescription);
		form.appendChild(inputDescription);
		form.appendChild(labelAmount);
		form.appendChild(inputAmount);
		form.appendChild(buttonDiv);
		transactionsElement.appendChild(form);

		form.addEventListener('submit', (submit) => {
 			// stop default submission action so we can handle it
			submit.preventDefault();

			console.log('form submitted');

			const formData = new FormData(form);
			const transactionDate = formData.get('transaction-date');
			const category = formData.get('category');
			const vendor = formData.get('vendor');
			const description = formData.get('description');
			const amount = formData.get('amount');
			
			const transaction = {
				transactionDate,
				category,
				vendor,
				description,
				amount
			};

			console.log(JSON.stringify(transaction));

			if (moment(transactionDate, 'MM/DD/YYYY',true).isValid()) {
				fetch(API_URL, {
					method: 'POST',
					body: JSON.stringify(transaction),
					headers: {
						'content-type': 'application/json'
					}
				})
				.then(response => response.json())
				.then(createdTransaction => {
				  	console.log(createdTransaction);

					// refresh accounts after add to db
				  	getTransactions().then(transactions => {
				  		displayTransactions(transactions);
				  	});
				});
			} else {
				var failMessage = document.createElement('p');
		  		failMessage.style.color = '#cf5353';
		  		failMessage.textContent = 'Please enter valid date mm/dd/yyyy';
		  		statusElement.appendChild(failMessage);
			}
		});
	}
}

// when edit button is clicked, convert amount fields to inputs to allow for changes
function editButtonClick() {
	console.log('edit clicked');
}

// GET the accounts then display them
getTransactions().then(transactions => {
	displayTransactions(transactions);
});