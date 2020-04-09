// Import stylesheets
import './style.css';

// Global variables

var card = $(".card");
var table = $("#table");
var selected = null;
var selectedlast = null;
var topz = 1;
var VAL = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "J"];
var cardsID=[];
var cardsOrder=[];
var rejects=[];

$(document).ready(function() {

  prepTableMemoryGame();
  genDeck();
  
  var elem = document.getElementsByClassName("card");  
  for (var i = 0; i < elem.length; i++) {
    elem[i].addEventListener("touchmove", function(e) {selectCard(e, this)});
//    elem[i].addEventListener("mousedown mousemove", function(e) {selectCard(e, this)});
    elem[i].addEventListener("touchend", function(e) {unselectCard(e, this)});
//    elem[i].addEventListener("mouseup", function(e) {unselectCard(e, this)});
    elem[i].addEventListener("click", function(e) {flipCard(e, this)});   
  }

  document.getElementById("shuffle").addEventListener("click", testShuffle);
  document.getElementById("showcards").addEventListener("click", showCards);
  document.getElementById("order").addEventListener("click", function(){cardsOrder.sort()});
  document.getElementById("flip").addEventListener("click", flipAll);
 
});


function selectCard(e, t) {
  var posx = parseInt(e.touches[0].clientX - table.position().left - $(t).outerWidth()*3/4 )  + "px";
  var posy = parseInt(e.touches[0].clientY - table.position().top  - $(t).outerHeight()*3/4 ) + "px";
  var posz = $(t).css("z-index");
  $("#info").text( "INFO: selected " + $(t).text() + " @ (" + posx + ", " + posy + ", " + posz + ")" );
  
  $(t).css({ left:  posx , top:  posy });  
  if (selected != selectedlast) {  
     $(t).css({ 'z-index': topz++ });  
  }
  selected = $(t);
  selectedlast = selected;
}

function unselectCard(e, t) {
  $("#info").text( "INFO:" );
  selected = null;
  
  updateTable();
}


function prepTableMemoryGame() {

  for (var j=0; j<4; j++) {    
     var newreject = $("<div></div>").text("joueur " + parseInt(j + 1));
     rejects.push("#reject"+j);
     newreject.attr('id', "reject"+j);
     newreject.addClass("reject");
     newreject.css({top : parseInt(10 + j*100) + "px"});
     table.append(newreject);
   }
}


function updateTable () {

  for (var i=0; i < rejects.length; i++) {
    var count = 0;
    for (var j=0; j < cardsID.length; j++) {
      if( checkInside(cardsID[cardsOrder[j]], rejects[i] ) ) { count++;}
    }  
  
    $(rejects[i]).text("Joueur " + parseInt(i+1) + ": " + count); 
  }
}

function checkInside(item, region) {
    // console.log("%s %s", item, region);
    // console.log("%s", $(item).text() );
    
    var r_top     = $(region).position().top ;
    var r_left    = $(region).position().left ;
	var r_right   = r_left + $(region).outerWidth();
	var r_bottom  = r_top + $(region).outerHeight();
    
    var item_x = $(item).position().left + $(item).outerWidth()/2;
    var item_y = $(item).position().top + $(item).outerHeight()/2;

    var inside = false;
    if (item_x >= r_left && item_x <= r_right && item_y > r_top && item_y < r_bottom) { inside = true;}

  //  console.log("%s %i %i %i %i  %s %i %i  %s", region, r_left, r_right, r_top,  r_bottom, item, item_x, item_y, inside.toString());
    
//    if (item_x >= r_left && item_x <= r_right) { inside = true;}
//      if (item_y >= r_bottom && item_y <= r_right) { inside = true;}
//    console.log("% i < %i  < %i ", r_left, item_x, r_right);
//    console.log("%s %i %i %i %i  %s %i %i  %s", region, r_left, r_right, r_top,  r_bottom, item, item_x, item_y, inside.toString());

    return inside;
}

function flipAll() {
  for (var j=0; j < cardsID.length; j++) {
    var elem = $(cardsID[cardsOrder[j]]);
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
  var c=0;
  topz = 1;
  for (var j=1; j < 14 ; j++) {
    var sp = 25;
    var leftpos = 50;
    var toppos = 50;
    
     // diamond
     var newcard = $("<div></div>").text( VAL[j -1] + " \u2666");
     cardsID.push("#"+j+"D");
     cardsOrder.push(c++);
     newcard.attr('id', j + "D");
     newcard.addClass("card redcard");
     newcard.css({left: parseInt(leftpos + j*sp/2) + "px", top : parseInt(toppos + j*sp) + "px"});
     newcard.css({ 'z-index': topz++ });
     $("#deck").append(newcard);
     
    // hearts
     var newcard = $("<div></div>").text( VAL[j -1] + " \u2665");
     cardsID.push("#"+j+"H");
     cardsOrder.push(c++);
     newcard.attr('id', j + "H");
     newcard.addClass("card redcard");
     newcard.css({left: parseInt(leftpos +sp*2 + j*sp/2) + "px", top : parseInt(toppos + j*sp + sp/8) + "px"});
     newcard.css({ 'z-index': topz++ });
     $("#deck").append(newcard);
     
    // spades
     var newcard = $("<div></div>").text( VAL[j -1] + " \u2660");
     cardsID.push("#"+j+"S");
     cardsOrder.push(c++);
     newcard.attr('id', j + "S");
     newcard.addClass("card blackcard");
     newcard.css({left: parseInt(leftpos + sp*4 + j*sp/2) + "px", top : parseInt(toppos + j*sp + sp*2/8) + "px"});
     newcard.css({ 'z-index': topz++ });
     $("#deck").append(newcard);

     // clubs
     cardsID.push("#"+j+"C");
     cardsOrder.push(c++);
     var newcard = $("<div></div>").text( VAL[j -1] + " \u2663");
     newcard.attr('id', j + "C");
     newcard.addClass("card blackcard");
     newcard.css({left: parseInt(leftpos + sp*6 + j*sp/2) + "px", top : parseInt(toppos + j*sp + sp*3/8) + "px"});
     newcard.css({ 'z-index': topz++ });
     $("#deck").append(newcard);
 }
 $("#info").text(cardsOrder.toString());
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
  
  $("#info").text( list.toString() );
  
  for (var j=0; j < 100; j++) {
    var n = randomNb(0, ln - 1);
    var section = list.pop();
    list.splice(n,0,section);
    // console.log("n: %i, (%s)  list: %s ", n, section, list.toString());
  $("#info").text( list.toString() );
  }
  
  cardsOrder = list;
}


function showCards() {
  var topPos = 120;
  var leftPos = 30;
  var maxRow = 13;
  var numRow = 1;
  var topz = 1;

  for (var j=0; j < cardsOrder.length; j++) {
  
    var elem = $(cardsID[cardsOrder[j]]);
//    console.log("left: %i  top: %i  elem: %s  j: %i  cardsOrder: %i  cardsID: %s", leftPos, topPos, elem.text(), j, cardsOrder[j], cardsID[cardsOrder[j]]);
    elem.animate({left: leftPos + "px", top: topPos + "px"});
    elem.css({ 'z-index': topz++ });  
     
       leftPos += $(cardsID[1]).outerWidth();
     
       if( numRow++ >= maxRow) {
         numRow=1; 
         topPos += $(cardsID[1]).outerHeight();
         leftPos = 30;
       }
       

  }
}