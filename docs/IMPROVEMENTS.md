# Improvement cycle following the live review

Multiplayer remains excluded. Publish each verified phase to `main`.

| Phase | Scope                                                                            | Status                                              |
| ----- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1     | Cross-tab save conflicts, exact lesson completion, confirmation-time timer start | Published after 53 unit and 10 browser tests passed |
| 2     | Simpler iPhone controls, iPad layouts, desktop workspace and keyboard navigation | Next                                                |
| 3     | Targeted practice coaching and a supported first real game; explain hint choices | Planned                                             |
| 4     | Saved/offline readiness, validated backups and recovery, multi-tab update checks | Planned                                             |
| 5     | Reproducible AI/difficulty/hint/latency benchmarks and slow-device checks        | Planned                                             |

Phase 1 serializes game writes through Web Locks where supported, compares the
stored snapshot before writing, rejects stale queued operations, and listens for
cross-tab changes. Without Web Locks the same snapshot comparison is optimistic;
modern browsers with Web Locks also serialize writes across documents. Deletion
preserves preferences and practice. A pending delete is visibly marked until done.

Advanced lessons now require the demonstrated result: a replaced and reused joker
in a separate group, or a run split into the two requested runs. A replacement
round's timer starts at confirmation, not while its dialog is open.

Each phase needs relevant unit and browser regressions, type-checking, a production
build, and updated documentation. Physical iPhone/iPad Safari, assistive technology,
and the five-person beginner study remain manual checks, never claimed from
viewport emulation alone. Record observed benchmark results rather than asserting
that Hard is stronger or a particular device is fast without measurement.
