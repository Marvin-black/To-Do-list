import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "yourcustompassword",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let allTasks;

// get all tasks in db and return it
async function getList(){
  const results = await db.query("SELECT * from items");
  return results.rows;
}


app.get("/", async (req, res) => {
  allTasks = await getList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: allTasks,
  });
  console.log(allTasks);
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  // insert item into db
  await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const editId = req.body.updatedItemId;
  const newTitle = req.body.updatedItemTitle;
  await db.query("UPDATE items SET title = $1 WHERE id = $2", [newTitle, editId]);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const deletedId = req.body.deleteItemId;
  // go delete task with this id
  await db.query("DELETE FROM items WHERE id = $1", [deletedId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
