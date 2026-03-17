// ============================================================
// TARGET DATE CONFIGURATION
// Change this date to update the countdown target.
// Format: "YYYY-MM-DD"
// ============================================================
const targetDate = new Date("2026-06-30");

// ============================================================
// SCENARIO CONFIGURATION
// Controls the tone of the AI-generated text and images.
//
// Available options:
//   "teaching-end-teacher"  — end of teaching period (for teachers)
//                             stress: grading, preparing exams, office hours, admin
//   "teaching-end-student"  — end of teaching period (for students)
//                             stress: cramming, exams, last-minute submissions
//   "grant-deadline"        — end of grant proposal deadline
//                             stress: late-night writing, budgets, co-authors
//   "thesis-submission"     — student submitting their final thesis
//                             stress: writing, formatting, last-minute panic, supervisor feedback
//   "thesis-defense"        — student defending their thesis
//                             stress: viva prep, presentation nerves, committee questions
//   "contract-end-boss"     — boss counting down until a problem employee's contract ends
//                             stress: covering for them, fixing their damage, staying professional
//   "contract-end-employee" — employee counting down until they can escape a toxic boss
//                             stress: micromanagement, unfair treatment, survival mode
// ============================================================
const scenario = "teaching-end-teacher";
