npm init -y (this is a node project command and initializes the package json)
npm install express morgan (express will listen for requests from client and respond; morgan is a middleware library to log incoming requests for debugging)

update package.json to have handy script "npm start" to start server

npm i --save-dev nodemon (nodemon will automatically refresh every time server is changed)

update package.json to have handy shortcut "npm run dev" to start nodemon refreshing server

npm i cors (express middleware to handle cors error which is an issue when allowing requests)

npi i monk (monk communicates with mongodb)


MongoDB Hints:
to use db, "use <db-name>"
to show dbs, "show dbs"
to show collections, "show collections"
to query collection, "db.<collection>.find()"
to delete item, "db.<collection>.remove({'property': 'value'})
