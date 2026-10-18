# Card organization

Journey: on Home, recognize the next/resumable workout, start it, then glance at attendance and progress when useful. During training, the persistent session card owns timer and Finish; the active exercise card owns its setup/reference, exact logging, recent recorded sets and correction. Other movements are tappable compact cards. Secondary setup stays collapsed. No extra navigation or stored-data change.

Home has four clear content groups: workout launch, attendance, progress and latest workout. Progress rows stay inside one card rather than nesting another card around every number. Workout has one session card, one active exercise card, then compact movement cards. White surfaces sit on a quiet neutral canvas with consistent rounding and thin borders. Padding replaces existing excess spacing; it must not push Log/Next out of the narrow long-session viewport.

Acceptance: maintain two primary screens, direct action labels, native accessible controls, sticky Finish, timer preference, actual logging and safe confirmations. Verify320/390 mobile widths, sixth-set draft with previous history, full-workout path, timer card and production offline shell. Screenshots use isolated synthetic history.

Verified production build and five targeted full-workout/session-card browser tests passed. Real React captures and overflow checks passed at320/390px for Home and Workout. In the returning-history sixth-set case,320×740 keeps Log at y587–643 and Next at y663–721. Sticky Finish, elapsed preference, corrections and reload recovery remain intact. No external requests or page errors in capture review. Current captures are in `design/production-redesign/`.
