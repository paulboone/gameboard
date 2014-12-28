var gameboardApp = angular.module('gameboardApp', [])

gameboardApp.controller('gameboardCtrl', function ($scope) {
  
  $scope.stacks = [
    {'x':100,'y':100,'cards':['island','island','swamp','orgg'], 'rotation':0},
    {'x':300,'y':100,'cards':['orgg'],'rotation':0}
  ]
  
  $scope.stackOnMove = function(event) {
    var stack = $scope.stacks[event.target.dataset.index]
    stack.x += event.dx
    stack.y += event.dy
    $scope.$apply()
  }
  
  $scope.stackOnTap = function(event) {
    var stack = $scope.stacks[event.currentTarget.dataset.index]

    if (stack.rotation == 0) {
      stack.rotation = 90
    } else {
      stack.rotation = 0
    }
    $scope.$apply()
  }
  
  interact('.draggable')
    .draggable({
      restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },
      onmove: $scope.stackOnMove
    })
    .on('tap',$scope.stackOnTap)
})

  