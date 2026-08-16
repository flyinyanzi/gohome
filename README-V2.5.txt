V2.5 – iPhone Safari outer-page zoom fix

The new clue changes the diagnosis:
when the enlarged state survives a reload and the entrance itself is enlarged,
the scale is Safari's native page/visual viewport scale. It is outside the
dialog transform and outside the room artwork transform.

Changes:
- Pin Safari page scale to 1 with maximum-scale=1 + user-scalable=no.
- Prevent Safari gesturestart/change/end at the document level.
- Keep the app's own room pinch and dialog pinch zoom systems.
- Keep V2.4's >=16px inputs, dialog resets, and keyboard viewport protections.
- Cache versions bumped to v2.5.

Assets are unchanged.

Important first test:
After deploying V2.5, close the old Safari tab completely and open the page in
a fresh tab once. An already-stuck tab can retain its old page scale/session
state until that tab is destroyed.
