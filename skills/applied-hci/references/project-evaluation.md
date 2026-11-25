# Project and evaluation reference

Use the [source inventory](source-index.md) to open the actual rubric and workbook. Preserve the user's choice of product and platform. The course handout and the user's frontend-only implementation scope both matter when planning deliverables.

## Phase 4 high-fidelity design and evaluation

The handout requests detailed mockups in Figma (recommended) or Adobe XD and the provided Nielsen heuristic evaluation workbook. The mockups refine the wireframes and represent a near-final interface. Classroom's final-submission post says to skip the separate Phase 3 submission and proceed to the final deliverable. The outline describes a broader multi-phase process. Use the assignment post and rubric for the actual submission requirements.

- Trace completed screens and flows to the earlier wireframes. Cover all navigational paths within the approved system, including consequential exceptional paths.
- Design the applicable interface elements, including messages, dialogs and progress indicators. Give each an appropriate purpose, state, copy and way to proceed or exit.
- Use realistic, meaningful content and the audience's terminology. Apply typography, layout and color. Check grouping, ordering, alignment, whitespace and decoration throughout.
- Apply Shneiderman, Norman, Mandel and Nielsen. Use consistent component styles and behaviors across all relevant screens. Show how findings informed visible revisions.
- Complete the evaluation workbook. If building an interactive frontend as well, confirm the intended relationship between the mockup, implementation and submitted artifacts with the user.

| Rubric criterion | Marks | What the reviewer needs to see |
| --- | ---: | --- |
| High-fidelity design and visual quality | 5 | Complete mockups with observable progression from wireframes and effective typography, color and layout |
| Navigation, interaction and UI components | 4 | Clear paths and coherent behavior across controls, dialogs, message boxes and progress indicators |
| Content, consistency and design principles | 3 | Realistic content, consistent UI and visible use of layout principles plus Shneiderman, Norman and Mandel |
| Heuristic evaluation workbook | 8 | Complete and correctly mapped evidence, substantive analysis and specific improvements |
| **Total** | **20** | |

## Usability and user experience goals

Set goals before comparing designs. State the user group, task, starting condition, success definition, measure and target. Report observed values with the sample size and any relevant limitations. Course slide example values illustrate a method and can differ from project-specific targets.

| Goal | Evidence to collect |
| --- | --- |
| Effectiveness | Successful attempts divided by all attempts, with an explicit end condition and allowances for assistance |
| Efficiency | Time, action count or effort for a defined task, with treatment of incomplete attempts reported |
| Safety | Error and near-error rate, consequences, prevention and recovery |
| Utility | Whether the product supports the tasks the users actually need |
| Learnability | First-attempt success, help needed or time to reach a defined proficiency |
| Memorability | Success, errors or relearning time on a repeat task after a stated interval |
| Satisfaction and UX | Ratings and interview or observation evidence on ease, comfort, trust, satisfaction or other relevant experience goals |

The usability goals lecture includes satisfaction in a comparison exercise and also treats it as experiential. Preserve that overlap where it matters. A quantitative rating can capture perceived experience. A think-aloud protocol can surface why a user hesitated, and may change timing. State how measurements were collected. Label simulated or illustrative results explicitly.

## Nielsen's heuristic evaluation

Set evaluator, date, product or version, task, and starting state. Walk the main and applicable alternative tasks. In the worksheet, enter observed issues and recommendations under the relevant heuristics. Mark the portions you inspected for which no issue was observed and record any coverage limitations. Give each issue a precise screen/step, what the user sees or does, likely task impact and a feasible correction. If rating severity, apply the same scale consistently and distinguish cosmetic, minor, major and catastrophic findings as shown in the lecture. Keep the highest-impact finding easy to locate.

