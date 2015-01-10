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

// gameboardApp.directive('stackStyle', function(a) {
//   return "test"
// })

gameboardApp.controller('gameboardCtrl', function ($scope) {
  
  $scope.zcounter = 0
  $scope.movestack = false
  $scope.cards = [
    {'x':100,'y':100,'z':0, 'src': 'island1.jpg', 'rotation':0, 'flipped':false, 'spread':false, 'prev': null, 'next': null},
    {'x':300,'y':100,'z':0, 'src': 'ainok tracker.jpg','rotation':0, 'flipped':true, 'spread':false, 'prev': null, 'next': null}
  ]

  function getBaseCard(card) {
    var c = card;    
    while (c.prev) {
      c = c.prev
    }
    return c
  }
  function getLastCard(card) {
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
      
  function changeSpread(card, spread) {
    console.log('changeSpread',spread)
    var last = getLastCard(card)
    var base = getBaseCard(card)

    base.spread = spread
    if (!spread) {
      changeStack(card,{'xoffset':0,'yoffset':0,flipped:false})
    } else {
      changeStack(card,{'flipped':true})
      var i = 0
      var c = last
      while (c.prev) {
        i += 1
        c = c.prev
        c.xoffset = -8 * i
        c.yoffset = -15 * i
      }
    }
    // base.spread = spread
    // if (spread) {
    //   last.x = base.x
    //   last.y = base.y
    // } else {
    //   base.x = last.x
    //   base.y = last.y
    // }
  }
    
  // function spreadXYZ(card) {
  //   console.log("spreadXYZ")
  //   var last = getLastCard(card)
  //   var base = getBaseCard(card)
  //   var c = last
  //
  //   // last.x = base.x
  //   // last.y = base.y
  //
  //   changeStack(base,{'flipped':true})
  // }
  
  function propagateUpXYZ(card) {
    var baseCard = getBaseCard(card)
    var c = baseCard
    var compact = getStackSize(baseCard) > 10

    while (c.next) {
      c = c.next
      if (compact) {
        c.x = c.prev.x + 0.5
        c.y = c.prev.y
      } else {
        c.x = c.prev.x + 8
        c.y = c.prev.y + 15
      }
      c.z = c.prev.z + 1
    
      if (c.z > $scope.zcounter) {
        $scope.zcounter = c.z
        console.log("zcounter ",$scope.zcounter)
      }
    }
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
    
    propagateUpXYZ(card)
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
  
  
  $scope.cardOnMoveStart = function(event) {
    var card = $scope.cards[event.target.dataset.index]
    
    if (! event.altKey) {
      // if we're part of a stack, we have to extract ourselves
      var oldstackcard = null
      if (card.next) {
        oldstackcard = card.next
        card.next.prev = card.prev
      }
      if (card.prev) {
        oldstackcard = card.prev
        card.prev.next = card.next
      }
        
      card.prev = null
      card.next = null
      
      if (oldstackcard) {
        changeSpread(oldstackcard,getBaseCard(oldstackcard).spread)
        propagateUpXYZ(oldstackcard)
        console.log("oldstack:")
        printStack(oldstackcard)
      }
      
      card.z = ++$scope.zcounter
      $scope.$apply()
    } else {
      card = getBaseCard(card)
      card.z = ++$scope.zcounter
      propagateUpXYZ(card)
    }
    console.log("moving card (after extract)", card)
  }
  
  
  
  $scope.cardOnMoveEnd = function(event) {
    var card = $scope.cards[event.target.dataset.index]
    
    if (! card.next && ! card.prev) {
      if (card.xoffset) {
        card.x += card.xoffset
        card.xoffset = 0
      }
      if (card.yoffset) {
        card.y += card.yoffset
        card.yoffset = 0
      }
    }
    
    snapToGrid(card)
    
    $scope.$apply()
  }
  
  $scope.cardOnMove = function(event) {
    var card = getBaseCard($scope.cards[event.target.dataset.index])

    card = getBaseCard(card)
    card.x += event.dx
    card.y += event.dy
    propagateUpXYZ(card)    
    
    $scope.$apply()
  }
  
  $scope.cardRotate = function(event) {
    var card = $scope.cards[event.currentTarget.dataset.index]

    if (card.zone != 'fixed') {
      if (card.rotation == 0) {
        if (event.altKey) {
          changeStack(card,{'rotation':90})
        } else {
          card.rotation = 90
        }
      } else {
        if (event.altKey) {
          changeStack(card,{'rotation':0})
        } else {
          card.rotation = 0
        }
      }
      $scope.$apply()
    }
  }
  $scope.stackFlip = function(event) {
    console.log("stackFlip")
    var card = $scope.cards[event.currentTarget.dataset.index]
    if (card.zone != 'fixed') {
      if (event.altKey) {
        changeStack(card,{'flipped':! card.flipped})
      } else {
        card.flipped = ! card.flipped
      }
    }  else { //fixed! don't flip, spread!
      var base = getBaseCard(card)
      changeSpread(base,!base.spread)
      propagateUpXYZ(base)
    }
    $scope.$apply()
  }
  
  $scope.addCardToStack = function(target, addl) {
    var targetcard = getLastCard($scope.cards[target.dataset.index]),
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
    propagateUpXYZ(addlcard)
    changeStack(addlcard,{'zone':targetcard.zone})
  
    $scope.$apply()
  }
  
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
  

  interact('.draggable')
    .draggable({
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onmove: $scope.cardOnMove,
      onstart: $scope.cardOnMoveStart,
      onend: $scope.cardOnMoveEnd
    })
    .on('tap',$scope.cardRotate)
    .on('doubletap', $scope.stackFlip)
    
  // card on card interactions
  interact('.draggable').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.50,

    ondragenter: function (event) {
      var draggableElement = event.relatedTarget,
          dropzoneElement = event.target
      
      var targetcard = getLastCard($scope.cards[event.target.dataset.index]),
          addlcard = $scope.cards[event.relatedTarget.dataset.index]
    
      if (!cardPartOfStack(addlcard,targetcard)) {
        changeStack(targetcard,{'selected':true})
      }
    },
    ondragleave: function (event) {
      var targetcard = getLastCard($scope.cards[event.target.dataset.index]),
          addlcard = $scope.cards[event.relatedTarget.dataset.index]
      
      if (!cardPartOfStack(addlcard,targetcard)) {
        changeStack(targetcard,{'selected':false})
      }
    },
    ondrop: function (event) {
      var targetcard = $scope.cards[event.target.dataset.index],
          addlcard = $scope.cards[event.relatedTarget.dataset.index]
      
      changeStack(targetcard,{'selected':false})
      if (!cardPartOfStack(addlcard,targetcard)) {
        $scope.addCardToStack(event.target,event.relatedTarget)
      } else {
        console.log('part of stack')
      }
      
      console.log('Dropped on card')
    },
  })
  
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
        changeStack(card,{'zone':'private','flipped':true})
        getBaseCard(card).y = 730
        snapToGrid(card)
      } else if (event.target.classList.contains("zone-fixed")) {
        changeStack(card,{'zone':'fixed'})
        getBaseCard(card).y = 730
        snapToGrid(card)
      } else {
        changeStack(card,{'zone':'board'})
      }
    
      $scope.$apply()
      
      console.log('Dropped on zone ', card.zone)
    },
  })
  



  function putCardsOnBoard(cardimages,x,y) {
    cardimages = shuffle(cardimages)
    
    var card = null, prevcard = null
    for (var i=0; i<cardimages.length; i++) {
      card = {'x':x,'y':y,'xoffset':0,'yoffset':0, 'src':cardimages[i], 'rotation':0, 'flipped':false, 'spread':false, 'prev':prevcard, 'next': null}
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
})


  