# Personal notebook — interaction and visual specification

This specification implements PERSONAL-PRD.md and PERS01–05 in PERSONAL-STORIES.md. The active product is a personal gym notebook. Coaching, login, enrollment, feeds, nutrition and CRM have no place in its primary interface.

## Working model

One app, three persistent destinations: **Today**, **Progress**, **Backup**. Each changes the main surface in place; there is no nested page tree. Today contains planning before a session and the workbench while a session exists. Progress holds finished session history and movement comparisons. Backup holds device-storage status, installation guidance, export and import. The current unfinished session survives tab changes. Browser Back must never serve as a required logging control.

Dark near-black background (#101311), slightly raised green-charcoal panels (#1a1e1b), warm white text and pale lime (#c7ef9e) primary actions. This makes the set entry the visual focal point and follows the supplied dark logging reference without using a full-screen video. Typography uses installed system fonts, avoiding a network font dependency. Large numbers use tabular numerals. Decorative charts, ring scores, streaks, body images and timer chrome are excluded.

## First arrival and planning

A compact wordmark and concise device-save status occupy the header. The main title asks what the user wants to train. Six broad muscle-group chips support multiple selection and clearly expose their selected state through color and accessibility state. Exercise count is visibly labeled; the user does not have to equate workouts with sets. Generate a suggested session with one primary action.

The preview is an ordered list of exercise cards with movement name, equipment and concise target reason. The list explains target coverage instead of saying an opaque algorithm is smart. For shoulders, a side raise should make rear/front targets more useful than another side-target suggestion when available. Secondary overlap is acknowledged. Insufficient unique targets produces a visible coverage note; user overrides remain possible. Never say each exercise isolates a muscle perfectly.

Default three sets and 8–12 reps are editable convenience settings. Starting the session records the intended plan but records no actual performed sets. The preview and workout stay on the same Today surface. A fresh empty session must not be mistaken for a completed workout.

## At the gym: open, glance, log

The active exercise name and equipment come first. A compact horizontal exercise switcher supports moving out of order if equipment is busy; switches are inline rather than a new route. Then a small two-column context panel exposes **Last time** and **Target** as references. **Today** is the recorded receipt list, separate from both. No previous value becomes an actual without an explicit logging action.

The primary input is one weight/reps pair with permanently visible labels, decimal numeric keyboard for load and integer numeric keyboard for repetitions. At mobile widths the input boxes are at least 82 px tall, with large readable values. Units are explicit. Tap **Log set** directly below those fields. Keep this above secondary metadata and target editing. The normal next action after logging is another set, so focus returns predictably to the first entry field without opening a modal. Do not auto-advance to another exercise simply because the intended number of sets has been reached.

After a successful IndexedDB transaction, show a compact set receipt and device-saved confirmation. An optimistic success message before persistence is forbidden. Each receipt contains set order and explicit actual values. Edit works inline, with Save correction and Cancel; removing a set exposes an immediate Undo. Repeat names exact values and logs one performed set only per intentional tap. Prevent accidental double submission, not intentional subsequent repeat actions. If storage fails, retain typed values, show the actionable failure, and do not claim a saved set.

Finishing a workout is distinct from logging a set. A deliberate Finish action preserves partial work and moves it to history; it must not fabricate any unperformed targets. An empty workout should be discardable without generating progress. No motivational copy should punish a short or partial session.

## Unavailable machine

**Swap exercise** expands alternatives beneath the active movement. Alternatives show name/equipment and a short same-target rationale. There is no screen-sized picker or loss of logging context. Cancel collapses it.

Before any actual set, choosing a replacement changes the planned occurrence. After an actual set, the old movement and all its values remain visible in the session, and the replacement becomes a new occurrence. The UI must explain this in one sentence before committing: earlier sets stay under the original movement. Replacement never relabels actual weights or treats machine stacks as equivalent. Unsubmitted input must not vanish through switching; implementation should preserve it or explicitly resolve it before replacement.

## Progress without false certainty

History shows date, exercises and all performed sets in order. Opening details expands inline. The progress view selects a movement and comparable equipment/unit context before presenting a comparison. A lighter dumbbell set is never directly compared to a machine stack as a loss of strength. Unknown context is named rather than guessed.

Progressive overload guidance uses optional double progression. Increasing reps at a held load can be progress; adding load is optional only once all intended comparable working sets meet the upper bound. Suggested increments reflect equipment availability. Guidance stays secondary to actual logging and can be ignored. There is no required progress every session, automatic target escalation, estimated readiness or pain inference.

## Storage and backup: visible truth with low interruption

Use **Saved on this device** only after durable write completion. Separate statuses include Saving, Save failed, and Persistence request unavailable/declined/granted. Do not use a permanent green safety badge to imply guaranteed recovery.

Backup destination explains: records stay in this browser on this device; clearing browser data, losing the device or storage eviction can remove them. Installing to the home screen is not backup. Offer one obvious Export backup action and an Import backup file control. Request persistent storage where supported without blocking logging if declined. The user should see last export time, if known, and a gentle backup reminder after meaningful new data, without a full-screen nag at each set.

Import previews what will be restored/merged, validates version and shape, and does not overwrite newer data silently. Invalid files leave current records untouched and show a readable error. Successful import reports the actual result. Export status is “file prepared/download requested,” not a promise that the operating system saved it to a safe location. A browser-only app cannot guarantee never losing storage; backup is the independent recovery mechanism.

## Layout, reach and accessibility

Support 320 px and 390 px viewport widths without horizontal page scrolling. The exercise switcher alone may scroll horizontally. Main touch controls are at least 44 px; primary logging action is at least 54 px. Fixed bottom navigation reserves content padding plus device safe-area inset, so it cannot hide receipts or finish controls. The primary Log set action follows inputs rather than floating over the software keyboard. A single column on phones maintains predictable order; a bounded desktop content width prevents long eye travel.

Keep labels visible when fields hold values. Use aria-pressed for chips, aria-current for active navigation, an announced status for asynchronous saves and role alert for blocking errors. Preserve keyboard focus in inline edits. No color-only done states: receipts and text distinguish recorded work. Respect reduced-motion preferences. Actions can use a brief pressed state; no celebratory animation interrupts a set.

## Evidence boundary

This document is a design contract, not a usability result. Screenshots, browser tests and synthetic-persona walkthroughs can establish layout and state behavior, but cannot establish one-handed comfort, delight, completion speed or durable storage behavior across actual phones. A real-device walkthrough must exercise opening from home screen, keyboard entry, switching machines, interruptions, offline reload, export and import before those claims are made.
