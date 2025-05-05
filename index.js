import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import { JSDOM } from "jsdom";
import jQuery from "jquery";

const dom = new JSDOM(`<html><body></body></html>`);

const { window } = dom;
const { document } = window;

const $ = jQuery(window);

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "library",
  password: "IL0ve2Code!",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM book ORDER BY rating DESC;");
    let books = result.rows;

    res.render("index.ejs", {
      listBooks: books,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/book/:bookTitle/:bookID", async (req, res) => {
  let bookID = req.params.bookID;
  let url = req.originalUrl;

  try {
    const result = await db.query("SELECT * FROM book WHERE id = ($1);", [
      bookID,
    ]);
    let bookSelected = result.rows;
    console.log(bookSelected);

    res.render("book.ejs", {
      book: bookSelected,
      url,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", (req, res) => {
  res.render("new.ejs");
});

app.post("/new", async (req, res) => {
  const bookQuery = req.body;
  // console.log(bookQuery);

  try {
    let result = await axios.get("https://openlibrary.org/search.json", {
      params: {
        q: bookQuery.newBook,
      },
    });
    let bookQueried = result.data.docs[0];
    console.log(bookQueried);
    try {
      await db.query(
        "INSERT INTO book (title, rating, date_read, author, cover_key, cover_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
        [
          bookQueried.title,
          bookQuery.rating,
          bookQuery.dateRead,
          bookQueried.author_name[0],
          "OLID",
          bookQueried.cover_edition_key,
        ]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (error) {
    console.log(error.response.data);
    res.status(500);
  }
});

app.post("/book/edit/:bookTitle/:bookID", async (req, res) => {
  let bookID = req.params.bookID;
  let url = req.originalUrl;

  try {
    const result = await db.query("SELECT * FROM book WHERE id = ($1);", [
      bookID,
    ]);
    let bookSelected = result.rows;
    console.log(bookSelected);

    res.render("book.ejs", {
      book: bookSelected,
      url,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/book/:bookTitle/:bookID/edited", async (req, res) => {
  let bookID = req.params.bookID;
  let bookTitle = req.params.bookTitle;
  let editedNotes = req.body["notes"];

  try {
    const result = await db.query(
      "UPDATE book SET notes = ($1) WHERE id = ($2);",
      [editedNotes, bookID]
    );

    res.redirect(`/book/${encodeURIComponent(bookTitle)}/${bookID}`);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
