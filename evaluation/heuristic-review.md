# UniSports heuristic evaluation

**Evaluator** Codex · **Date** 25 November 2026 · **Baseline** `60caf40`

An inspection of the classroom frontend using fictional entries and the 2 December 2026 demo clock. The retest ran in Chromium at **320, 390 and 1366 CSS px**. It used a fresh browser context per width, with a switch to 5 December for the closed-registration check. The six student journeys in the MVP plan guided the walkthrough. Findings and retest results below are evaluator observations. The participant study is pending.

Severity follows the course scale. **0** means no issue observed on the inspected path, **1** cosmetic, **2** minor, **3** major, and **4** catastrophic. The scores describe the baseline behavior.

## Findings and retest

| Nielsen heuristic | Baseline observation and impact | Revision and retest |
| --- | --- | --- |
| 1. Visibility of system status | **0.** Submitting a badminton pair showed a reference and **Pending verification**. The receipt identified the next step and reopened after refresh. | Keep the text status, receipt indicator and reference together. Retest found the same status and reference after refresh. [Pair receipt](evidence/pending-pair.png) |
| 2. Match between system and the real world | **0.** Badminton mixed doubles showed Rs 400 **per pair** before entry. The receipt identified the Student Centre and the amount for both players. | Keep the fee unit and the campus office name at the point of action. Retest confirmed both on the pending receipt. |
| 3. User control and freedom | **2.** **Cancel changes** in roster review immediately discarded the draft. The same action in the form offered a choice, so a slip in review lost the captain's corrections. | Use the same confirmation in both views. Escape kept the draft and returned focus to **Cancel changes**. Confirming discard reopened the saved receipt with the previous roll number. [Before](evidence/roster-before.png) · [After](evidence/roster-after.png) |
| 4. Consistency and standards | **0.** The Falcons–Rovers semifinal showed the same rescheduled time and court in the public list, bracket and confirmed receipt. | Keep a single match record for all three views. Retest followed the saved entry to the current **4:30 PM, Court 2** match details and also checked the completed chess result and its bracket. [Match details](evidence/rescheduled-match.png) |
| 5. Error prevention | **0.** A duplicate Lahore roll number with different casing and surrounding spaces was caught at the affected field. A closed registration route and a repeat entry for the same category were blocked. | Keep the duplicate check at review and the deadline and existing-entry checks at the point of writing. Retest reached the affected field and found one saved football entry. |
| 6. Recognition rather than recall | **0.** A named player link in review returned to that player's roll number with the rest of the roster populated. | Keep the event category, roster and existing values visible. Retest edited player three and checked that player five's roll number was unchanged. |
| 7. Flexibility and efficiency of use | **0.** A shared match URL opened directly. The named edit link accepted Enter, placed focus on the roll-number input, and accepted a keyboard correction and Enter to return to review. | Keep direct links and standard keyboard behavior. Retest exercised the correction without pointer actions after focusing the edit link. |
| 8. Aesthetic and minimalist design | **1.** Zoya vs Adil showed the old venue twice, once on its own and again under **Previously scheduled**. The repetition made the pending state harder to scan on a narrow screen. | Group the old time and venue under **Previously scheduled**. Retest found a single venue and a separate **Revised time pending** label. [Before](evidence/delay-before.png) · [After](evidence/delay-after.png) |
| 9. Help users recognize, diagnose and recover from errors | **3.** A malformed Ludo record blocked My Entries and the independent football receipt. Retrying the entire screen could not recover access. | Keep healthy records accessible and name the affected category. Retest reopened football while the damaged value remained in storage. A separate simulated write failure preserved the draft, and **Try again** produced one receipt. |
| 10. Help and documentation | **2.** A confirmed volleyball receipt directed captains to the Student Centre for corrections, but gave no instruction about the information to provide. | Put the specific reference and what to provide beside the roster. Retest located **US-VB-1042** in the correction instruction on that receipt. [Before](evidence/corrections-before.png) · [After](evidence/corrections-after.png) |

The revised roster dialog is an example of Shneiderman's reversal and Mandel's user control. The delayed match makes Norman's evaluation stage easier because the student can distinguish the old schedule from the pending one. Giving the captain a reference in context puts the information needed for the next action on the screen. [Applied HCI references](../skills/applied-hci/references/project-evaluation.md)

