# TODO

stitch together cardstack on receiving end (let array order determine connections).

Networking code:

- assume local image stores are the same on both computers.
- add fixed / hidden zone for other player
- make hidden zone player-specific
  - create some sort of concept of player
  - each card gets an owner, based on who dragged it to the gameboard.

send model change stream?

- **$scope.cards.push**
- extractCard
- moveStackToFront
- stackMove
- snapToGrid (??)
- cardRotate
- cardSpread
- cardFlip
- appendStack
- changeStack (some of them)

networking-related:

- use images from online source?
  - put image source url at top of deck file?
- scale the game board styles (not use fixed pixels)
- some means of coordinating display size between two people?

Other Required Features:

- counters:
  - click to increase
  - alt-click to decrease?
  - different colors?

- way to shuffle stack

Optional:

- slide-out side section where anything can be dropped
- better highlighting for compact stacks–use an alpha mask?
- work on ipad...?

Refactors?



- some sort of zone hierarchy display options so we don't have to explicitly check for zone position, i.e. (compact || c.zone == 'fixed'))?
- use actual object of some sort for card?

- don't use prev / next, just use arrays of cards (i.e. in stacks)?
  - in theory, might be cleaner because concept of stacks would be more clearly differentiated from cards.
    - but right now, _everything_ operates on the card level, which corrects for stacks as necessary.
    - would need to keep track of the container (i.e. stacks), rather than just the cards.
  
  - currently cards are self-organizing with stack groups, but those groups go away when no cards point to them.
    - would need to explicitly delete stacks
  - would prevent circular links (would not be possible) => nope, since card still needs to know what stack it is part of
  
  - refactor extract / propagate, etc; cards list still exists because that is how everything is rendered, but we also have a stack list where a stack is a first order object (i.e. no stackgroup on the cards any more).

    - would extract the card connections from the card


## Code Documentation

- cards are arranged in stacks. 
- in a stack, the "base" card is the one on the bottom (which has the lowest z-index).
- it is the base card that snaps to a grid.
- each card placed onto another card is offset down and to the right (and to a higher z-index), by default.
- if a stack is more than 10 cards, than it is arranged as a conpact stack, which is just each card is placed slightly (~ 0.5px) to the right.
- a spread stack is arranged the same way as a default stack, except in reverse, so:
  - it is aligned according to the top card, not the base card.
  - the stack is offset up and to the left, instead of down and to the right.
- when the spread stack is unspread, the base card should still be aligned with the grid.


### ZONES

the primary board zone:
- stacks < 10 display in default tiered
- stacks >= 10 display in compact

fixed:
- all stacks display compact

private:
- same as primary
- cards are visible only to you.

fn-click, expands pile, visibilty depends on location
  

## Plan

- drag and drop individual cards, snap to grid
- stack cards on top of one another, linked list should work.
- change stack display mode to default, compact, reverse default.



