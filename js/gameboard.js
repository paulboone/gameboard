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
    
  // $scope.stackStyle = function(stack, index) {
  //   if (stack.zone == 'fixed' && stack.spread) {
  //     rindex = stack.cards.length - index - 1
  //     xmod = 8
  //     ymod = -15
  //     return "transform:translate(" + rindex * xmod + "px," + rindex * ymod + "px)"
  //   } else if (stack.zone == 'fixed') {
  //     xmod = 0.5
  //     ymod = 0
  //   } else {
  //     xmod = 8
  //     ymod = 15
  //   }
  //   return "transform:translate(" + index * xmod + "px," + index * ymod + "px)"
  // }
  

  function getBaseCard(card) {
    var c = card;
    
    while (c.prev) {
      c = c.prev
    }
    
    return c
  }
  
  function propagateUpXYZ(baseCard) {
    var c = baseCard
    while (c.next) {
      c = c.next
            
      c.x = c.prev.x + 8
      c.y = c.prev.y + 15
      c.z = c.prev.z + 1      
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
  
  $scope.cardOnMoveStart = function(event) {
    // duplicate stack underneath this one, leaving it in place, taking only the top card
    console.log(event)
    var card = $scope.cards[event.target.dataset.index]
    card.z = ++$scope.zcounter;
    
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
        snapToGrid(oldstackcard)
      }
    }
  }
  
  
  
  $scope.cardOnMoveEnd = function(event) {
    var card = $scope.cards[event.target.dataset.index]
    
    snapToGrid(card)
      
    $scope.$apply()
  }
  
  $scope.cardOnMove = function(event) {
    var card = getBaseCard($scope.cards[event.target.dataset.index])
    
    // if ($scope.movestack) {
      card = getBaseCard(card)
      card.x += event.dx
      card.y += event.dy
      propagateUpXYZ(card)    
    // } else {
    //   card.x += event.dx
    //   card.y += event.dy
    // }
    
    $scope.$apply()
  }
  
  $scope.cardRotate = function(event) {
    var card = $scope.cards[event.currentTarget.dataset.index]

    if ((card.zone != 'fixed') != event.altKey ) {
      if (card.rotation == 0) {
        card.rotation = 90
      } else {
        card.rotation = 0
      }
      $scope.$apply()
    }
  }
  $scope.stackFlip = function(event) {
    console.log("stackFlip")
    var card = $scope.cards[event.currentTarget.dataset.index]
    if (card.zone != 'fixed') {
      card.flipped = ! card.flipped

    }  else { //fixed! don't flip, spread!
      // card.spread = ! card.spread
      // console.log("spread:",stack.spread)
    }
    $scope.$apply()
  }
  
  $scope.addCardToStack = function(target, addl) {
    var targetcard = $scope.cards[target.dataset.index],
        addlcard = $scope.cards[addl.dataset.index]
    
    console.log("dropping ", addlcard.src, " on ", targetcard.src)
    
    targetcard.next = addlcard
    addlcard.prev = targetcard
    
    addlcard.x = targetcard.x + 8
    addlcard.y = targetcard.y + 15
    addlcard.z = targetcard.z + 1
    
    console.log("targetcard", targetcard)
    console.log("addlcard", addlcard)
    // RESET cards further on top
    
    // targetstack.cards.splice(0,0,addlstack.cards)    
    // $scope.stacks.splice(addl.dataset.index,1)
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

      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target')
      draggableElement.classList.add('can-drop')
    },
    ondragleave: function (event) {
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
    },
    ondrop: function (event) {
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
      $scope.addCardToStack(event.target,event.relatedTarget)
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
      card = {'x':x,'y':y,'src':cardimages[i], 'rotation':0, 'flipped':false, 'spread':false, 'prev':prevcard, 'next': null}
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


  