## Registration action model

**GOMS goal** correct player three's roll number from football review, then return to review with the rest of the roster intact. The two methods use clicking, changing input device, selecting the existing value, typing and submitting the details form. Choose the named-player link for a known field. A whole-roster edit can suit a correction spanning several players.

The KLM comparison starts at review with a skilled laptop user, the target already known, and a mouse at hand. The draft contains valid values, and the corrected eight-character ID is ready. Count Ctrl+A as one key action and type the roll number in lowercase because the form normalizes it. Ten key actions after moving to the keyboard cover select all, eight characters and Enter. Use the lecture's example values **M 1.35 s, P 1.10 s, K 0.20 s, H 0.40 s**. Both methods assume negligible response time and a visible target.

| Method | Operators | Estimated execution |
| --- | --- | --- |
| Named player edit with focus on the roll number | M + P + K + H + 10K | 5.05 s |
| Whole-roster editor, followed by clicking the same field | M + P + K + P + K + H + 10K | 6.35 s |

The estimated difference is **1.30 s** for the additional point and click. It excludes visual search, scrolling and error recovery. These are model estimates under the stated assumptions. [Course KLM reference](../skills/applied-hci/references/project-evaluation.md#gomsklm-and-the-keystroke-level-model)

## Participant walkthrough

The task cards, facilitator scoring guide and blank observation sheet are ready for the student sessions. [Student study materials](student-study/facilitator-guide.md)

Recruit approximately five students and cover individual or pair entrants, captains and spectators. Give participants fictional details and reset the browser state between sessions. Ask them to think aloud, record hesitation and assistance, and use time only as a rough comparison under that instruction.

| Starting screen | Prompt and success evidence |
| --- | --- |
| Tournaments | Enter mixed doubles with the supplied names. Explain what your receipt means and where you pay. Record whether they identify pending verification and Rs 400 for the pair. |
| Football details | Enter the supplied roster, including the duplicate, and correct player three after reviewing. Record whether the other players survive and only one receipt is issued. |
| My Entries with a pending team entry | Fix a roll number. Reopen the receipt and check the saved value and original reference. |
| Public fixtures on a phone | Find when and where Falcons play. Record the answer verbatim and whether it includes 4:30 PM and Court 2. |
| Chess tournament details | Check the winner of Omar vs Meher and find its round. Record whether both answers agree with the bracket. |
| My Entries with the confirmed Falcons entry | Find the changed fixture. Ask which court another semifinal uses and where to request a roster correction. |

For each task, log attempt number, device, success, time, errors, assistance and a 1–5 confidence rating with the participant's reason. Use the planned target of four unaided successes out of five attempts where five complete the task. Report numerator and denominator for smaller groups. Participant results, confidence ratings and observed timings should be entered after the sessions.

## Campus programme redesign

| Student task | Design decision and course principle | Screens |
| --- | --- | --- |
| Find the next registration deadline between classes | The homepage ticket names the sport, gives the deadline and opens that event. All three destinations remain visible on a phone. This applies Norman’s visibility and mapping. | [Desktop board](evidence/programme-desktop.png) · [Phone board](evidence/programme-phone.png) |
| Find the revised Falcons semifinal | The current time and court form the first pair of match facts. The earlier arrangement appears below under “Previously scheduled.” This groups the information the spectator needs to act. | [Earlier match page](evidence/rescheduled-match.png) · [Revised match page](evidence/programme-match.png) |
| Work out what to do after submitting a pair | The current progress step, pending status, reference and fee instruction appear together. The student can take the receipt to the Student Centre. This supplies feedback and closure while supporting recognition. | [Earlier receipt](evidence/pending-pair.png) · [Revised phone receipt](evidence/programme-receipt.png) |

Browser walkthroughs passed at 320, 390, 768 and 1366 CSS pixels. They exercised solo, pair and team submission, keyboard validation and edit focus, roster removal and undo, saved roster correction, receipts after refresh, schedule filters, delayed and revised matches, bracket navigation and the closed-registration board. The four widths also passed horizontal overflow checks on the tested screens. Student comprehension and unaided task success remain questions for the participant sessions.
