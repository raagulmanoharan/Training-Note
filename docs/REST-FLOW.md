# Optional rest between sets

## Actor journey recorded before implementation

The lifter has just completed a set and enters the actual weight and reps. They
want a quiet cue for when to begin the next set without leaving the logging
screen, starting a phone stopwatch, or remembering what they logged. Rest is
optional; existing workouts continue with rest off.

1. Before training, or between sets, the lifter chooses a rest duration in the
   exercise editor. Bulk editing can apply the same preference to several
   exercises. This changes the plan for subsequent sets, not a countdown already
   in progress.
2. The lifter logs a real set. The set and a wall-clock rest deadline are written
   together. The screen must acknowledge the timer only after the transaction is
   acknowledged. A failed save remains retryable and must not pretend a timer was
   saved.
3. A compact rest strip shows the remaining time near the set controls. It has
   two explicit actions: add 30 seconds, or skip the rest. It does not replace the
   set inputs or open an interrupting modal.
4. The lifter may visit another exercise, open a sheet, background the app, or
   reload it. Remaining time is always derived from the saved deadline rather
   than decrementing a persisted counter. The timer survives reload without a
   write every second. No background notification is promised.
5. Once the deadline passes, the strip reads “Rest complete.” The lifter can
   dismiss it, add 30 seconds, or log their next set. A new successfully logged
   set replaces the countdown when that exercise has a rest preference.
6. Removing or replacing an exercise cannot break storage validation. An existing
   timer may finish with a generic label even if its originating exercise has
   been removed. Previously logged sets and the next typed set are untouched.

## Acceptance

- Rest is off by default, with no migration or change to old workout payloads.
- A preference is an optional integer from zero (off) to 3,600 seconds.
- The active timer stores its originating exercise ID, duration and epoch
  deadline. Rendering ticks never write to storage.
- Countdown controls have at least 44 px touch targets, wrap cleanly on narrow
  screens and remain available after expiry.
- Screen readers receive a single completion announcement rather than an
  announcement every second.
- Expired, refreshed and backgrounded timers show truthful remaining time.
- Export/import verifies both older backups without rest fields and newer
  backups with timer data. An omitted optional value does not invalidate the
  exported checksum.
- Invalid timer values are rejected before any store write. Missing exercise
  references are tolerated because the rest itself is independent of the plan.

## Delivery evidence

Implemented the optional exercise preference and workout deadline without a
database/schema version change. `RestTimer` derives its readout from the saved
deadline and listens for visibility/page-return events. Explicit actions use the
parent persistence callback. The store rejects malformed rest values without
adding fields to legacy data. Its canonical checksum now omits undefined object
fields, matching JSON serialization; valid existing signed backup payloads retain
the same canonical representation.

Executed `rest-logic.spec.ts` against local Vite on port 5174: **3 passed in 2.3 s**.
The tests cover a backup signed with the previous canonical implementation;
new timer save/read/export/inspect; optional fields cleared to undefined;
invalid durations/deadlines; harmless missing exercise references; background
elapsed time; expiry; extension after expiry; and extension bounds. An initial
test fixture requested two distinct biceps targets from a catalog containing one;
the fixture was corrected to the established chest/back plan before the passing
run. This was a test setup issue, not a rest feature change.

Integrated UI and whole-application build verification belong to the parent
workstream after its shared-screen integration is complete. These are synthetic
checks, not a claim of human usability testing.
