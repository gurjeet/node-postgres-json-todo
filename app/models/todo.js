var pg = require('pg.js'); 					// node-postgres-pure, for accessing Postgres
var database = require('../../config/database'); 			// load the database config

pg.defaults.poolSize = 1;

var connection_str = database.url; 	// connect to Postgres using URL from config/database.js

var postgres_todo_collection = {}; // "Collection" in MongoDB parlance is equivalent to a table in Postgres/YesSQL/RDBMS.

postgres_todo_collection.find = function(callback) {
	var query_all = 'select * from todo';

	pg.connect(connection_str, function(err, client, done) {

		if (err) {
			callback(/*new Error*/('error: Could not get a client from pool: ' + JSON.stringify(err)));
			return;
		}

		client.query( {name: 'read_todo_list', text: query_all}, function(err, result) {
			if (err) {
				done();	//Return client back to the pool
				callback(/*new Error*/('Could not fetch data from database: ' + JSON.stringify(err)));
				return;
			}

			done();	//Return client back to the pool

			/*
			 * result.rows is an array, so use map() function to assign IDs to the
			 * JSON objects and return an array of those objects.
			 *
			 * This is to emulate MongoDB's _id attribute assigned to every document.
			 */
			callback(null, result.rows.map(function(el) {
				el.document._id = el.id;
				return el.document;
			}));

			return;
		});

	});
}

postgres_todo_collection.create = function(todo_item, callback) {
	var insert_stmt = 'insert into todo(document) values($1) returning *';

	pg.connect(connection_str, function(err, client, done) {

		if (err) {
			callback(/*new Error*/ ('Could not get a client from pool: ' + JSON.stringify(err)));
			return;
		}

		client.query( {name: 'create_todo_item', text: insert_stmt, values: [JSON.stringify(todo_item)]}, function(err, result) {
			if (err) {
				done();	//Return client back to the pool
				callback(/*new Error*/('Could not insert todo-item into database: ' + JSON.stringify(err)));
				return;
			}

			done();	//Return client back to the pool

			/*
			 * Assign _id to the document.
			 *
			 * This is to emulate MongoDB's _id attribute assigned to every document.
			 */
			var doc = result.rows[0].document;
			doc._id = result.rows[0].id;

			callback(null, doc);

			return;
		});

	});
}

postgres_todo_collection.remove = function(item, callback) {
	var delete_stmt = 'delete from todo where id = $1 returning *';

	pg.connect(connection_str, function(err, client, done) {

		if (err) {
			callback(/*new Error*/('Could not get a client from pool: ' + JSON.stringify(err)));
			return;
		}

		client.query( {name: 'delete_todo_item', text: delete_stmt, values: [item._id]}, function(err, result) {
			if (err) {
				done();	//Return client back to the pool
				callback(/*new Error*/('Could not delete todo-item from database: ' + JSON.stringify(err)));
				return;
			}

			done();	//Return client back to the pool

			/*
			 * Assign _id to the document.
			 *
			 * This is to emulate MongoDB's _id attribute assigned to every document.
			 */
			var doc = result.rows[0].document;
			doc._id = result.rows[0].id;

			callback(null, doc);

			return;
		});

	});
}

module.exports = postgres_todo_collection;
