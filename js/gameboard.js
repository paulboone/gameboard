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
  
  $scope.cardOnMoveStart = function(event) {
    // duplicate stack underneath this one, leaving it in place, taking only the top card
    console.log(event)
    var card = $scope.cards[event.target.dataset.index]
    card.moving = true
    card.z = ++$scope.zcounter;
    console.log("setting card.z to ", card.z, $scope.zcounter)
    
    // if (stack.cards.length > 1 && (stack.zone == 'fixed') != event.altKey) {
    //   var topcard = stack
    //   var fullstack = angular.copy(stack)
    //
    //   $scope.cards.unshift(fullstack)
    //   topcard.cards = [fullstack.cards.pop()]
    //   console.log("topcard",topcard.cards)
    //   console.log("fullstack",fullstack.cards)
    //   $scope.$apply()
    // }
  }

  $scope.cardOnMoveEnd = function(event) {
    var card = $scope.cards[event.target.dataset.index]
    // if (card) { //if c was combined, might not exist any more
    card.moving = false

    // only snap to grid if not on top of another card
    if (! card.prev) {
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
    }
    $scope.$apply()
    // }
  }
  
  $scope.cardOnMove = function(event) {
    var card = $scope.cards[event.target.dataset.index]
    card.x += event.dx
    card.y += event.dy
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
    return shuffle(cards)
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
      
      //detach from previous card, if it exists
      if (card.prev) {
        card.prev.next = null
        card.prev = null        
      }
      
      if (event.target.classList.contains("zone-private")) {
        card['zone'] = "private"
        card.flipped = true
        card.y = 730
      } else if (event.target.classList.contains("zone-fixed")) {
        card['zone'] = "fixed"
        card.y = 730
      } else {
        card['zone'] = "board"
      }
      console.log(card.zone)
      
      $scope.$apply()

      // $scope.combineStacks(event.target,event.relatedTarget)
      console.log('Dropped on zone')
    },
  })
  


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
          var importcards = $scope.importDeck(e1.target.result)
          var importstack = {'x':e.x - 50,'y':e.y - 75,'cards':importcards, 'rotation':0, 'flipped':false, 'spread':false}
          $scope.stacks.push(importstack)
          $scope.$apply()          
        }
        fr.readAsText(e.dataTransfer.files[i])
      } else {
        cards.push(filename)  
      }
    }
    if (cards.length > 0) {
      var stack = {'x':e.x - 50,'y':e.y - 75,'cards':cards, 'rotation':0, 'flipped':false, 'spread':false}
      $scope.stacks.push(stack)
      $scope.$apply()
    }
  }
})


  