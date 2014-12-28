var gameboardApp = angular.module('gameboardApp', [])

gameboardApp.controller('gameboardCtrl', function ($scope) {
  $scope.stacks = [
    {'x':100,'y':100,'cards':['island','island','swamp','orgg']},
    {'x':300,'y':100,'cards':['orgg']}
  ]
})