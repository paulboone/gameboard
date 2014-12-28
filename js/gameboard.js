var gameboardApp = angular.module('gameboardApp', [])

gameboardApp.controller('gameboardCtrl', function ($scope) {
  
  $scope.stacks = [
    {'x':100,'y':100,'cards':['island.jpg','island.jpg','orgg.jpg'], 'rotation':0, 'flipped':false, 'fixed': true},
    {'x':300,'y':100,'cards':['orgg.jpg'],'rotation':0, 'flipped':true}
  ]
  
  $scope.stackOnMoveStart = function(event) {
    // duplicate stack underneath this one, leaving it in place, taking only the top card
    var stack = $scope.stacks[event.target.dataset.index]
    
    if (stack.fixed) {
      var topcard = stack
      var fullstack = angular.copy(stack)
      
      $scope.stacks.unshift(fullstack)
      topcard.cards = [fullstack.cards.shift()]
      topcard.fixed = false
      
      if (fullstack.cards.length == 1) {
        fullstack.fixed = false
      }
      
      $scope.$apply()
    }
  }
  
  $scope.stackOnMove = function(event) {
    console.log("move")
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
    console.log("stackFlip")
    var stack = $scope.stacks[event.currentTarget.dataset.index]
    stack.flipped = ! stack.flipped
    $scope.$apply()
  }
  
  interact('.draggable')
    .draggable({
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onmove: $scope.stackOnMove,
      onstart: $scope.stackOnMoveStart
    })
    .on('tap',$scope.stackRotate)
    .on('doubletap',$scope.stackFlip)


  var holder = document.querySelector('.board-container')
  holder.ondragover = function(e) {
    e.preventDefault()
  }
  holder.ondrop = function (e) {
    e.preventDefault()
    var cards = []
    for (i=0;i<e.dataTransfer.files.length;i++) {
      cards.push(e.dataTransfer.files[i].name)
    }
    $scope.stacks.push({'x':e.x - 50,'y':e.y - 75,'cards':cards, 'rotation':0, 'flipped':false})
    $scope.$apply()
  }
})


  