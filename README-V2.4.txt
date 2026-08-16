V2.4 code-only patch

1) iPhone Safari input auto-zoom
- All dialog input/textarea/select controls are forced to >=16px.
- Dialog custom pinch transform resets on every open AND close.
- Focusing an editor resets modal scale before the keyboard opens.
- Keyboard-driven visualViewport resize no longer refits the underlying room.
- Focus-out performs two delayed resets while Safari settles after keyboard close.

2) Living-room window
- The uploaded V2.3 code had HTML/CSS for the night view, but no click listener in room-features.js.
- V2.4 adds the missing listener.
- Clicking the window now restarts visible star twinkles, a shooting star, and subtle city-light breathing for ~7 seconds.
- Transparent window hotspot no longer leaves a hover/tap film.

3) Cache
- All local CSS/JS query versions are updated to ?v=2.4.

This package contains code only. Keep your current assets/ directory unchanged.
