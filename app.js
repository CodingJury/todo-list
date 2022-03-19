const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-dhananjay:pass123@cluster0.0axng.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit submit to add new item."
});

const item3 = new Item({
    name: "Test Note"
});


const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



//----------HOME ROUTE----------------
app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems){
        if(err){
            console.log(err);
        }else{

            if(foundItems.length === 0){
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Succesfully inserted the default items!");
                    }
                });
                res.redirect("/");
            }else{
                res.render("list",{listTitle: "Today", newListItems: foundItems});
            }

        }
    });


});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    console.log(listName);

    const item = new Item({
        name: itemName
    });


    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
});


app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Item deleted checked item");
            }
        })
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(err){
                console.log(err);
            }else{
                res.redirect("/"+listName);
            }
        });
    }

    
});


//-----------DYNAMIC ROUTE--------------------
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(err){
            console.log(err);
        }else{
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect("/"+customListName);
            }else{
                //show an existing list
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
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
    console.log("Srever has started succesfully");
});