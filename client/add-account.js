console.log('Hello World!');

const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/accounts';

form.addEventListener('submit', (event) => {
	event.preventDefault(); // stop default submission action so we can handle it

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

	 });

	window.location.assign("accounts.html");
});