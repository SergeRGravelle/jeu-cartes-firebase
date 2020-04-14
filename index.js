// Import stylesheets
import "./style.css";

// Firebase App (the core Firebase SDK) is always required
// and must be listed first
import * as firebase from "firebase/app";
import * as firebaseui from "firebaseui";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";  // Cloud Firestore
import "firebase/database";   // real-time database
import "firebase/storage";



// Global variables

const card = $(".card");
const table = $("#table");
var selected = null;
var selectedlast = null;
var topz = 1;
const VAL = new Array("A","2","3","4","5","6", "7", "8", "9", "10", "J", "Q", "K", "J");
var cardsID = [];
var cardsOrder = [];
var rejects = [];
var cardsPosDataObjects = {};

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCOWNTKuXBnsexSrXsgrDqFas7fh4M26C8",
  authDomain: "jeu-cartes-firebase.firebaseapp.com",
  databaseURL: "https://jeu-cartes-firebase.firebaseio.com",
  projectId: "jeu-cartes-firebase",
  storageBucket: "jeu-cartes-firebase.appspot.com",
  messagingSenderId: "1061076344801",
  appId: "1:1061076344801:web:3161788f02338ea36a7ca0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
var database = firebase.database();
// Create a reference with an initial file path and name
var storage = firebase.storage();

/*  --- TESTS WAYS OF ADDINT DATA TO A REALTIME DATABASE IN FIREBASE  ----
  // test writing data to realtime database
  database.ref("game123/deck/").set( {
                    card1 : {id:"6C",posx:10,posy:15},
                    card2 : {id:"7H",posx:12,posy:15}
                    });

  // test update one property
  database.ref("game123/deck/card1").update({posy:100});

  // test add a record using push
  database.ref("game123/deck/").push( {
                    card3 : {id:"9H",posx:50,posy:60}
  });

  // test list of objects
  var dataToImport = {};
  for (var i=0; i<5; i++) {
    dataToImport["card"+i] = {id:i, posx:i*2};
  }
  database.ref("game123/listofobjects/").set(dataToImport);

  // debugger;
// --- TESTS WAYS OF ADDINT DATA TO A REALTIME DATABASE IN FIREBASE  ----  */

$(document).ready(function() {
   // Card image test (testing firebase storage functionality)
  setCardImage("Playing_card_club_A.svg","cardimage");
  
  prepTableMemoryGame();
  genDeck();

  var elem = document.getElementsByClassName("card");
  for (var i = 0; i < elem.length; i++) {
    elem[i].addEventListener("touchmove", function(e) {
      selectCard(e, this);
    });
    //    elem[i].addEventListener("mousedown mousemove", function(e) {selectCard(e, this)});
    elem[i].addEventListener("touchend", function(e) {
      unselectCard(e, this);
    });
    //    elem[i].addEventListener("mouseup", function(e) {unselectCard(e, this)});
    elem[i].addEventListener("click", function(e) {
      flipCard(e, this);
    });


  }

  document.getElementById("shuffle").addEventListener("click", testShuffle);
  document.getElementById("showcards").addEventListener("click", showCards);
  document.getElementById("order").addEventListener("click", function() {
    cardsOrder.sort(function(a, b) {
      return a - b;
    });
  });
  document.getElementById("flip").addEventListener("click", flipAll);
});


/**
 * Set the image stored in the Firebase storage to an image getElementById
 * Process errors correctly
 * 
 */
function setCardImage(imagename, elemID) {

  // Create a reference to the file we want to download
  var storageRef = storage.ref();
  var cardsRef = storageRef.child('cards');
  var imageRef = cardsRef.child(imagename);
  
 // Get the download URL
  imageRef.getDownloadURL().then(function(url) {
    var img = document.getElementById(elemID);
    img.src = url;
  }).catch(function(error) {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/object-not-found':
        console.log("File doesn't exist");
        break;
      case 'storage/unauthorized':
        console.log("User doesn't have permission to access the object");
        break;
      case 'storage/canceled':
        console.log("User canceled the upload");
        break;
      case 'storage/unknown':
        console.log("Unknown error occurred, inspect the server response");
        break;
    }
  });

}

