# TODO

~ 11.5 hours


TODO:

- put image source url at top of deck file
- use images from online source?

De-complexify:

- TODO: don't automatically shuffle on load cards?
- TODO: some sort of zone hierarchy display options so we don't have to explicitly check for zone position, i.e. (compact || c.zone == 'fixed'))
- TODO: remove xoffset / yoffset; just use x/y?
Refactor for underestandability:

- TODO: use actual object of some sort for card, so creation is more determinative?
- TODO: separate out interface functions from board methods (i.e. cardOnMoveStart having two definitions, depending on whether the alt key is pressed)
- TODO: cardOnMoveStart needs an extractCard function

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