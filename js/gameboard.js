var gameboardApp = angular.module('gameboardApp', [])

gameboardApp.controller('gameboardCtrl', function ($scope) {
  
  $scope.stacks = [
    {'x':100,'y':100,'cards':['island','island','swamp','orgg']},
    {'x':300,'y':100,'cards':['orgg']}
  ]
  
  $scope.stackOnMove = function(event) {
    $scope.stacks[event.target.dataset.index].x += event.dx
    $scope.stacks[event.target.dataset.index].y += event.dy
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
})

  