/**
 * Select card 
 */
function selectCard(e, t) {
  var posx = parseInt( e.touches[0].clientX - table.position().left - ($(t).outerWidth() * 3) / 4 ) + "px";
  var posy = parseInt( e.touches[0].clientY - table.position().top - ($(t).outerHeight() * 3) / 4 ) + "px";
  var posz = $(t).css("z-index");
  $("#info").text( "INFO: selected " + $(t).text() + " @ (" + posx + ", " + posy + ", " + posz + ")" );

  $(t).css({ left: posx, top: posy });
  if (selected != selectedlast) {
    $(t).css({ "z-index": topz++ });
  }
  selected = $(t);
  selectedlast = selected;
}

function unselectCard(e, t) {
  $("#info").text("INFO:");
  selected = null;

  updateTable();
}

function prepTableMemoryGame() {
  for (var j = 0; j < 4; j++) {
    var newreject = $("<div></div>").text("joueur " + parseInt(j + 1));
    rejects.push("#reject" + j);
    newreject.attr("id", "reject" + j);
    newreject.addClass("reject");
    newreject.css({ top: parseInt(10 + j * 100) + "px" });
    table.append(newreject);
  }
}

function updateTable() {
  for (var i = 0; i < rejects.length; i++) {
    var count = 0;
    for (var j = 0; j < cardsID.length; j++) {
      if (checkInside("#" + cardsID[cardsOrder[j]], rejects[i])) {
        count++;
      }
    }
    $(rejects[i]).text("Joueur " + parseInt(i + 1) + ": " + count);
  }
}

function checkInside(item, region) {
  // console.log("%s %s", item, region);
  // console.log("%s", $(item).text() );

  var r_top = $(region).position().top;
  var r_left = $(region).position().left;
  var r_right = r_left + $(region).outerWidth();
  var r_bottom = r_top + $(region).outerHeight();

  var item_x = $(item).position().left + $(item).outerWidth() / 2;
  var item_y = $(item).position().top + $(item).outerHeight() / 2;

  var inside = false;
  if (
    item_x >= r_left &&
    item_x <= r_right &&
    item_y > r_top &&
    item_y < r_bottom
  ) {
    inside = true;
  }

  //  console.log("%s %i %i %i %i  %s %i %i  %s", region, r_left, r_right, r_top,  r_bottom, item, item_x, item_y, inside.toString());

  return inside;
}

function flipAll() {
  for (var j = 0; j < cardsID.length; j++) {
    var elem = $("#" + cardsID[cardsOrder[j]]);
    if (elem.hasClass("highlight")) {
      elem.removeClass("highlight");
    } else {
      elem.addClass("highlight");
    }
  }
}

function flipCard(e, t) {
  if ($(t).hasClass("highlight")) {
    $(t).removeClass("highlight");
  } else {
    $(t).addClass("highlight");
  }
}

