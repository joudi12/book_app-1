const express = require('express');
let app = express();
require('dotenv').config();
let cors = require('cors');
// const { response } = require('express');
app.use(cors());
const pg = require('pg');

const superagent = require('superagent');

const PORT = process.env.PORT ||3000;

const DATABASE_URL = process.env.DATABASE_URL;

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('./public'));




app.set('view engine', 'ejs');


app.get('/', indexRender);

function indexRender(req, res) {
    res.render('pages/index');
};

app.get('/searches/new', showform);

function showform(req, res) {
    res.render('pages/searches/new.ejs');
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

}


    app.get('*', (req, res) => {
        res.status(404).send('bage not found ')
    })


    
    let client = new pg.Client(DATABASE_URL);
   client.connect().then(() => {
        app.listen(PORT, () => {
          console.log('this is the listen ');
        });
        // app.listen(process.env.PORT || 5000);
      }).catch(err => {
        console.log('sorry there is a problem ', err);
      });