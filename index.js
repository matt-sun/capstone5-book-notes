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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
