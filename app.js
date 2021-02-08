//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saniya:Test123@cluster0.yrqus.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema= {
  name: String
}

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome todo"
});
const item2=new Item({
  name:"add item"
});
const item3=new Item({
  name:"delete item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success!");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checked=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checked,function(err){
      if(!err){
        res.redirect("/");
      }
    });
    }
   else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
});

app.get("/:customName", function(req,res){
  const customName=_.capitalize(req.params.customName);
  List.findOne({name:customName},function(err,found){
    if(!err){
      if(!found){
        const list=new List({
          name: customName,
          items:defaultItems
        });
      
        list.save();
        res.redirect("/"+customName);
      }
      else{
        res.render("list",{listTitle:found.name,newListItems:found.items});
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3001, function() {
  console.log("Server started on port 3001");
});
