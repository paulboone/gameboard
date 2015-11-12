# TODO

~ 11.5 hours


TODO:

- put image source url at top of deck file
- use images from online source?
- better highlighting for compact stacks–use an alpha mask?

De-complexify:

- TODO: some sort of zone hierarchy display options so we don't have to explicitly check for zone position, i.e. (compact || c.zone == 'fixed'))?

Refactor for understandability:

- TODO: use actual object of some sort for card, so creation is more determinative?

Bugs:

- BUG: pull card from middle of stack, offsets back to original card position, rather than drop position
- BUG: can't always drop on card easily (probably due to overlap with hidden due to above)




- get cards with multiple variations to work (i.e. island1/2/3/4)
- tokens, counters

- networking code

- hover blowup of card to see details
- fix image for card back
- scale the game board styles (not use fixed pixels)
- some means of coordinating display size between two people?
- full-screen mode


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



