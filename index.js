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
  database: "permalist",
  password: "IL0ve2Code!",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
