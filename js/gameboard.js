var gameboardApp = angular.module('gameboardApp', [])
var socket = io('http://localhost:3000')


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

gameboardApp.controller('gameboardCtrl', function ($scope) {
  
  /********************************************************************************************************/
  /* card methods for extraction to card class                                                            */
  
  function newStackgroup(vars) {
    var stackgroup = {'display': 'default', xid: Math.trunc(Math.random() * 10000), 'zone':'board'}
    for(var k in vars) { card[k] = vars[k] }
    return stackgroup
  }
  
  function newCard(vars) {
    var card = {'x':100,'y':100,'z':0, 'xoffset': 0, 'yoffset': 0, 'rotation':0,
                'src': 'island1.jpg',  'flipped':false,
                'prev': null, 'next': null,
                'stackgroup': null
                }
    for(var k in vars) {
      card[k] = vars[k]
    }
    if (! card.stackgroup) {
      if (card.prev) {
        card.stackgroup = card.prev.stackgroup
      } else if (card.next) {
        card.stackgroup = card.next.stackgroup
      } else {
        card.stackgroup = newStackgroup()
      }
    }
    
    return card
  }
  
  function getBaseCard(card) {
    var c = card;    
    while (c.prev) {
      c = c.prev
    }
    return c
  }
  function getTopCard(card) {
    var c = card;    
    while (c.next) {
      c = c.next
    }
    return c
  }
  function getStackSize(card){
    var c = getBaseCard(card)
    var i = 0
    while (c.next) {
      i += 1
      c = c.next
    }
    return i
  }
  
  /* From the base card in a stack (the bottom card), move the other cards in the stack to display properly, either by...
     1) for a compact stack, moving each card slightly to the right.
     2) for a spread stack, moving each card down and to the right.
  */
  function repositionStack(stack) {
    if (stack.stackgroup.display == 'default') {
      if (getStackSize(stack) > 10 || stack.stackgroup.zone == 'fixed') {
        showStackAsCompact(stack)
      } else {
        showStackAsDefault(stack)
      }
    } else if (stack.stackgroup.display == 'spread') {
      showStackAsReverseDefault(stack)
    }
  }
  
  function offsetStackCards(stack, options) {
    var c = getBaseCard(stack)
    var i = 0
    var startxoffset = 0
    var startyoffset = 0
    var numCards = getStackSize(stack)
    if (options.reverse) {
      startxoffset = -numCards * options.xoffset
      startyoffset = -numCards * options.yoffset
    }
    
    // base card starts at 0
    c.xoffset = 0
    c.yoffset = 0
    
    while (c.next) {
      c = c.next
      i += 1
      c.x = c.prev.x
      c.y = c.prev.y
      c.z = c.prev.z + 1
      c.xoffset = startxoffset + i * options.xoffset
      c.yoffset = startyoffset + i * options.yoffset
    }
  }
  
  function showStackAsDefault(stack) {
    offsetStackCards(stack,{'xoffset':8, 'yoffset':15})
  }
  
  function showStackAsCompact(stack) {
    offsetStackCards(stack,{'xoffset':0.5, 'yoffset':0})
  }
  
  function showStackAsReverseDefault(stack) {
    offsetStackCards(stack,{'xoffset':8, 'yoffset':15, 'reverse': true})
  }

  function snapToGrid(card) {
    card = getBaseCard(card)
    
    var gridsize = 30,
        div = Math.floor(card.y / 30)

    if (card.y % gridsize > gridsize / 2) {
      card.y = (div + 1) * gridsize
    } else {
      card.y = div * gridsize
    }

    div = Math.floor(card.x / 30)
    if (card.x % gridsize > gridsize / 2) {
      card.x = (div + 1) * gridsize
    } else {
      card.x = div * gridsize
    }
    
    repositionStack(card)
  }
  
  function changeStack(card,vars) {
    card = getBaseCard(card)
    
    do {
      for(var k in vars) {
          card[k] = vars[k]
      }      
      card = card.next
    } while (card)    
  }
  
  function printStack(card) {
    var c = getBaseCard(card) 
    var i = 0
    do {
      console.log(i++,c)
      c = c.next
    } while (c)
  }
  
  function cardRotate(card, options) {
    var doStack = options.doStack
    var rotation = options.rotation
    if (doStack === undefined) {
      doStack = false
    }
    if (rotation == undefined) {
      rotation = (card.rotation == 0) ? 90 : 0
    }

    if (doStack) {
      changeStack(card,{'rotation':rotation})
    } else {
      card.rotation = rotation
    }
  }
  
  function cardSpread(card) {
    if (card.stackgroup.display == 'default') {
      card.stackgroup.display = 'spread'
    } else {
      card.stackgroup.display = 'default'
    }
    repositionStack(card)
  }

  function cardFlip(card, options) {
    var doStack = options.doStack
    var flipped = options.flipped
    if (doStack === undefined) {
      doStack = false
    }
    if (flipped == undefined) {
      flipped = ! card.flipped
    }

    if (doStack) {
      changeStack(card,{'flipped': flipped})
    } else {
      card.flipped = flipped
    }
  }
  
  function stackMove(stack, x, y) {
    var card = getBaseCard(stack)
    card.x += x
    card.y += y
    repositionStack(card)
  }
  
  
  function extractCard(card) {
    var oldstackcard = card.next || card.prev
    if (oldstackcard) {
      // connect up stack around card we are extracting
      if (card.next) {
        card.next.prev = card.prev
      }
      if (card.prev) {
        card.prev.next = card.next
      }

      // remove references to stack from card
      card.prev = null
      card.next = null
      card.stackgroup = newStackgroup()
    
      // since this card is a single, roll the x- and y-yoffset into x & y
      card.x = card.x + card.xoffset
      card.y = card.y + card.yoffset
      card.xoffset = 0
      card.yoffset = 0

      // redraw the old stack
      repositionStack(oldstackcard)
    }
  }
  
  function appendStack(stack, stackToAppend) {
    var stack1 = getTopCard(stack)
    var stack2 = getBaseCard(stackToAppend)
    
    stack1.next = stack2
    stack2.prev = stack1
    repositionStack(stack1)
    changeStack(stack2,{'stackgroup': stack1.stackgroup})
  }
  
  
  /********************************************************************************************************/
  /* default scopes                                                                                       */
  

  $scope.playernum = 0
  $scope.inverse = 0
  $scope.reflection = 1
  $scope.cards = []
  
  function addCards(cards) {
    Array.prototype.push.apply($scope.cards,cards)
  }
  
  function marshalCards(cards) {
    var cardsArray = angular.copy(cards)
    for (var i=0; i<cardsArray.length; i++) {
      delete cardsArray[i]['next']
      delete cardsArray[i]['prev']
      delete cardsArray[i]['stackgroup']
    }
    return cardsArray
  }
  
  function unmarshalCards(cardsArray) {
    var stackgroup = newStackgroup()
    var cards = angular.copy(cardsArray)
    for (var i=0; i<cards.length; i++) {
      cards[i].stackgroup = stackgroup
      if (i > 0) {
        cards[i].prev = cards[i-1]
      } else {
        cards[i].prev = null
      }
      if (i < cards.length - 1) {
        cards[i].next = cards[i+1]
      } else {
        cards[i].next = null
      }
    }
    return cards
  }
  

  function getMaxZ() {
    var maxZ = 0
    for (var i=0; i<$scope.cards.length; i++) {
      maxZ = Math.max(maxZ, $scope.cards[i].z)
    }
    return maxZ
  }

  function moveStackToFront(stack) {
    var card = getBaseCard(stack)
    card.z = getMaxZ() + 1
    repositionStack(card)
  }
  
  /********************************************************************************************************/
  /* import decks                                                                                         */

  
  $scope.importDeck = function(decklist) {
    var deckdefs = decklist.split("\n"),
        cards = [],
        row, results, numcards, cardname
    
    for (i=0;i<deckdefs.length;i++) {
      row = deckdefs[i]
      results = row.match(/^([0-9]+) (.+)/)
      
      if (results) {
        numcards = results[1]
        cardname = results[2]
        for (n=0;n<numcards;n++) {
          cards.push(cardname.toLowerCase() + ".jpg")
        }
      }
    }
    return cards
  }

  function putCardsOnBoard(cardimages,x,y) {
    var cards = []
    var card = null, prevcard = null
    for (var i=0; i<cardimages.length; i++) {
      card = newCard({'x':x,'y':y,'src':cardimages[i], 'prev':prevcard, 'next': null})
      cards.push(card)
      
      if (card.prev) {
        card.prev.next = card
      }
      prevcard = card
    }
    snapToGrid(card)
    addCards(cards)
    $scope.$apply()
    
    emit('addcards', marshalCards(cards))
  }

  var holder = document.querySelector('.zone-board')
  holder.ondragover = function(e) {
    e.preventDefault()
  }
  holder.ondrop = function (e) {
    e.preventDefault()

    var cards = []
    for (i=0;i<e.dataTransfer.files.length;i++) {
      var filename = e.dataTransfer.files[i].name
      if (filename.match(/\.txt$/)) {
        var fr = new FileReader()
        fr.onload = function(e1) {
          putCardsOnBoard($scope.importDeck(e1.target.result),e.x - 50, e.y - 75)
        }
        fr.readAsText(e.dataTransfer.files[i])
      } else {
        cards.push(filename)
      }
    }
    if (cards.length > 0) {
      putCardsOnBoard(cards,e.x - 50,e.y - 75)
    }
  }

  
  /********************************************************************************************************/
  /* interact event hooks                                                                                 */

  $scope.claim = function() {
    emit('claimFailed',[$scope.playernum])
  }
  $scope.claimFailed = function(otherplayernum) {
    if (otherplayernum == 0) {
      $scope.playernum = 1
      $scope.inverse = 1
      $scope.reflection = -1
    } else {
      $scope.playernum = 0
      $scope.inverse = 0
      $scope.reflection = 1
    }
    $scope.$apply()
  }
  
  $scope.cardOnStart = function(index, extract) {
    var card = $scope.cards[index]
    if (extract) {
      extractCard(card)
    }
    moveStackToFront(card)
    $scope.$apply()
  }
  
  $scope.cardOnMove = function(index, dx, dy) {
    var card = $scope.cards[index]
    stackMove(card, dx, dy)
    $scope.$apply()
  }
  
  $scope.cardOnEnd = function(index) {
    var card = $scope.cards[index]
    snapToGrid(card)
    $scope.$apply()
  }
  
  $scope.cardOnCardDrop = function(targetCardIndex, draggingCardIndex) {
    var targetcard = $scope.cards[targetCardIndex],
        draggingcard = $scope.cards[draggingCardIndex]
    
    appendStack(targetcard,draggingcard)
    $scope.$apply()
  }
  
  $scope.cardOnTap = function(index, dostack) {
    var card = $scope.cards[index]
    cardRotate(card, {'doStack': dostack})
    $scope.$apply()
  }

  $scope.cardOnDoubleTap = function(index, dospread, dostack) {
    var card = $scope.cards[index]
    if (dospread) {
      cardSpread(card)
    } else {
      cardFlip(card, {'doStack': dostack})
    }
    $scope.$apply()
  }
  
  $scope.cardOnZoneDrop = function(index, zone) {
    var card = $scope.cards[index]
    card.stackgroup.zone = zone
    if (zone == 'private') {
      // all cards in private zone start face up
      cardFlip(card,{'flipped':true, 'doStack': true})
      // all cards in private zone are snapped to y
      getBaseCard(card).y = 730
      snapToGrid(card)
    } else if (zone == "fixed") {
      // all cards in fixed zone are snapped to y
      getBaseCard(card).y = 730
      snapToGrid(card)
    }
    $scope.$apply()
  }
  
  
  // singular card stack events – every card stack is draggable
  interact('.card')
    .draggable({
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onstart: function(event) {
        $scope.cardOnStart(event.target.dataset.index, (! event.altKey))
        emit('cardOnStart', [event.target.dataset.index, (! event.altKey)])
      },
      onmove: function(event) {
        $scope.cardOnMove(event.target.dataset.index, $scope.reflection * event.dx, $scope.reflection * event.dy)
        emit('cardOnMove',[event.target.dataset.index, $scope.reflection * event.dx, $scope.reflection * event.dy])
      },
      onend: function(event) {
        $scope.cardOnEnd(event.target.dataset.index)
        emit('cardOnEnd',[event.target.dataset.index])
      }
    })
    .on('tap', function(event) {
      $scope.cardOnTap(event.currentTarget.dataset.index, event.altKey)
      emit('cardOnTap', [event.currentTarget.dataset.index, event.altKey])
    })
    .on('doubletap', function(event) {
      $scope.cardOnDoubleTap(event.currentTarget.dataset.index,event.shiftKey,event.altKey)
      emit('cardOnDoubleTap',[event.currentTarget.dataset.index,event.shiftKey,event.altKey])
    })
    
  // card stacks can be dropped on other card stacks */
  interact('.card').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.50,

    ondragenter: function (event) {
      var targetcard = getTopCard($scope.cards[event.target.dataset.index]),
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
    
      if (targetcard.stackgroup != draggingcard.stackgroup) {
        changeStack(targetcard,{'selected':true})
        $scope.$apply()
      }
    },
    ondragleave: function (event) {
      var targetcard = getTopCard($scope.cards[event.target.dataset.index]),
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      
      if (targetcard.stackgroup != draggingcard.stackgroup) {
        changeStack(targetcard,{'selected':false})
        $scope.$apply()
      }
    },
    ondrop: function (event) {
      var targetcard = $scope.cards[event.target.dataset.index],
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      if (targetcard.stackgroup != draggingcard.stackgroup) {
        changeStack(targetcard,{'selected':false})
        $scope.cardOnCardDrop(event.target.dataset.index,event.relatedTarget.dataset.index)
        emit('cardOnCardDrop',[event.target.dataset.index,event.relatedTarget.dataset.index])
      }
    },
  })
  
  // cards can be dropped on zones
  interact('.zone').dropzone({
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget,
          dropzoneElement = event.target

      if (! dropzoneElement.classList.contains("zone-board")) {
        dropzoneElement.classList.add('drop-target')
        draggableElement.classList.add('can-drop')
      }
    },
    ondragleave: function (event) {
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
    },
    ondrop: function (event) {
      var zone
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')

      if (event.target.classList.contains("zone-private")) {
        zone = 'private'
      } else if (event.target.classList.contains("zone-fixed")) {
        zone = 'fixed'
      } else {
        zone = 'board'
      }
      
      $scope.cardOnZoneDrop(event.relatedTarget.dataset.index, zone)
      emit('cardOnZoneDrop',[event.relatedTarget.dataset.index, zone])
    },
  })
  
  
  function emit(method, data) {
    socket.emit('game', { 'method': method, 'data': data})
  }
  
  socket.on('game', function(msg){
    console.log('got a message!', msg)
    if (msg.method == 'addcards') {
      addCards(unmarshalCards(msg.data))
    } else {
      $scope[msg.method].apply(this,msg.data)
    }
  })
  emit('claim',[])
})


  