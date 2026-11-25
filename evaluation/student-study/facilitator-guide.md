# UniSports student study

Run this formative walkthrough with about five consenting FAST Lahore students. Include students familiar with registering, captaining teams and watching campus matches. A session takes roughly 20–30 minutes with six tasks and a short debrief. Use the same app revision throughout a round.

## Set up

1. Serve the prototype locally and open it in a fresh browser profile or private window for each student. Close all private windows between students so saved entries reset. Use the hostname and port consistently in a session. The normal launch uses the 2 December 2026 demo date. [Local run instructions](../../README.md#run-locally)
2. Give the student the task cards one at a time. For Task B, initially show the roster only. Reveal the applicable team update at the point specified below. Keep this guide and the expected outcomes with the facilitator. [Participant tasks](participant-tasks.md)
3. Use a real phone for Task D when available. A desktop browser at a phone viewport works for a pilot. Record it as emulation. Use the same device and browser origin for B and C so C can reopen the saved receipt.
4. Give each student an ID such as P01. Copy the observation template outside the repository for the actual session notes. Record task behavior and device. Keep names, actual roll numbers and contact information out of the notes. [Observation template](observations.template.csv)

## Open the session

Read this aloud before asking whether they agree to take part.

> We’re checking whether UniSports is easy to use. This session is for our course project. I’ll use a participant ID in my notes about which tasks you complete and where the interface causes trouble. Please use only the details on the cards. You can skip a task or stop at any time. If you ask us to withdraw your notes, tell us your participant ID before we combine the results. Is it okay to begin?

Record verbal agreement under the participant ID in the private notes. The session uses observer notes. Obtain separate consent if the team later chooses to record anything.

## Run and score

Use this order so the football entry carries forward and the public fixture task comes before the captain checks the same match. Start each timer after the prompt and setup are ready. Pause it when handing over a scripted team update. Stop when the student shows or explains the requested result, gives up, or reaches the time limit.

| Task | Prepare this starting state | Unaided success |
| --- | --- | --- |
| A · Badminton pair · 4 min | Tournaments home in a fresh state. | Identifies the mixed-pair requirement, **3 Dec at noon** and **Rs 400 per pair**. Submits one receipt, reopens it, and explains it is pending verification, with payment and the reference taken to the Student Centre. |
| B · Football roster · 6 min | Football tournament details. Give Salma's correction if the student spots or hits the duplicate. Give Rida's correction at the first complete review. | Resolves the duplicate and updates Rida from review. Saves one receipt with five players, Salma ending in **7313**, Rida in **7317**, and the other values intact. Scripted updates count as task input. |
| C · Pending correction · 4 min | My Entries with the pending Campus Five entry from B. If B did not produce the intended record, create it yourself between tasks and mark the setup as facilitator-seeded. Use a fresh profile if the wrong record already occupies the football category. | Saves Faris ending in **7318**, reopens the entry, and identifies the same reference and pending state. The other players remain intact. |
| D · Public fixture · 3 min | Unfiltered Fixtures & Results on a phone or a recorded emulated viewport. | Identifies **2 Dec at 4:30 PM, Volleyball Courts, Court 2**. Recognizes that 3:00 PM and Court 1 were the previous arrangements. |
| E · Chess result · 3 min | Chess tournament details. | Identifies **Omar** as the winner against Meher and shows **Quarterfinal** in the bracket. |
| F · Confirmed entry · 4 min | My Entries with the seeded Falcons receipt. | Identifies Falcons vs Rovers as rescheduled and Spikers vs Orbit as scheduled for **3:30 PM on Court 1**. Finds the Student Centre correction instruction and identifies reference **US-VB-1042** and the details to correct. |

Use neutral prompts such as “What would you try next?” when someone stops thinking aloud. A directional hint, named control or demonstrated action counts as assistance. Allow the participant to finish after a hint and record its wording. Mark fully met success criteria as **unaided** or **assisted**. Use **incomplete** when a criterion is unmet, the task times out, or the participant stops after starting. Use **not run** for a skipped prompt. Document a setup or device interruption as **invalid** if it prevented a fair attempt.

After each task, ask how confident the student is in their answer from **1 (not confident)** to **5 (very confident)**, and ask why. Record any incorrect venue, wrong interpretation of pending status, lost roster row, or extra receipt as its own observation.

## Summarize and retest

- Report unaided successes over valid attempts per task. Valid attempts include unaided, assisted and incomplete attempts. List not-run and invalid counts separately. The target is at least four unaided successes for a task with five valid attempts. Report the raw counts for smaller groups.
- Report median time for unaided successes and keep timeout and assisted times visible in the raw notes. Use confidence ratings and participant comments to explain hesitation. Think-aloud changes timing.
- Prioritize misread verification, wrong match venue and lost roster data. For each fix, retain the anonymized observation, task, original behavior, revision and retest result. Record the build revision and whether a retest used new or returning participants. [Course evaluation guidance](../../skills/applied-hci/references/project-evaluation.md)

## Pilot

An evaluator ran all six task cards against build `10b462b` in Chromium. The pilot used a 1366 px desktop viewport and switched to 390 px for the spectator task. The pair receipt reopened with the correct payment instruction. The football task triggered the intended duplicate, saved all five players and carried the same reference through the next correction. The current and previous Falcons schedules, the chess result and the unaffected volleyball semifinal all matched the expected answers. A fresh browser context contained only the seeded Falcons entry.

The pilot verified setup and expected outcomes. Participant measures begin with the first consented student session.