/* https://en.wikipedia.org/wiki/Playing_cards_in_Unicode */
function genDeck() {
  var c = 0;
  topz = 1;
  for (var j = 1; j <= 4; j++) {
    var sp = 25;
    var leftpos = 50;
    var toppos = 50;

    // diamond
    var newcard = $("<div></div>").text(VAL[j - 1] + " \u2666");
    cardsID.push(j + "D");
    cardsOrder.push(c++);
    newcard.attr("id", j + "D");
    newcard.addClass("card redcard");
    newcard.css({
      left: parseInt(leftpos + (j * sp) / 2) + "px",
      top: parseInt(toppos + j * sp) + "px"
    });
    newcard.css({ "z-index": topz++ });
    $("#deck").append(newcard);

    // hearts
    var newcard = $("<div></div>").text(VAL[j - 1] + " \u2665");
    cardsID.push(j + "H");
    cardsOrder.push(c++);
    newcard.attr("id", j + "H");
    newcard.addClass("card redcard");
    newcard.css({
      left: parseInt(leftpos + sp * 1 + (j * sp) / 2) + "px",
      top: parseInt(toppos + j * sp + sp / 8) + "px"
    });
    newcard.css({ "z-index": topz++ });
    newcard.css({ transform: "scale(1.1)"});
    $("#deck").append(newcard);

    // spades
    var newcard = $("<div></div>").text(VAL[j - 1] + " \u2660");
    cardsID.push(j + "S");
    cardsOrder.push(c++);
    newcard.attr("id", j + "S");
    newcard.addClass("card blackcard");
    newcard.css({
      left: parseInt(leftpos + sp * 2 + (j * sp) / 2) + "px",
      top: parseInt(toppos + j * sp + (sp * 2) / 8) + "px"
    });
    newcard.css({ "z-index": topz++ });
    newcard.css({transform: "rotate(5deg)"});
    $("#deck").append(newcard);

    // clubs
    cardsID.push(j + "C");
    cardsOrder.push(c++);
    var newcard = $("<div></div>").text(VAL[j - 1] + " \u2663");
    newcard.attr("id", j + "C");
    newcard.addClass("card blackcard");
    newcard.css({
      left: parseInt(leftpos + sp * 3 + (j * sp) / 2) + "px",
      top: parseInt(toppos + j * sp + (sp * 3) / 8) + "px"
    });
    newcard.css({ "z-index": topz++ }); 
    $("#deck").append(newcard);
  }
  $("#info").text(cardsOrder.toString());

  // cardsPosData
  for (var o of cardsID){
    cardsPosDataObjects[o] = {
                          "posx":parseInt($("#" + o).position().left), 
                          "posy":parseInt($("#" + o).position().top),
                          "posz":parseInt($("#" + o).css("z-index")),
                          "facedown":false  };

  }
  console.log(JSON.stringify(cardsPosDataObjects));
  database.ref("game123/cardpos/").set(cardsPosDataObjects) ;
  // debugger;
}

/**
 * Generates a random number between A and B
 *
 * @param {integer} A start number
 * @param {integer} B end number
 * @return {integer} a number between A & B inclusively
 * @customfunction
 */
function randomNb(a, b) {
  var min = Math.ceil(a);
  var max = Math.floor(b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function testShuffle() {
  var list = cardsOrder;
  var ln = list.length;

  $("#info").text(list.toString());

  for (var j = 0; j < 100; j++) {
    var n = randomNb(0, ln - 1);
    var section = list.pop();
    list.splice(n, 0, section);
    // console.log("n: %i, (%s)  list: %s ", n, section, list.toString());
    $("#info").text(list.toString());
  }

  cardsOrder = list;
}


/**
 * Layout position of cards on the table
 */
function showCards() {
  var topPos = 120;
  var leftPos = 30;
  var maxRow = 13;
  var numRow = 1;
  var topz = 1;
  
  // cardsPosData.length = 0;  // clear array

  for (var j = 0; j < cardsOrder.length; j++) {
   var elem = $("#" + cardsID[cardsOrder[j]]);
   cardsPosDataObjects[cardsID[cardsOrder[j]]] = {
                        "posx":parseInt(leftPos), 
                        "posy":parseInt(topPos),
                        "posz":topz++,
                        "facedown":elem.hasClass("highlight") } ;
                          // do not change "face-down"

    leftPos += elem.outerWidth();
    
    if (numRow++ >= maxRow) {
      numRow = 1;
      topPos += elem.outerHeight();
      leftPos = 30;
    }

  }
  //  console.log( JSON.stringify(cardsPosDataObjects) ); debugger;
  database.ref("game123/cardpos/").set(cardsPosDataObjects);

  updateCardsDisplayOnTable();
}


/**
 * Update the graphical display of the cards on the prepTable
 */
function updateCardsDisplayOnTable() {

  for (var o in cardsPosDataObjects){
    var elem = $("#" + o);
    // console.log("%s %i %i  %s", o, cardsPosDataObjects[o].posx, cardsPosDataObjects[o].posy, elem.text());
    elem.animate({ "left": cardsPosDataObjects[o].posx + "px", 
                  "top":  cardsPosDataObjects[o].posy + "px" });
    elem.css({ "z-index":  cardsPosDataObjects[o].posz });

    if (cardsPosDataObjects[o].facedown) {
      elem.addClass("highlight");
    } else {
      elem.removeClass("highlight");
    }
  }
  
  // debugger;
}