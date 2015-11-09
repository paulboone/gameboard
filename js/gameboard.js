var gameboardApp = angular.module('gameboardApp', [])

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
    var card = {'x':100,'y':100,'z':0, 'xoffset': 0, 'yoffset': 0,'src': 'island1.jpg', 'rotation':0, 'flipped':false, 'spread':false, 'prev': null, 'next': null}
    for(var k in vars) {
      console.log(k,card[k],vars[k])
        card[k] = vars[k]
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
  
  /* From the base card in a stack (the bottome card), move the other cards in the stack to display properly, either by.
     1) for a compact stack, moving each card slightly to the right.
     2) for a spread stack, moving each card down and to the right.
  */
  function redrawStack(stack) {
    var baseCard = getBaseCard(stack)
    var compact = getStackSize(baseCard) > 10
    
    if (compact || baseCard.zone == 'fixed') {
      showStackAsCompact(baseCard)
    } else {
      showStackAsDefault(baseCard)
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
    
      if (c.z > $scope.zcounter) {
        $scope.zcounter = c.z
        console.log("zcounter ",$scope.zcounter)
      }
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
    
    redrawStack(card)
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
  
  function cardPartOfStack(card,stack) {
    console.log("cardPartOfStack",card,stack)
    var c = getBaseCard(stack)    
    do {
      if (c.$$hashKey == card.$$hashKey) {
        console.log("match?",c,card, stack)
        return true
      }
      c = c.next
    } while (c)
    return false
  }
  
  function moveStackToFront(stack) {
    card = getBaseCard(stack)
    card.z = ++$scope.zcounter
    redrawStack(card)
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

    // if (card.zone != 'fixed') {
    if (doStack) {
      changeStack(card,{'rotation':rotation})
    } else {
      card.rotation = rotation
    }
    // }
    
  }
  
  function extractCard(card) {
    // connect up stack around card we are extracting
    var oldstackcard = null
    if (card.next) {
      oldstackcard = card.next
      card.next.prev = card.prev
    }
    if (card.prev) {
      oldstackcard = card.prev
      card.prev.next = card.next
    }

    // remove references to stack from card
    card.prev = null
    card.next = null
    
    // since this card is a single, roll the x- and y-yoffset into x & y
    console.log(card, card.x, card.xoffset, card.x + card.xoffset)
    card.x = card.x + card.xoffset
    card.y = card.y + card.yoffset
    card.xoffset = 0
    card.yoffset = 0
    console.log(card)

    // if we actually extracted a card, redraw the stack
    if (oldstackcard) {
      redrawStack(oldstackcard)
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

    // if (card.zone != 'fixed') {
    if (doStack) {
      changeStack(card,{'flipped': flipped})
    } else {
      card.flipped = flipped
    }
    // }
  }
  
  function stackMove(stack, x, y) {
    var card = getBaseCard(stack)
    card.x += x
    card.y += y
    redrawStack(card)
  }
  
  $scope.addCardToStack = function(target, addl) {
    var targetcard = getTopCard($scope.cards[target.dataset.index]),
        addlcard = getBaseCard($scope.cards[addl.dataset.index])
    
    if (cardPartOfStack(addlcard,targetcard)) {
      console.log("card already in stack!! STOPPING")
      console.log("card ", addlcard)
      printStack(targetcard)
      return
    } 
    console.log("dropping ", addlcard.src, " on ", targetcard.src)
    
    targetcard.next = addlcard
    addlcard.prev = targetcard
    redrawStack(addlcard)
    changeStack(addlcard,{'zone':targetcard.zone})
  
    $scope.$apply()
  }
  
  /********************************************************************************************************/
  /* default scopes                                                                                       */
  
  $scope.zcounter = 0
  $scope.cards = [
    newCard({'x':100,'y':100, 'src': 'island1.jpg'}),
    newCard({'x':300,'y':100, 'src': 'ainok tracker.jpg'})
  ]

  
  
  
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
    var card = null, prevcard = null
    for (var i=0; i<cardimages.length; i++) {
      card = newCard({'x':x,'y':y,'src':cardimages[i], 'prev':prevcard, 'next': null})
      $scope.cards.push(card)
      if (card.prev) {
        card.prev.next = card
      }
      prevcard = card
    }
    snapToGrid(card)
    $scope.$apply()
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
        moveStackToFront(card)
        $scope.$apply()
      },
      onmove: function(event) {
        var card = $scope.cards[event.target.dataset.index]
        stackMove(card, event.dx, event.dy)
        $scope.$apply()
      },
      onend: function(event) {
        var card = $scope.cards[event.target.dataset.index]
        snapToGrid(card)
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
      cardFlip(card, {'doStack': event.altKey})
      $scope.$apply()
    })
    
  // card stacks can be dropped on other card stacks */
  interact('.card').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.50,

    ondragenter: function (event) {
      var targetcard = getTopCard($scope.cards[event.target.dataset.index]),
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
    
      if (!cardPartOfStack(draggingcard,targetcard)) {
        changeStack(targetcard,{'selected':true})
      }
      $scope.$apply()
    },
    ondragleave: function (event) {
      var targetcard = getTopCard($scope.cards[event.target.dataset.index]),
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      
      if (!cardPartOfStack(draggingcard,targetcard)) {
        changeStack(targetcard,{'selected':false})
      }
      $scope.$apply()
    },
    ondrop: function (event) {
      var targetcard = $scope.cards[event.target.dataset.index],
          draggingcard = $scope.cards[event.relatedTarget.dataset.index]
      
      changeStack(targetcard,{'selected':false})
      if (!cardPartOfStack(draggingcard,targetcard)) {
        $scope.addCardToStack(event.target,event.relatedTarget)
      }
      $scope.$apply()
    },
  })
  
  /* card on zone drops */
  // interact('.zone').dropzone({
  //   ondragenter: function (event) {
  //     var draggableElement = event.relatedTarget,
  //         dropzoneElement = event.target
  //
  //     if (! dropzoneElement.classList.contains("zone-board")) {
  //       dropzoneElement.classList.add('drop-target')
  //       draggableElement.classList.add('can-drop')
  //     }
  //   },
  //   ondragleave: function (event) {
  //     event.target.classList.remove('drop-target')
  //     event.relatedTarget.classList.remove('can-drop')
  //   },
  //   ondrop: function (event) {
  //     event.target.classList.remove('drop-target')
  //     event.relatedTarget.classList.remove('can-drop')
  //
  //     var card = $scope.cards[event.relatedTarget.dataset.index]
  //
  //     if (event.target.classList.contains("zone-private")) {
  //       changeStack(card,{'zone':'private','flipped':true})
  //       getBaseCard(card).y = 730
  //       snapToGrid(card)
  //     } else if (event.target.classList.contains("zone-fixed")) {
  //       changeStack(card,{'zone':'fixed'})
  //       getBaseCard(card).y = 730
  //       snapToGrid(card)
  //     } else {
  //       changeStack(card,{'zone':'board'})
  //     }
  //
  //     $scope.$apply()
  //
  //     console.log('Dropped on zone ', card.zone)
  //   },
  // })

})


  