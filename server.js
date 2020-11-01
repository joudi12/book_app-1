const express = require('express');
let app = express();
require('dotenv').config();
let cors = require('cors');
const { response } = require('express');
app.use(cors());

const superagent = require('superagent');

const PORT = process.env.port || 3000;

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

const GOOGL_EBOOK_API = process.env.GOOGL_EBOOK_API;


app.set('view engine', 'ejs');

// app.get('/index', showmain);

// function showmain(req, res) {
//     try {
//         res.render('pages/index.ejs');
//     } catch (error) {
//         res.send('something went wrong......')
//     }
// }

app.get('/', showform);

function showform(req, res) {
    try {
        res.render('pages/searches/new.ejs');
    } catch (error) {
        res.send('something went wrong......')
    }
}

app.post('/searches', ceateSearch);

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

function Book(value) {
    this.img = value.img || 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = value.title || 'no title available ';
    this.auther = value.authors[0] || 'no authors available ';
    this.des = value.description || 'no description available ';
}


app.get('*', (req, res) => {
    res.status(404).send('bage not found ')
})
app.listen(PORT, () => {
    console.log('listen to port 3000');
});