require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Req Calls

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URL);

const itemsSchema = mongoose.Schema ({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to your todolist!"});
const item2 = new Item({name: "Hit submit to add new item."});
const item3 = new Item({name: "<<- hit to delete item."});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



//----------HOME ROUTE----------------
app.get("/", function(req, res){
    //Mongoose read
    Item.find({}, function(err, results){
      if (results.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Added succesfully.");
            res.redirect("/");
          }
        });
      } else {
        res.render("list", {listTitle: "Today", listItems: results});
      }
    });
  
  });

  app.post("/", function(req, res){

    const itemName = req.body.userInput;
    const listName = req.body.list;
  
    const item = new Item({name: itemName});
  
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  
  
  });
  


  app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully removed");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }
  
  
  });


//-----------DYNAMIC ROUTE--------------------
app.get("/:newListTab", function(req, res){
    const customListName = _.capitalize(req.params.newListTab);
  
    List.findOne({name: customListName}, function(err, results){
      if (err) {
        console.log(err)
      } else {
        if (!results) {
          const list = new List({name: customListName, items: defaultItems});
  
          list.save();
          res.redirect("/" + customListName);
  
        } else {
          res.render("list", {listTitle: results.name, listItems: results.items});
        }
      }
    });
  
  });


//----------ABOUT--------------------------
app.get("/about", function(req, res){
    res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server has started succesfully at port 3000");
});