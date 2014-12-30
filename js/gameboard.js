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
  
  $scope.stacks = [
    {'x':100,'y':100,'cards':['island1.jpg','island1.jpg','act of treason.jpg'], 'rotation':0, 'flipped':false},
    {'x':300,'y':100,'cards':['ainok tracker.jpg'],'rotation':0, 'flipped':true}
  ]
  
  $scope.stackOnMoveStart = function(event) {
    // duplicate stack underneath this one, leaving it in place, taking only the top card
    console.log(event)
    var stack = $scope.stacks[event.target.dataset.index]
    stack.moving = true
    
    if (stack.cards.length > 1 && (stack.zone == 'fixed') != event.altKey) {
      var topcard = stack
      var fullstack = angular.copy(stack)
      
      $scope.stacks.unshift(fullstack)
      topcard.cards = [fullstack.cards.pop()]
      console.log("topcard",topcard.cards)
      console.log("fullstack",fullstack.cards)
      $scope.$apply()
    }
  }

  $scope.stackOnMoveEnd = function(event) {
    
    var stack = $scope.stacks[event.target.dataset.index]
    if (stack) { //if stack was combined, might not exist any more
      stack.moving = false

      var gridsize = 30,
          div = Math.floor(stack.y / 30)
    
      if (stack.y % gridsize > gridsize / 2) {
        stack.y = (div + 1) * gridsize
      } else {
        stack.y = div * gridsize
      }
    
      div = Math.floor(stack.x / 30)
      if (stack.x % gridsize > gridsize / 2) {
        stack.x = (div + 1) * gridsize
      } else {
        stack.x = div * gridsize
      }
    
      $scope.$apply()
    }
  }
  
  $scope.stackOnMove = function(event) {
    var stack = $scope.stacks[event.target.dataset.index]
    stack.x += event.dx
    stack.y += event.dy
    $scope.$apply()
  }
  
  $scope.stackRotate = function(event) {
    var stack = $scope.stacks[event.currentTarget.dataset.index]

    if (stack.rotation == 0) {
      stack.rotation = 90
    } else {
      stack.rotation = 0
    }
    $scope.$apply()
  }
  $scope.stackFlip = function(event) {
    var stack = $scope.stacks[event.currentTarget.dataset.index]
    stack.flipped = ! stack.flipped
    $scope.$apply()
  }
  
  $scope.combineStacks = function(target, addl) {
    var targetstack = $scope.stacks[target.dataset.index],
        addlstack = $scope.stacks[addl.dataset.index]
    
    for (var i=0;i<addlstack.cards.length;i++) {
      targetstack.cards.push(addlstack.cards[i])
    }
    // targetstack.cards.splice(0,0,addlstack.cards)
    
    $scope.stacks.splice(addl.dataset.index,1)
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
      onmove: $scope.stackOnMove,
      onstart: $scope.stackOnMoveStart,
      onend: $scope.stackOnMoveEnd
    })
    .on('tap',$scope.stackRotate)
    .on('doubletap',$scope.stackFlip)

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
      $scope.combineStacks(event.target,event.relatedTarget)
      console.log('Dropped')
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

      var dropstack = $scope.stacks[event.relatedTarget.dataset.index]
      
      if (event.target.classList.contains("zone-private")) {
        dropstack['zone'] = "private"
        dropstack.flipped = true
        dropstack.y = 730
      } else if (event.target.classList.contains("zone-fixed")) {
        dropstack['zone'] = "fixed"
        dropstack.y = 730
      } else {
        dropstack['zone'] = "board"
      }
      console.log(dropstack.zone)
      
      $scope.$apply()

      // $scope.combineStacks(event.target,event.relatedTarget)
      console.log('Dropped')
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
          var importstack = {'x':e.x - 50,'y':e.y - 75,'cards':importcards, 'rotation':0, 'flipped':false}
          $scope.stacks.push(importstack)
          $scope.$apply()          
        }
        fr.readAsText(e.dataTransfer.files[i])
      } else {
        cards.push(filename)  
      }
    }
    if (cards.length > 0) {
      var stack = {'x':e.x - 50,'y':e.y - 75,'cards':cards, 'rotation':0, 'flipped':false}
      $scope.stacks.push(stack)
      $scope.$apply()
    }
  }
})


  