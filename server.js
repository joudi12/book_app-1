'use strict';
//----set up enviroment-------
const express = require('express');
let app = express();
require('dotenv').config();
let cors = require('cors');
const methodoverride = require('method-override');
app.use(cors());
const pg = require('pg');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
//-------- EJS -------------------------
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('./public'));
app.use(methodoverride('_method'));
app.set('view engine', 'ejs');

//-------------route -----------------
app.get('/', indexRender);
app.get('/searches/new', showform);
app.get('/books/:id', viewdetails);
app.put('/books/:id', updatebook);
app.delete('/books/:id', deletebook);
app.post('/books', createBook);
app.post('/searches', ceateSearch);
app.get('*', (req, res) => {
    res.status(404).send('bage not found ')
});

//...................................................
function indexRender(req, res) {
    let SQL = 'SELECT * from mybook;';
    return client.query(SQL)
        .then(results => res.render('pages/index', { results: results.rows }))
};


//...................................................
function showform(req, res) {
    res.render('pages/searches/new.ejs');
}


//...................................................
function viewdetails(req, res) {
    let SQL = 'SELECT * FROM mybook WHERE id=$1;';
    let val = [req.params.id];
    console.log(val);
    client.query(SQL, val)
        .then(result => {
            console.log(result.rows[0])
            res.render('pages/books/show', { view: result.rows[0] });
        })

}
//...................................................................
function updatebook(req, res) {
    console.log('1234');
    let ubdatedata = req.body;
    let SQL = `UPDATE  mybook SET title=$1, author=$2, isbn=$3, image_url=$4, descriptions=$5, bookshelf=$6 WHERE id=$7;`;
    let values = [ubdatedata.title, ubdatedata.authors, ubdatedata.isbn, ubdatedata.image_url, ubdatedata.description, ubdatedata.bookshelf, req.params.id];
    console.log('here valu', values);
    client.query(SQL, values)
        .then(res.redirect(`/books/${req.params.id}`))
}
//............................................................................
function deletebook(req, res) {
    let deletebook = req.body;
    let SQL = `DELETE FROM mybook WHERE id=$1;`;
    let val = [req.params.id];
    client.query(SQL, val).then(res.redirect('/'));
}
//..................................................................
function createBook(req, res) {

    let { title, authors, isbn, image_url, description, bookshelf } = req.body;
    let SQL = 'INSERT INTO mybook (title, author, isbn, image_url, descriptions, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
    let values = [title, authors, isbn, image_url, description, bookshelf];


    //  client.query(SQL, values)
    //   .then(res.render('pages/books/show', {view:result.rows[0]}));
    client.query(SQL, values).then(SQL = 'SELECT * FROM mybook WHERE isbn=$1;');
    values = [req.body.isbn];
    return client.query(SQL, values)
        .then(result => {
            res.redirect(`/books/${result.rows[0].id}`)
            console.log('wwwwwwwwww', result)
        })
    // .then(result => res.redirect(`/books/:${req.params.id}`));


}
//............................................................................

function ceateSearch(req, res) {

    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    console.log(req.body);
    console.log(req.body.search);

    if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
    if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }
    superagent.get(url)
        .then(val => val.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
        .then(results => {
            res.render('pages/searches/show.ejs', { searchResults: results });
            console.log(results);
        }).catch(() => {
            res.send('something went wrong..  ');
        })


}

//------------constracter---------------------------
function Book(val) {
    if (val.title) {

        this.title = val.title;
    } else { this.title = 'Not found' };

    if (val.imageLinks) {
        // if (!(/https:\/\//.test(val.imageLinks.thumbnail))) {
        //     this.img = 'https' + val.imageLinks.thumbnail.slice(4);
        // } else {
        //     this.image = val.imageLinks.thumbnail
        // }   
        this.image = val.imageLinks.thumbnail

    } else { this.image = `https://i.imgur.com/J5LVHEL.jpg` };

    if (val.authors) {
        this.authors = val.authors[0];
    } else { this.authors = 'Not found' }
    if (val.description) {
        this.description = val.description;
    } else { this.description = 'Not found' }
    this.isbn = val.industryIdentifiers ? `ISBN ${val.industryIdentifiers[0].identifier}` : 'No ISBN available';
    if (val.categories) {
        this.bookshelf = val.categories[0];
    }
    else { this.bookshelf = 'Not found'; }
}

//-----------------listinig-------------------
let client = new pg.Client(DATABASE_URL);
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`this is the listen ${PORT}`);
    });
    // app.listen(process.env.PORT || 5000);
}).catch(err => {
    console.log('sorry there is a problem ', err);
});