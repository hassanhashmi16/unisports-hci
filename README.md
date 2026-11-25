# UniSports

UniSports is a student-facing tournament portal for FAST-NUCES Lahore. Students can browse tournament categories, search the public match schedule and results, and follow a match into its knockout round.

## Run locally

From the project folder, start a static server with Python 3.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000/) to browse and filter tournaments, check deadlines and fees, and open a shareable event category. The season board uses 2 December 2026. Add `?later` to the URL before the hash to inspect the board after registration closes.

In **Fixtures & Results**, look up Falcons to see the revised volleyball semifinal. Switch to **Results** and search for Omar to follow the completed chess quarterfinal into its bracket. A match's copy-link action shares its public details. The browser Back action restores the preceding list and filters.

To try registration, open Football, choose **Register a team**, and enter a team name and five fictional players. Use **Continue to review**, then **Submit entry**. The receipt gives the team's reference, payment instructions and verification status. Open **My Entries** to revisit it after refresh or correct its roster before the deadline. Saving a correction keeps the reference. The confirmed Falcons entry demonstrates the outcome of office verification and links to its rescheduled semifinal.

Singles and doubles use the same flow with one or two players. Drafts stay in memory while navigating. Submitted entries use this browser's local storage. For this frontend demonstration, one device represents one student, with one entry per tournament category. Use fictional details.

Start with the [MVP plan](UniSports%20MVP%20Plan.md) for the agreed registration flows, page inventory and open decisions. Use the [Applied HCI skill](skills/applied-hci/SKILL.md), [lecture notes](skills/applied-hci/references/lecture-notes.md) and [evaluation guide](skills/applied-hci/references/project-evaluation.md) when reviewing a design.

Links in the planning documents to original reports, the survey, Classroom files and the course source index refer to the team's local materials.
