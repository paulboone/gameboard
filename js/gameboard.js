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
  
  function newCard(vars) {
    var card = {'x':100,'y':100,'z':0, 'xoffset': 0, 'yoffset': 0, 'rotation':0,
                'src': 'island1.jpg',  'flipped':false,
                'stack': null
                }
    for(var k in vars) {
      card[k] = vars[k]
    }
    
    return card
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
      changeStack(card.stack,{'rotation':rotation})
    } else {
      card.rotation = rotation
    }
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
      changeStack(card.stack,{'flipped': flipped})
      
    } else {
      card.flipped = flipped
    }
  }
  
  function extractCard(card) {
    var oldstack = card.stack
    if (oldstack.cards.length > 1) {
      var cardindex = findCardIndex(oldstack, card.oid)
      
      // remove from stack
      oldstack.cards.splice(cardindex,1)

      // card gets new stack
      card.stack = newStack()
      card.stack.cards.push(card)
    
      // since this card is a single, roll the x- and y-yoffset into x & y
      card.x = card.x + card.xoffset
      card.y = card.y + card.yoffset
      card.xoffset = 0
      card.yoffset = 0

      // redraw the old stack
      repositionStack(oldstack)
    }
  }
  

  /********************************************************************************************************/
  /* stack methods for extraction to stack class                                                            */
  
  function newStack(vars) {
    var stack = { 'cards': [], 'display': 'default', xid: Math.trunc(Math.random() * 10000)}
    for(var k in vars) { stack[k] = vars[k] }
    return stack
  }
  
  function findCardIndex(stack, oid) {
    for (var i=0; i<stack.cards.length; i++) {
      if (stack.cards[i].oid == oid) {
        return i
      }
    }
    console.log(stack, oid)
    throw "no card in stack"
  }
  
  
  function getBaseCard(stack) {
    return stack.cards[0]
  }
  function getTopCard(stack) {
    return stack.cards[stack.cards.length - 1]
  }
  function getStackSize(stack){
    return stack.cards.length
  }
  
  /* From the base card in a stack (the bottom card), move the other cards in the stack to display properly, either by...
     1) for a compact stack, moving each card slightly to the right.
     2) for a spread stack, moving each card down and to the right.
  */
  function repositionStack(stack) {
    if (stack.display == 'default') {
      if (getStackSize(stack) > 10 || stack.zone == 'fixed') {
        showStackAsCompact(stack)
      } else {
        showStackAsDefault(stack)
      }
    } else if (stack.display == 'spread') {
      showStackAsReverseDefault(stack)
    }
  }
  
  function offsetStackCards(stack, options) {
    var startxoffset = 0
    var startyoffset = 0
    var numCards = getStackSize(stack)
    if (options.reverse) {
      startxoffset = -numCards * options.xoffset
      startyoffset = -numCards * options.yoffset
    }
    
    // base card starts at 0
    var c = getBaseCard(stack)
    c.xoffset = 0
    c.yoffset = 0
    
    for (var i=0; i<stack.cards.length; i++) {
      c = stack.cards[i]
      c.x = stack.cards[0].x
      c.y = stack.cards[0].y
      c.z = stack.cards[0].z + i
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

  function snapToGrid(stack) {
    var card = getBaseCard(stack)
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
    
    repositionStack(stack)
  }
  
  function changeStack(stack,vars) {
    for (var i=0; i<stack.cards.length;i++) {
      for(var k in vars) {
        stack.cards[i][k] = vars[k]
      }
    }
  }
  
  function printStack(stack) {
    for (var i=0; i<stack.cards.length;i++) {
      console.log(i++,c)
    }
  }
  
  function stackSpread(stack) {
    if (stack.display == 'default') {
      stack.display = 'spread'
    } else {
      stack.display = 'default'
    }
    repositionStack(stack)
  }

  function stackMove(stack, x, y) {
    var card = getBaseCard(stack)
    card.x += x
    card.y += y
    repositionStack(stack)
  }
  
  function appendStack(stack, stackToAppend) {
    Array.prototype.push.apply(stack.cards, stackToAppend.cards)
    changeStack(stack,{'zone':stack.zone, 'stack': stack})
    repositionStack(stack)
  }
  
  /********************************************************************************************************/
  /* default scopes                                                                                       */
  
  $scope.cards = []
  $scope.stacks = []
  
  // function addCardArray(cardArray) {
  //   // link up cards
  //   for (var i=0;i<cardArray.length;i++) {
  //     if (i < cardArray.length - 1) {
  //       cardArray[i].next = cardArray[i + 1]
  //     }
  //     if (i >= 1) {
  //       cardArray[i].prev = cardArray[i - 1]
  //     }
  //   }
  //
  //   addCards(cardArray)
  // }
  
  function addStack(stack) {
    $scope.stacks.push(stack)
    for (var i=0; i<stack.cards.length; i++) {
      stack.cards[i].oid = $scope.cards.length
      $scope.cards.push(stack.cards[i])
    }
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
    repositionStack(stack)
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
    var stack = newStack()
    var card
    
    for (var i=0; i<cardimages.length; i++) {
      card = newCard({'x':x,'y':y,'src':cardimages[i], 'stack':stack})
      stack.cards.push(card)
    }
    
    snapToGrid(stack)
    addStack(stack)
    $scope.$apply()
    
    // console.log(JSON.stringify(cards))
    
    
    // socket.emit('game', cards)
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

  // singular card stack events – every card stack is draggable
  interact('.card')
    .draggable({
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onstart: function(event) {
        var card = $scope.cards[event.target.dataset.index]
        if (! event.altKey) {
          extractCard(card)
        }
        moveStackToFront(card.stack)
        $scope.$apply()
      },
      onmove: function(event) {
        var card = $scope.cards[event.target.dataset.index]
        stackMove(card.stack, event.dx, event.dy)
        $scope.$apply()
      },
      onend: function(event) {
        var card = $scope.cards[event.target.dataset.index]
        snapToGrid(card.stack)
        $scope.$apply()
      }
    })
    .on('tap', function(event) {
      var card = $scope.cards[event.currentTarget.dataset.index]
      cardRotate(card, {'doStack': event.altKey})
      $scope.$apply()
    })
    .on('doubletap', function(event) {
      var card = $scope.cards[event.currentTarget.dataset.index]
      if (event.shiftKey) {
        stackSpread(card.stack)
      } else {
        cardFlip(card, {'doStack': event.altKey})
      }
      $scope.$apply()
    })
    
  // card stacks can be dropped on other card stacks */
  interact('.card').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.50,

    ondragenter: function (event) {
      
      var targetcard = $scope.cards[event.target.dataset.index],
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      console.log('ondragenter', targetcard)
      changeStack(targetcard.stack,{'selected':true})
      $scope.$apply()
    },
    ondragleave: function (event) {
      console.log('ondragleave')
      var targetcard = $scope.cards[event.target.dataset.index],
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      
      changeStack(targetcard.stack,{'selected':false})
      $scope.$apply()
    },
    ondrop: function (event) {
      console.log('ondrop')
      var targetcard = $scope.cards[event.target.dataset.index],
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      
      changeStack(targetcard.stack,{'selected':false})
      appendStack(targetcard.stack,draggingcard.stack)
      $scope.$apply()
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
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')

      var card = $scope.cards[event.relatedTarget.dataset.index]
      
      if (event.target.classList.contains("zone-private")) {
        // all cards in private zone start face up
        changeStack(card.stack,{'zone': 'private','flipped':true})
        // all cards in private zone are snapped to y
        getBaseCard(card.stack).y = 730
        snapToGrid(card.stack)
      } else if (event.target.classList.contains("zone-fixed")) {
        changeStack(card.stack,{'zone':'fixed'})
        // all cards in private zone are snapped to y
        getBaseCard(card.stack).y = 730
        snapToGrid(card.stack)
      } else {
        changeStack(card.stack,{'zone':'board'})
      }

      $scope.$apply()
      console.log('Dropped on zone ', card.stack.zone)
    },
  })
  
  // socket.on('game', function(msg){
  //   console.log('got a message!', msg)
  //   cards = msg
  //   addCards(cards)
  //   $scope.$apply()
  // })
})

