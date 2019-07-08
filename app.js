const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql');
const moment = require('moment');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'Guessbook'
});

connection.connect((e) => {
	if (e) {
		console.error(e)
	} else {
		console.log('connected as id ' + connection.threadId)
	}
})


//Middlewares
app.disable('x-powered-by')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

//Views Config
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

//Routes
app.get('/', (req, res) => {
	connection.query('SELECT title, content, created_at FROM books', (err, results) => {
		if (err) {throw err}
		if (results.length > 0) {
			  const books = results.map(book => Object.assign({}, book, {
			  created_at: moment(book.created_at).fromNow()
			}));

	       return res.render('index', {books})	
		} else {
			return res.render('index', {books: []})
		}
		
		
	})
})

app.get('/new-book', (req, res) => {
	res.render('new-book')
})

app.post('/new-book', (req, res) => {
	const {title, content} = req.body;
	if (!title || !content) {
		res.status(400).send('Entries must have a title and a content')
	} else {
		connection.query('INSERT INTO books SET title = ?, content = ? , created_at = ?', [title, content, new Date()], (err, results) => {
			if (err) { throw err}
			console.log(results)
			res.redirect('/')	
		})
	}
})

app.use((req, res) => {
	res.render('error')
})

app.listen(8080, () => console.log('Listenning on port 8080'))