| # | Heuristic | Inspectable design question |
| --- | --- | --- |
| 1 | Visibility of system status | Can people tell what is happening and what happened after their action, including during waits? |
| 2 | Match between system and the real world | Do terminology, order and control mappings reflect the user's domain and expectations? |
| 3 | User control and freedom | Can users go back, cancel, undo or otherwise leave a mistaken or unwanted path? |
| 4 | Consistency and standards | Do repeated patterns behave predictably across this interface and follow useful platform conventions? |
| 5 | Error prevention | Do defaults, constraints, validation and proportionate confirmation reduce likely slips or risky actions before commitment? |
| 6 | Recognition rather than recall | Are relevant labels, choices, context and hints visible or easily retrieved at the point of need? |
| 7 | Flexibility and efficiency of use | Can novices find a visible path while experienced users can accelerate or tailor frequent actions? |
| 8 | Aesthetic and minimalist design | Do visible elements help the task and preserve the prominence of relevant information? |
| 9 | Help users recognize, diagnose and recover from errors | Does the message say what happened in plain language, preserve context, and offer an actionable next step? |
| 10 | Help and documentation | Can users quickly find contextual, concrete steps when they need help? |

An issue may touch several heuristics. Use the best-fitting one and cross-reference related issues when helpful. An inspection identifies potential problems. Observed user testing can check their impact. A formative evaluation feeds revisions. A summative evaluation checks a defined result against criteria.

## Predictive evaluation

### Fitts' Law

For the standard form used in the lectures, `MT = a + b × log₂(D/W + 1)`. The Fitts deck also shows a simplified `T = k × log₂(D/S + 1)`. The separate illustrated reading uses `MT = a + b × log₂(2A/W)`, with A for movement amplitude. State which formulation and coefficients are being used. Measure movement distance from the starting position and the effective target width along the approach direction. Use consistent units for distance and width. Compare relative difficulty when no calibrated movement-time coefficients are available.

Judge the actual target hit area and starting context. A large nearby target is typically easier to acquire, with diminishing returns as size increases. The course reading distinguishes one-dimensional formal assumptions from practical two-dimensional targets. For pointer interfaces, a true screen edge or corner can constrain overshoot. A small nonclickable margin can remove the advantage. Treat mouse, touch and keyboard as different interaction contexts. Fitts' Law predicts movement acquisition, with visual search, decisions and errors evaluated separately.

### GOMS and the Keystroke-Level Model

- **Goals** are outcomes and subgoals in the user's terms. **Operators** are actions. **Methods** are learned sequences of operators and subgoals. **Selection rules** specify when a method is chosen among alternatives.
- KLM estimates execution time for a skilled user following a specified method. State the starting location and state, input device and task assumptions. Write the operator sequence, place mental operators consistently, total times and compare realistic scenarios and frequencies.
- Operators in the deck are **K** (key or button), **P** (point), **H** (home the hand on another input device), **M** (mental preparation), **D** (draw), and **R** (unavoidable response wait). Example constants are K 0.2 s, P 1.1 s, H 0.4 s and M 1.35 s. Use task-specific measurements where warranted. Avoid counting response wait twice if it overlaps another operator.
- The scan's mental-operator rules insert candidate M before K and before command-selecting P. Remove anticipated M, extra M within a cognitive unit, M before a redundant consecutive terminator or constant command terminator, and the portion of M overlapped by R. Keep M before the terminator of a variable argument where appropriate.
- The lecture's radio-button example gives 7.15 s when a switch is required and 4.10 s with the existing selection, averaging 5.625 s under equal frequency. The scan begins the existing-selection case at the keyboard, omits H and reports 3.70 s, averaging about 5.4 s. The lecture's graphical thermometer example retains a second P and M at 5.70 s, while the scan's preset-range best case gives 3.25 s with a different operator treatment. Label whichever sequence the analysis uses, and include realistic range/precision changes when they occur.
- Use structured walkthroughs or actual task tests for discoverability, first-time learning, error rates and lived UX. Use KLM as a comparative prediction, with assumptions visible.

## Reference handouts

- **Heuristic evaluation workbook.** Six pages with an evaluator/task header, prompts and spaces for issues and recommendations across all ten heuristics.
- **GOMS scanned reading.** The marked-up fox sentence and accompanying table decompose a familiar action. The temperature converter diagrams compare a dialog with radio buttons against direct manipulation of linked scales. The latter makes range, resolution, starting state and decimal precision visible sources of cost. The scans cover introductory GOMS, interface timings, operator rules and the comparative example.
- **Visualizing Fitts's Law.** The six-page reading explains the size/distance relationship, diminishing returns, movement direction and target shape. Its diagrams show the entry direction, target geometry, infinite edges and corners, and why small dead margins matter. Apply the constraint to the real screen/device setup.

