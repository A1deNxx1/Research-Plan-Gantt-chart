"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Category =
  | "ethics"
  | "recruitment"
  | "making"
  | "fieldwork"
  | "writing"
  | "feedback"
  | "revision"
  | "internship"
  | "leave";

type Task = {
  id: string;
  title: string;
  short?: string;
  start: string;
  end: string;
  category: Category;
  detail: string;
  meta?: string[];
  provisional?: boolean;
};

type OutputGroup = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  venue: string;
  tasks: Task[];
};

type Deadline = {
  date: string;
  label: string;
  kind: "hard" | "target";
};

type YearPlan = {
  id: "y1" | "y2" | "y3";
  label: string;
  yearName: string;
  dates: string;
  start: string;
  end: string;
  accent: string;
  soft: string;
  ink: string;
  groups: OutputGroup[];
  deadlines: Deadline[];
};

type TaskEdit = Partial<Pick<Task, "title" | "start" | "end" | "detail" | "category">>;
type Edits = Record<string, TaskEdit>;
type SaveTaskEdit = (taskId: string, edit: TaskEdit) => Promise<boolean>;

const CATEGORY_LABELS: Record<Category, string> = {
  ethics: "Ethics approval",
  recruitment: "Recruitment",
  making: "Design, making & development",
  fieldwork: "Experiment & data collection",
  writing: "Analysis & writing",
  feedback: "Supervisor review & feedback",
  revision: "Revision & finalisation",
  internship: "Industry collaboration",
  leave: "Annual leave",
};

const PALETTES: Record<YearPlan["id"], Record<Category, string>> = {
  y1: {
    ethics: "#b96f45",
    recruitment: "#d08d5f",
    making: "#d39b45",
    fieldwork: "#7f9871",
    writing: "#477e78",
    feedback: "#667c9e",
    revision: "#785b7d",
    internship: "#a86259",
    leave: "#aaa39a",
  },
  y2: {
    ethics: "#388184",
    recruitment: "#4b9691",
    making: "#3d8da2",
    fieldwork: "#55a4a6",
    writing: "#3e75a2",
    feedback: "#5f70aa",
    revision: "#555697",
    internship: "#2f6a73",
    leave: "#92a0a1",
  },
  y3: {
    ethics: "#82658f",
    recruitment: "#997196",
    making: "#9669a0",
    fieldwork: "#ad6c8b",
    writing: "#725b8a",
    feedback: "#8770a0",
    revision: "#624b78",
    internship: "#775d83",
    leave: "#a499a5",
  },
};

const YEARS: YearPlan[] = [
  {
    id: "y1",
    label: "2026/27",
    yearName: "Year 1",
    dates: "Sep 2026 — Sep 2027",
    start: "2026-09-01",
    end: "2027-10-01",
    accent: "#a75532",
    soft: "#f8ede6",
    ink: "#5f2f1f",
    deadlines: [
      { date: "2027-01-14", label: "DIS critical review target week", kind: "target" },
      { date: "2027-02-12", label: "DIS WIP target week", kind: "target" },
      { date: "2027-09-01", label: "Annual Progression 1", kind: "hard" },
      { date: "2027-09-08", label: "CHI full paper target week", kind: "target" },
    ],
    groups: [
      {
        id: "foundational-review",
        number: "01",
        eyebrow: "Foundational Study · Critical review",
        title: "Future work and social roles of urban robots",
        venue: "DIS 2027 Full Paper · Critical Computing",
        tasks: [
          {
            id: "foundational-review-write",
            title: "Critical review & full-paper write-up",
            short: "Critical review",
            start: "2026-09-15",
            end: "2026-11-30",
            category: "writing",
            detail: "Critically review how urban robots have been framed as work machines or high-efficiency workers. From a more-than-human perspective, ask what the ‘future work’ of urban robots could mean beyond functionality, including the social roles they might take on. The review positions the background for the subsequent studies.",
            meta: ["More-than-human perspective", "Critical Computing Subcommittee", "Positions the later empirical and design studies"],
          },
          {
            id: "foundational-review-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2026-11-01",
            end: "2026-12-14",
            category: "feedback",
            detail: "Share the developing critical-review manuscript with supervisors from November, allowing review and feedback to run alongside the final month of writing and continue through mid-December.",
          },
          {
            id: "foundational-review-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2026-12-15",
            end: "2027-01-14",
            category: "revision",
            detail: "Revise and finalise the DIS 2027 full paper from mid-December to mid-January, including the Critical Computing framing and submission package.",
          },
        ],
      },
      {
        id: "dis-wip",
        number: "02",
        eyebrow: "Study 1 · Early output",
        title: "DIS 2027 Work in Progress",
        venue: "DIS 2027",
        tasks: [
          {
            id: "s1-ethics",
            title: "Study 1 ethics review",
            short: "Ethics",
            start: "2026-09-15",
            end: "2026-10-14",
            category: "ethics",
            detail: "Submit in the third week of September and reserve a full four-week review window before fieldwork.",
            meta: ["4-week review window", "Precondition for workshops"],
          },
          {
            id: "s1-recruit",
            title: "Participant recruitment",
            short: "Recruitment",
            start: "2026-10-15",
            end: "2027-02-28",
            category: "recruitment",
            detail: "Recruit 24 Newcastle participants aged 15+, aiming for three groups of eight with varied ages, genders and occupations.",
            meta: ["24 participants", "3 workshops × 8 people", "No prior AI knowledge required"],
          },
          {
            id: "s1-workshops-12",
            title: "Workshop 1",
            short: "Workshop 1",
            start: "2026-11-15",
            end: "2026-12-14",
            category: "fieldwork",
            detail: "Run the first co-speculative workshop using BinBot, BenchBot and PlanterBot scenarios, concept cards, paper models, GenAI visualisation and role-play.",
            meta: ["Audio + video", "Storyboards & role cards", "Bodystorming / enactment"],
          },
          {
            id: "dis-wip-draft",
            title: "DIS WIP paper write-up",
            short: "WIP write-up",
            start: "2026-12-15",
            end: "2027-01-14",
            category: "writing",
            detail: "Write the work-in-progress paper from Workshop 1. The fourth week of December is protected as Christmas leave.",
            meta: ["Includes Workshop 1", "Christmas week excluded"],
          },
          {
            id: "christmas-2026",
            title: "Christmas break",
            short: "Christmas",
            start: "2026-12-22",
            end: "2026-12-31",
            category: "leave",
            detail: "Protected Christmas week. No planned research activity or supervisor turnaround is assumed.",
          },
          {
            id: "wip-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2027-01-15",
            end: "2027-01-31",
            category: "feedback",
            detail: "Supervisor review and feedback begins in January W3, after the supervisors’ annual leave, and continues through the end of January.",
          },
          {
            id: "wip-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2027-02-01",
            end: "2027-02-07",
            category: "revision",
            detail: "Apply supervisor review and feedback, tighten claims and evidence, and prepare the DIS WIP paper for submission.",
          },
          {
            id: "china-leave-1",
            title: "Annual leave · China",
            short: "Leave",
            start: "2027-02-15",
            end: "2027-02-28",
            category: "leave",
            detail: "Two weeks of annual leave in China. Study 2 ethics review continues in parallel, but no active fieldwork is planned.",
          },
        ],
      },
      {
        id: "hri-full-study",
        number: "02",
        eyebrow: "Study 1 · Complete research",
        title: "Imagined design spaces of urban robot roles",
        venue: "HRI 2028 · alternative DIS 2028",
        tasks: [
          {
            id: "s1-workshop-3",
            title: "Workshop 3",
            short: "Workshop 3",
            start: "2027-03-01",
            end: "2027-03-07",
            category: "fieldwork",
            detail: "Run the third comparative workshop with the same core scenarios and a rotated presentation order.",
            meta: ["Final Study 1 workshop", "Comparable structure across sessions"],
          },
          {
            id: "s1-synthesis-draft",
            title: "Analyse all workshops + full-study draft",
            short: "Synthesis + draft",
            start: "2027-03-01",
            end: "2027-03-21",
            category: "writing",
            detail: "Analyse new data alongside Workshops 1–2 and the DIS WIP, using reflexive thematic analysis to produce the first full-study manuscript.",
            meta: ["Reflexive thematic analysis", "Audio, video, artefacts & notes"],
          },
          {
            id: "s1-to-prototype-ideas",
            title: "Translate findings into 3 prototype concepts",
            short: "3 concepts",
            start: "2027-03-22",
            end: "2027-03-31",
            category: "making",
            detail: "Use Study 1 findings to choose three promising social-role concepts and define a build and deployment approach for each.",
            meta: ["Decision gate", "Feeds Study 2"],
          },
          {
            id: "hri-paper-iterate",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2027-03-01",
            end: "2027-04-30",
            category: "feedback",
            detail: "Share sections with supervisors as they are drafted so review and feedback run continuously alongside Study 1 analysis and writing, then continue during Prototype 1 development.",
            meta: ["Parallel workstream", "Target: HRI 2028"],
          },
          {
            id: "hri-paper-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2027-05-01",
            end: "2027-05-31",
            category: "revision",
            detail: "Apply supervisor review and feedback, refine the complete Study 1 argument and finalise the HRI 2028 submission.",
            meta: ["Parallel workstream", "Target: HRI 2028"],
          },
        ],
      },
      {
        id: "study2-empirical",
        number: "03",
        eyebrow: "Study 2 · Comparative public deployments",
        title: "Three object-based urban robot prototypes",
        venue: "CHI 2028",
        tasks: [
          {
            id: "s2-ethics",
            title: "Study 2 ethics review",
            short: "Ethics",
            start: "2027-02-15",
            end: "2027-03-14",
            category: "ethics",
            detail: "Submit before leave and reserve four weeks for review. Public deployment must not begin until approval is in place.",
            meta: ["4-week review window", "Public-space deployment"],
          },
          {
            id: "prototype-1-build",
            title: "Prototype 1 · design & build",
            short: "Build 1",
            start: "2027-04-01",
            end: "2027-04-21",
            category: "making",
            detail: "Build the first lightweight research prototype or urban probe, using Wizard-of-Oz control where appropriate.",
          },
          {
            id: "prototype-1-field",
            title: "Prototype 1 · public deployment",
            short: "Deploy 1",
            start: "2027-04-22",
            end: "2027-04-30",
            category: "fieldwork",
            detail: "One-week signposted public deployment with observation, two-camera video, short voluntary interviews and researcher field notes.",
            meta: ["Approx. 20–30 interactants", "5–10 min interviews", "2 hours each afternoon"],
          },
          {
            id: "prototype-2-build",
            title: "Prototype 2 · design & build",
            short: "Build 2",
            start: "2027-05-01",
            end: "2027-05-21",
            category: "making",
            detail: "Build the second lightweight prototype, documenting design decisions and the making process for the later design-research output.",
          },
          {
            id: "prototype-2-field",
            title: "Prototype 2 · public deployment",
            short: "Deploy 2",
            start: "2027-05-22",
            end: "2027-05-31",
            category: "fieldwork",
            detail: "Deploy the second prototype and collect comparable behavioural, interview and observational data.",
          },
          {
            id: "prototype-3-build",
            title: "Prototype 3 · design & build",
            short: "Build 3",
            start: "2027-06-01",
            end: "2027-06-21",
            category: "making",
            detail: "Build the third prototype, completing the comparative set derived from Study 1.",
          },
          {
            id: "prototype-3-field",
            title: "Prototype 3 · public deployment",
            short: "Deploy 3",
            start: "2027-06-22",
            end: "2027-06-30",
            category: "fieldwork",
            detail: "Deploy the third prototype and complete the comparative public-space dataset.",
          },
          {
            id: "s2-analysis-draft",
            title: "Comparative analysis & first draft",
            short: "Analysis + draft",
            start: "2027-07-01",
            end: "2027-07-31",
            category: "writing",
            detail: "Combine bottom-up video interaction analysis, field notes and interview thematic analysis across all three robots.",
            meta: ["Cross-prototype comparison", "Behaviour + interview evidence"],
          },
          {
            id: "s2-chi-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2027-07-01",
            end: "2027-08-14",
            category: "feedback",
            detail: "Supervisors review successive sections from the start of comparative analysis and writing, continuing through the first two August planning weeks.",
          },
          {
            id: "s2-chi-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2027-08-15",
            end: "2027-08-31",
            category: "revision",
            detail: "Apply supervisor review and feedback and prepare the final CHI full-paper submission package during the final two August planning weeks.",
          },
          {
            id: "s3-ethics",
            title: "Study 3 ethics review",
            short: "Study 3 ethics",
            start: "2027-09-01",
            end: "2027-09-30",
            category: "ethics",
            detail: "Reserve all four September planning weeks for the Study 3 ethics review before Year 2 begins.",
            meta: ["4-week review window", "Covers all of September"],
          },
          {
            id: "september-leave-1",
            title: "Annual leave",
            short: "Leave",
            start: "2027-09-08",
            end: "2027-09-30",
            category: "leave",
            detail: "Three weeks of annual leave after the target CHI submission week. Ethics review continues in parallel.",
          },
        ],
      },
    ],
  },
  {
    id: "y2",
    label: "2027/28",
    yearName: "Year 2",
    dates: "Oct 2027 — Sep 2028",
    start: "2027-10-01",
    end: "2028-10-01",
    accent: "#21777c",
    soft: "#e8f4f3",
    ink: "#164d51",
    deadlines: [
      { date: "2028-01-12", label: "DIS paper target week", kind: "target" },
      { date: "2028-09-01", label: "Annual Progression 2", kind: "hard" },
      { date: "2028-09-07", label: "CHI/HRI target window", kind: "target" },
    ],
    groups: [
      {
        id: "study2-design",
        number: "03",
        eyebrow: "Study 2 · Design research",
        title: "Making insights, recommendations & guidelines",
        venue: "DIS / C&C 2028",
        tasks: [
          {
            id: "design-process-synthesis",
            title: "Organise making process & synthesise findings",
            short: "Design synthesis",
            start: "2027-10-01",
            end: "2027-11-14",
            category: "writing",
            detail: "Curate the three prototypes’ design and making evidence, connect it to Study 1 findings, and draft design recommendations or guidelines.",
            meta: ["Text paper or pictorial", "Alternative: C&C 2028"],
          },
          {
            id: "design-paper-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2027-10-01",
            end: "2027-11-30",
            category: "feedback",
            detail: "Supervisors review the design-research paper continuously from the start of writing, responding to successive sections through the end of November.",
          },
          {
            id: "design-paper-revise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2027-12-01",
            end: "2027-12-14",
            category: "revision",
            detail: "Revise the paper or pictorial, finalise images and evidence, and prepare the submission package.",
          },
        ],
      },
      {
        id: "study3-empirical",
        number: "04",
        eyebrow: "Study 3 · Comparative field deployment",
        title: "Robot roles across different citizen groups",
        venue: "CHI / HRI 2029",
        tasks: [
          {
            id: "s3-recruitment",
            title: "Recruit Study 3 participants",
            short: "Recruitment",
            start: "2027-11-15",
            end: "2028-05-14",
            category: "recruitment",
            detail: "Recruit citizens and workers for naturally occurring encounters, short interviews and a later mixed focus group.",
            meta: ["6–10 citizens", "6–10 workers", "3–5 per group for mixed focus group"],
          },
          {
            id: "s3-rethink",
            title: "Reframe Study 3 after feedback",
            short: "Reframe",
            start: "2028-01-01",
            end: "2028-01-14",
            category: "writing",
            detail: "A focused decision week to revisit the research design, deployment groups and the selected robot case.",
          },
          {
            id: "china-leave-2",
            title: "Annual leave · China",
            short: "Leave",
            start: "2028-01-22",
            end: "2028-02-14",
            category: "leave",
            detail: "Protected annual leave covering the fourth week of January and the first two weeks of February.",
          },
          {
            id: "industry-placement",
            title: "Candidate 3-month industry placement",
            short: "Industry placement",
            start: "2028-04-01",
            end: "2028-06-30",
            category: "internship",
            detail: "Provisional collaboration window with Microsoft Research Cambridge or Nokia Bell Labs Cambridge to co-develop and deploy the AI-enabled prototype; a visiting-PhD arrangement is an alternative.",
            meta: ["Timing to confirm", "Partner to confirm", "Runs alongside build + deployment"],
            provisional: true,
          },
          {
            id: "s3-ai-build",
            title: "AI development",
            short: "AI development",
            start: "2028-02-15",
            end: "2028-05-14",
            category: "making",
            detail: "Develop one Study 2 case into a more functional AI-enabled robot for comparative deployment across citizens and workers.",
            meta: ["Candidate case: BinBot", "Functional AI version"],
          },
          {
            id: "s3-experiment",
            title: "Field experiment & data collection",
            short: "Field study",
            start: "2028-05-15",
            end: "2028-06-14",
            category: "fieldwork",
            detail: "Observe naturally occurring encounters, run short post-encounter interviews and convene a mixed-group focus group using selected video clips.",
            meta: ["Citizens + workers", "Video interaction analysis", "Mixed focus group"],
          },
          {
            id: "s3-demo-write",
            title: "AI prototype demo write-up",
            short: "Demo write-up",
            start: "2028-05-15",
            end: "2028-06-14",
            category: "writing",
            detail: "Prepare the selected AI-enabled object-based robot as a demo contribution while the Study 3 field experiment and data collection are underway.",
            meta: ["Runs alongside field study", "AI-enabled prototype", "Target: HRI demo"],
          },
          {
            id: "s3-analysis",
            title: "Analysis & first manuscript draft",
            short: "Analysis + draft",
            start: "2028-06-15",
            end: "2028-07-14",
            category: "writing",
            detail: "Combine video interaction analysis, reflexive thematic analysis and cross-group comparison into the first empirical paper draft.",
          },
          {
            id: "s3-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2028-06-15",
            end: "2028-07-31",
            category: "feedback",
            detail: "Share Study 3 analysis and manuscript sections with the supervisory team and industry host as they are drafted, enabling continuous review through July.",
            meta: ["Industry host + supervisors", "Rolling section-by-section review"],
          },
          {
            id: "s3-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2028-08-01",
            end: "2028-08-14",
            category: "revision",
            detail: "Apply the consolidated feedback and finalise the empirical paper during the first two August planning weeks.",
            meta: ["Target: CHI / HRI 2029", "Two planning weeks"],
          },
          {
            id: "september-leave-2",
            title: "Annual leave",
            short: "Leave",
            start: "2028-09-08",
            end: "2028-09-30",
            category: "leave",
            detail: "Three protected weeks of annual leave after Annual Progression 2 and the provisional submission window.",
          },
        ],
      },
    ],
  },
  {
    id: "y3",
    label: "2028/29",
    yearName: "Year 3",
    dates: "Oct 2028 — Sep 2029",
    start: "2028-10-01",
    end: "2029-10-01",
    accent: "#73507e",
    soft: "#f2ecf5",
    ink: "#4b3453",
    deadlines: [
      { date: "2029-01-31", label: "PACMHCI target submission", kind: "target" },
      { date: "2029-09-28", label: "PhD thesis submission", kind: "hard" },
    ],
    groups: [
      {
        id: "robot-citizens-journal",
        number: "05",
        eyebrow: "Study 4 · Synthesis / framework",
        title: "Defining “robot citizens” across three studies",
        venue: "PACMHCI CSCW",
        tasks: [
          {
            id: "framework-write",
            title: "Cross-study synthesis & journal draft",
            short: "Journal draft",
            start: "2028-10-01",
            end: "2028-12-31",
            category: "writing",
            detail: "Synthesise all three studies into an empirically grounded account of how urban robotic objects can become more than functional tools and enter shared urban life.",
            meta: ["Empirical + theoretical synthesis", "Robot citizens framework"],
          },
          {
            id: "framework-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2028-10-01",
            end: "2029-01-14",
            category: "feedback",
            detail: "Share the cross-study synthesis and framework with supervisors section by section from the start of writing, continuing review through the first two January planning weeks.",
          },
          {
            id: "framework-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2029-01-15",
            end: "2029-01-31",
            category: "revision",
            detail: "Apply supervisor review and feedback and prepare the PACMHCI CSCW submission. The exact track deadline remains to be confirmed.",
          },
          {
            id: "china-leave-3",
            title: "Annual leave · China",
            short: "Leave",
            start: "2029-01-15",
            end: "2029-02-07",
            category: "leave",
            detail: "Protected annual leave from mid-January through the first week of February.",
          },
        ],
      },
      {
        id: "side-study",
        number: "06",
        eyebrow: "Potential side study · Critical counterpoint",
        title: "A public art provocation on privacy & surveillance",
        venue: "CHI / HRI 2030 · short paper / art paper / demo",
        tasks: [
          {
            id: "side-build",
            title: "Develop & make the public artwork",
            short: "Art provocation",
            start: "2029-02-08",
            end: "2029-04-30",
            category: "making",
            detail: "Create a critical public installation that makes the sensing, image-capture and data-collection risks of urban AI robots tangible to citizens.",
            meta: ["Privacy & surveillance", "Critical counterpoint to the PhD", "Timing remains provisional"],
            provisional: true,
          },
          {
            id: "side-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2029-04-29",
            end: "2029-05-12",
            category: "feedback",
            detail: "Provisional supervisor review of the side-study framing, evidence and venue fit as the public artwork development concludes.",
            provisional: true,
          },
          {
            id: "side-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2029-05-13",
            end: "2029-05-28",
            category: "revision",
            detail: "Apply feedback and prepare the short paper, art paper or demo submission package.",
            provisional: true,
          },
        ],
      },
      {
        id: "thesis-impact",
        number: "07",
        eyebrow: "PHD PROJECT CLOSING & social impact",
        title: "Final thesis, public exhibition & viva preparation",
        venue: "PhD submission · 28 Sep 2029",
        tasks: [
          {
            id: "thesis-write",
            title: "Write final thesis",
            short: "Thesis writing",
            start: "2029-02-08",
            end: "2029-07-31",
            category: "writing",
            detail: "Write the final thesis across Studies 1–3, integrating the empirical, design/artifact and theoretical contributions.",
          },
          {
            id: "exhibition-plan",
            title: "Find creative partner & plan exhibition",
            short: "Exhibition",
            start: "2029-02-08",
            end: "2029-07-31",
            category: "making",
            detail: "Identify a creative organisation and shape a solo exhibition of research findings and prototypes to extend social impact.",
            meta: ["Partner to confirm", "Research prototypes + public programme"],
            provisional: true,
          },
          {
            id: "thesis-feedback",
            title: "Supervisor review & feedback",
            short: "Review & feedback",
            start: "2029-05-01",
            end: "2029-07-31",
            category: "feedback",
            detail: "Send each completed thesis chapter to supervisors while the next chapter is being written. This creates a deliberate stagger: supervisors review the previous draft while writing continues, enabling timely feedback before the full thesis is complete.",
            meta: ["Rolling chapter-by-chapter review", "Runs alongside thesis writing", "May–July"],
          },
          {
            id: "thesis-finalise",
            title: "Revision & finalisation",
            short: "Finalisation",
            start: "2029-08-01",
            end: "2029-09-28",
            category: "revision",
            detail: "Apply supervisor review and feedback, complete quality checks and prepare the final submission files before the 28 September deadline.",
          },
          {
            id: "viva-practice",
            title: "Viva rehearsal",
            short: "Viva practice",
            start: "2029-08-01",
            end: "2029-09-27",
            category: "feedback",
            detail: "Run repeated viva rehearsals alongside final thesis revisions, focusing on contribution, methodological choices and limitations.",
          },
        ],
      },
    ],
  },
];

function asTime(value: string) {
  return Date.parse(`${value}T00:00:00Z`);
}

function planningWeekIndex(value: string) {
  const point = new Date(`${value}T00:00:00Z`);
  return Math.min(3, Math.floor((point.getUTCDate() - 1) / 7));
}

function planningWeekBounds(value: string, forcedIndex?: number) {
  const point = new Date(`${value}T00:00:00Z`);
  const year = point.getUTCFullYear();
  const month = point.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const index = forcedIndex ?? planningWeekIndex(value);
  const startDay = index * 7 + 1;
  const endDay = index === 3 ? daysInMonth : Math.min(daysInMonth, startDay + 6);

  return { index, startDay, endDay, monthStart };
}

function planningWeekRange(value: string, forcedIndex?: number) {
  const { index, startDay, endDay, monthStart } = planningWeekBounds(value, forcedIndex);
  const monthName = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(monthStart);
  return `W${index + 1} · ${startDay}–${endDay} ${monthName}`;
}

function position(value: string, start: string, end: string) {
  const point = new Date(`${value}T00:00:00Z`);
  const first = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  const monthIndex = (point.getUTCFullYear() - first.getUTCFullYear()) * 12 + point.getUTCMonth() - first.getUTCMonth();
  const monthCount = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth();
  const { index, startDay, endDay } = planningWeekBounds(value);
  const fraction = (point.getUTCDate() - startDay) / Math.max(1, endDay - startDay + 1);
  const weekProgress = index + Math.min(0.98, Math.max(0, fraction));
  return ((monthIndex * 4 + weekProgress) / (monthCount * 4)) * 100;
}

function weekSlot(value: string, start: string) {
  const point = new Date(`${value}T00:00:00Z`);
  const first = new Date(`${start}T00:00:00Z`);
  const monthIndex = (point.getUTCFullYear() - first.getUTCFullYear()) * 12 + point.getUTCMonth() - first.getUTCMonth();
  return monthIndex * 4 + planningWeekIndex(value);
}

function taskPosition(task: Task, year: YearPlan) {
  const totalWeeks = monthSegments(year).length * 4;
  const firstSlot = Math.max(0, weekSlot(task.start, year.start));
  const lastSlot = Math.min(totalWeeks, weekSlot(task.end, year.start) + 1);
  const left = (firstSlot / totalWeeks) * 100;
  const width = (Math.max(1, lastSlot - firstSlot) / totalWeeks) * 100;
  return { left: `${left}%`, width: `${width}%` };
}

function timelineWeekSpan(task: Task, year: YearPlan) {
  return Math.max(1, weekSlot(task.end, year.start) - weekSlot(task.start, year.start) + 1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function monthSegments(year: YearPlan) {
  const result: { label: string; left: number; width: number; year: string; monthStart: string }[] = [];
  const end = new Date(`${year.end}T00:00:00Z`);
  const cursor = new Date(`${year.start}T00:00:00Z`);
  const totalMonths = (end.getUTCFullYear() - cursor.getUTCFullYear()) * 12 + end.getUTCMonth() - cursor.getUTCMonth();
  let index = 0;
  while (cursor < end) {
    result.push({
      label: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(cursor),
      year: String(cursor.getUTCFullYear()),
      monthStart: `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-01`,
      left: (index / totalMonths) * 100,
      width: (1 / totalMonths) * 100,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    index += 1;
  }
  return result;
}

function mergeTask(task: Task, edits: Edits): Task {
  return { ...task, ...(edits[task.id] ?? {}) };
}

function MarkIcon({ type }: { type: "edit" | "print" }) {
  return <span className={`mark-icon mark-${type}`} aria-hidden="true" />;
}

function DeadlineLines({ year }: { year: YearPlan }) {
  return (
    <>
      {year.deadlines.map((deadline) => (
        <span
          aria-hidden="true"
          className={`deadline-line ${deadline.kind}`}
          key={`${deadline.date}-${deadline.label}`}
          style={{ left: `${position(deadline.date, year.start, year.end)}%` }}
        />
      ))}
    </>
  );
}

function MonthGrid({ year }: { year: YearPlan }) {
  const segments = monthSegments(year);
  return (
    <>
      {segments.slice(1).map((month) => (
        <span
          aria-hidden="true"
          className="month-line"
          key={`${month.year}-${month.label}`}
          style={{ left: `${month.left}%` }}
        />
      ))}
    </>
  );
}

function YearGantt({
  year,
  edits,
  editing,
  onTask,
}: {
  year: YearPlan;
  edits: Edits;
  editing: boolean;
  onTask: (task: Task, group: OutputGroup, year: YearPlan) => void;
}) {
  const segments = monthSegments(year);
  const weeks = segments.length * 4;
  const visibleCategories = (Object.keys(CATEGORY_LABELS) as Category[]).filter((category) =>
    year.groups.some((group) => group.tasks.some((task) => task.category === category)),
  );
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollMax, setScrollMax] = useState(0);
  const chartStyle = {
    "--year-accent": year.accent,
    "--year-soft": year.soft,
    "--year-ink": year.ink,
    "--weeks": weeks,
  } as CSSProperties;

  useEffect(() => {
    const chart = chartScrollRef.current;
    if (!chart) return;

    function updateScrollRange() {
      const max = Math.max(0, chart.scrollWidth - chart.clientWidth);
      setScrollMax(max);
      setScrollLeft(Math.min(chart.scrollLeft, max));
    }

    updateScrollRange();
    const observer = new ResizeObserver(updateScrollRange);
    observer.observe(chart);
    if (chart.firstElementChild) observer.observe(chart.firstElementChild);
    window.addEventListener("resize", updateScrollRange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollRange);
    };
  }, [year.id]);

  function moveTimeline(nextPosition: number, smooth = false) {
    const chart = chartScrollRef.current;
    if (!chart) return;
    const boundedPosition = Math.max(0, Math.min(scrollMax, nextPosition));
    setScrollLeft(boundedPosition);
    chart.scrollTo({
      left: boundedPosition,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  return (
    <section className="year-card" style={chartStyle} aria-labelledby={`${year.id}-heading`}>
      <div className="year-card-topline">
        <div>
          <span className="year-index">{year.yearName}</span>
          <h2 id={`${year.id}-heading`}>{year.label}</h2>
        </div>
        <p>{year.dates}</p>
      </div>

      <div className="stage-legend" aria-label={`${year.yearName} phase colour legend`}>
        {visibleCategories.map((category) => (
          <span key={category}>
            <i style={{ background: PALETTES[year.id][category] }} />
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>

      <div className="scroll-note">Scroll horizontally to inspect weeks →</div>
      <div className="gantt-scroll-control">
        <span>BROWSE THE FULL TIMELINE</span>
        <div className="timeline-scroll-tools">
          <button
            className="timeline-scroll-button"
            type="button"
            aria-label={`Scroll ${year.yearName} timeline left`}
            disabled={scrollLeft <= 0}
            onClick={() => moveTimeline(scrollLeft - 420, true)}
          >
            ←
          </button>
          <input
            className="timeline-scroll-range"
            type="range"
            min="0"
            max={Math.max(1, scrollMax)}
            step="1"
            value={Math.min(scrollLeft, scrollMax)}
            disabled={scrollMax <= 0}
            aria-label={`Drag to browse the full ${year.yearName} timeline`}
            onInput={(event) => moveTimeline(Number(event.currentTarget.value))}
            onChange={(event) => moveTimeline(Number(event.currentTarget.value))}
          />
          <button
            className="timeline-scroll-button"
            type="button"
            aria-label={`Scroll ${year.yearName} timeline right`}
            disabled={scrollLeft >= scrollMax}
            onClick={() => moveTimeline(scrollLeft + 420, true)}
          >
            →
          </button>
        </div>
        <div className="floating-month-guide" aria-hidden="true">
          <div
            className="floating-month-track"
            style={{
              width: "var(--timeline-width)",
              transform: `translate3d(-${scrollLeft}px, 0, 0)`,
            }}
          >
            {segments.map((month) => (
              <span
                key={`${month.year}-${month.label}`}
                style={{ left: `${month.left}%`, width: `${month.width}%` }}
              >
                <strong>{month.label}</strong>
                <small>{month.label === "Jan" || month.left === 0 ? month.year : ""}</small>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        className="gantt-scroll gantt-body-scroll"
        ref={chartScrollRef}
        onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
      >
        <div className="gantt-canvas">
          <div className="axis-label sticky-cell">
            <span>OUTPUTS & PHASES</span>
            <small>Click any coloured bar for detail</small>
          </div>
          <div className="month-axis">
            {segments.map((month) => (
              <div
                className="month-cell"
                key={`${month.year}-${month.label}`}
                style={{ left: `${month.left}%`, width: `${month.width}%` }}
              >
                <div className="month-name">
                  <strong>{month.label}</strong>
                  <small>{month.label === "Jan" || month.left === 0 ? month.year : ""}</small>
                </div>
                <div className="week-labels" aria-label={`${month.label} ${month.year}, four planning weeks`}>
                  {[0, 1, 2, 3].map((weekIndex) => (
                    <span key={weekIndex} title={planningWeekRange(month.monthStart, weekIndex)}>
                      W{weekIndex + 1}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="deadline-label sticky-cell">
            <span>KEY DATES</span>
            <small>◆ fixed · ◇ target</small>
          </div>
          <div className="deadline-rail">
            <MonthGrid year={year} />
            {year.deadlines.map((deadline, deadlineIndex) => (
              <div
                className={`deadline-pin ${deadline.kind} lane-${deadlineIndex % 2}`}
                key={`${deadline.date}-${deadline.label}`}
                style={{ left: `${position(deadline.date, year.start, year.end)}%` }}
              >
                <i />
                <span>{deadline.label}</span>
              </div>
            ))}
          </div>

          {year.groups.map((group) => (
            <div className="output-group" key={group.id}>
              <div className="group-heading sticky-cell">
                <span className="group-number">{group.number}</span>
                <div>
                  <p>{group.eyebrow}</p>
                  <h3>{group.title}</h3>
                  <span className="venue-chip">{group.venue}</span>
                </div>
              </div>
              <div className="group-heading-timeline">
                <MonthGrid year={year} />
                <DeadlineLines year={year} />
                <span>{group.venue}</span>
              </div>

              {group.tasks.map((originalTask) => {
                const task = mergeTask(originalTask, edits);
                const span = timelineWeekSpan(task, year);
                return (
                  <div className="task-pair" key={task.id}>
                    {editing ? (
                      <button
                        className="task-label sticky-cell edit-ready"
                        onClick={() => onTask(task, group, year)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <i style={{ background: PALETTES[year.id][task.category] }} />
                        <span>{task.title}</span>
                        <small className="duration-badge">{span}w</small>
                        <em>{task.provisional ? "PROVISIONAL · EDIT" : "EDIT"}</em>
                      </button>
                    ) : (
                      <div className="task-label sticky-cell">
                        <i style={{ background: PALETTES[year.id][task.category] }} />
                        <span>{task.title}</span>
                        <small className="duration-badge">{span}w</small>
                        {task.provisional && <em>PROVISIONAL</em>}
                      </div>
                    )}
                    <div className="task-timeline">
                      <MonthGrid year={year} />
                      <DeadlineLines year={year} />
                      <button
                        className={`task-bar ${task.provisional ? "provisional" : ""} ${editing ? "edit-ready" : ""}`}
                        style={{
                          ...taskPosition(task, year),
                          backgroundColor: PALETTES[year.id][task.category],
                        }}
                        onClick={() => onTask(task, group, year)}
                        aria-label={`${task.title}, ${formatDate(task.start)} to ${formatDate(task.end)}. Open details.`}
                        title={`${task.title} · ${formatDate(task.start)} — ${formatDate(task.end)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Selected = { task: Task; group: OutputGroup; year: YearPlan };

function TaskDrawer({
  selected,
  editing,
  onClose,
  onSave,
}: {
  selected: Selected;
  editing: boolean;
  onClose: () => void;
  onSave: SaveTaskEdit;
}) {
  const { task, group, year } = selected;
  const [title, setTitle] = useState(task.title);
  const [start, setStart] = useState(task.start);
  const [end, setEnd] = useState(task.end);
  const [detail, setDetail] = useState(task.detail);
  const [category, setCategory] = useState<Category>(task.category);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const weeks = timelineWeekSpan({ ...task, start, end }, year);

  useEffect(() => {
    setTitle(task.title);
    setStart(task.start);
    setEnd(task.end);
    setDetail(task.detail);
    setCategory(task.category);
  }, [task]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (asTime(end) < asTime(start)) return;
    setSaving(true);
    setSaveError(false);
    const didSave = await onSave(task.id, { title, start, end, detail, category });
    setSaving(false);
    if (didSave) onClose();
    else setSaveError(true);
  }

  return (
    <div className="drawer-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="task-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <button className="drawer-close" onClick={onClose} aria-label="Close task details">×</button>
        <div className="drawer-accent" style={{ background: PALETTES[year.id][task.category] }} />
        <div className="drawer-kicker">
          <span>{year.label}</span>
          <i />
          <span>{CATEGORY_LABELS[task.category]}</span>
        </div>

        {editing ? (
          <form onSubmit={submit} className="edit-form">
            <label>
              Phase title
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <div className="form-grid">
              <label>
                Start date
                <input type="date" value={start} onChange={(event) => setStart(event.target.value)} required />
                <small className="week-choice">{planningWeekRange(start)}</small>
              </label>
              <label>
                End date
                <input type="date" value={end} min={start} onChange={(event) => setEnd(event.target.value)} required />
                <small className="week-choice">{planningWeekRange(end)}</small>
              </label>
            </div>
            <label>
              Phase type & colour
              <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((item) => (
                  <option value={item} key={item}>{CATEGORY_LABELS[item]}</option>
                ))}
              </select>
            </label>
            <label>
              Detail
              <textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows={7} required />
            </label>
            {saveError && <p className="form-error" role="alert">The online save failed. Please try again.</p>}
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving online…" : "Save online"}</button>
            <p className="local-note">Saved changes are shared across your browsers. Only the site owner is authorised to edit.</p>
          </form>
        ) : (
          <>
            <h2 id="drawer-title">{task.title}</h2>
            <p className="drawer-output">{group.eyebrow} · {group.venue}</p>
            <div className="date-card">
              <div>
                <span>START</span>
                <strong>{formatDate(task.start)}</strong>
              </div>
              <div className="duration-orbit">
                <span>{weeks}</span>
                <small>{weeks === 1 ? "week" : "weeks"}</small>
              </div>
              <div>
                <span>END</span>
                <strong>{formatDate(task.end)}</strong>
              </div>
            </div>
            <div className="zoom-strip" aria-label={`${weeks} week task duration`}>
              {Array.from({ length: Math.min(weeks, 16) }, (_, index) => (
                <i
                  key={index}
                  style={{
                    background: PALETTES[year.id][task.category],
                    opacity: 0.3 + (index / Math.max(1, Math.min(weeks, 16) - 1)) * 0.7,
                  }}
                />
              ))}
            </div>
            <div className="drawer-section">
              <h3>What happens here</h3>
              <p>{task.detail}</p>
            </div>
            {task.meta && (
              <div className="drawer-section">
                <h3>Planning notes</h3>
                <ul>
                  {task.meta.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
            {task.provisional && (
              <div className="provisional-note">
                <strong>Provisional window</strong>
                <span>This timing or partner still needs confirmation.</span>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function PlanEditor({
  initialView,
  edits,
  onClose,
  onSave,
  onResetTask,
}: {
  initialView: "all" | YearPlan["id"];
  edits: Edits;
  onClose: () => void;
  onSave: SaveTaskEdit;
  onResetTask: (taskId: string) => Promise<boolean>;
}) {
  const [yearId, setYearId] = useState<YearPlan["id"]>(initialView === "all" ? "y1" : initialView);
  const year = YEARS.find((item) => item.id === yearId) ?? YEARS[0];
  const flatTasks = year.groups.flatMap((group) => group.tasks.map((task) => ({ task, group })));
  const [taskId, setTaskId] = useState(flatTasks[0].task.id);
  const selectedEntry = flatTasks.find((entry) => entry.task.id === taskId) ?? flatTasks[0];
  const task = mergeTask(selectedEntry.task, edits);
  const [title, setTitle] = useState(task.title);
  const [start, setStart] = useState(task.start);
  const [end, setEnd] = useState(task.end);
  const [detail, setDetail] = useState(task.detail);
  const [category, setCategory] = useState<Category>(task.category);
  const [saved, setSaved] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const nextYearId = initialView === "all" ? "y1" : initialView;
    setYearId(nextYearId);
  }, [initialView]);

  useEffect(() => {
    const nextYear = YEARS.find((item) => item.id === yearId) ?? YEARS[0];
    const containsCurrent = nextYear.groups.some((group) => group.tasks.some((item) => item.id === taskId));
    if (!containsCurrent) setTaskId(nextYear.groups[0].tasks[0].id);
  }, [yearId, taskId]);

  useEffect(() => {
    setTitle(task.title);
    setStart(task.start);
    setEnd(task.end);
    setDetail(task.detail);
    setCategory(task.category);
    setSaved(false);
    setInvalid(false);
  }, [taskId, yearId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (asTime(end) < asTime(start)) {
      setInvalid(true);
      return;
    }
    setSaving(true);
    setSaveError(false);
    const didSave = await onSave(task.id, { title, start, end, detail, category });
    setSaving(false);
    setInvalid(false);
    setSaved(didSave);
    setSaveError(!didSave);
  }

  return (
    <div className="drawer-shell editor-shell" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="task-drawer plan-editor" role="dialog" aria-modal="true" aria-labelledby="plan-editor-title">
        <button className="drawer-close" onClick={onClose} aria-label="Close timeline editor">×</button>
        <div className="editor-heading">
          <p className="drawer-kicker">DIRECT TIMELINE EDITOR</p>
          <h2 id="plan-editor-title">Edit research plan</h2>
          <p>Choose any phase below, change its dates or text, then save. The Gantt chart updates immediately.</p>
        </div>

        <div className="editor-picker-grid">
          <label>
            Academic year
            <select value={yearId} onChange={(event) => setYearId(event.target.value as YearPlan["id"])}>
              {YEARS.map((item) => <option value={item.id} key={item.id}>{item.label} · {item.yearName}</option>)}
            </select>
          </label>
          <label>
            Phase to edit
            <select value={task.id} onChange={(event) => setTaskId(event.target.value)}>
              {year.groups.map((group) => (
                <optgroup label={`${group.eyebrow} — ${group.venue}`} key={group.id}>
                  {group.tasks.map((item) => (
                    <option value={item.id} key={item.id}>{mergeTask(item, edits).title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="editor-context">
          <i style={{ background: PALETTES[year.id][category] }} />
          <div>
            <span>{selectedEntry.group.eyebrow}</span>
            <strong>{selectedEntry.group.venue}</strong>
          </div>
          <em>{timelineWeekSpan({ ...task, start, end }, year)} planning weeks</em>
        </div>

        <form onSubmit={submit} className="edit-form plan-editor-form">
          <label>
            Phase title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <div className="form-grid">
            <label>
              Start date
              <input type="date" value={start} onChange={(event) => setStart(event.target.value)} required />
              <small className="week-choice">{planningWeekRange(start)}</small>
            </label>
            <label>
              End date
              <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} required />
              <small className="week-choice">{planningWeekRange(end)}</small>
            </label>
          </div>
          {invalid && <p className="form-error" role="alert">End date must be the same as or later than the start date.</p>}
          <label>
            Phase type & colour
            <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((item) => (
                <option value={item} key={item}>{CATEGORY_LABELS[item]}</option>
              ))}
            </select>
          </label>
          <label>
            Detail shown when the bar is clicked
            <textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows={6} required />
          </label>
          {saveError && <p className="form-error" role="alert">The online save failed. Your published timeline was not changed.</p>}
          <div className="editor-save-row">
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving online…" : "Save online"}</button>
            <button
              className="secondary-button"
              type="button"
              onClick={async () => {
                const didReset = await onResetTask(task.id);
                if (didReset) {
                  setTitle(selectedEntry.task.title);
                  setStart(selectedEntry.task.start);
                  setEnd(selectedEntry.task.end);
                  setDetail(selectedEntry.task.detail);
                  setCategory(selectedEntry.task.category);
                  setSaved(false);
                  setInvalid(false);
                  setSaveError(false);
                }
              }}
              disabled={!edits[task.id]}
            >
              Reset this phase
            </button>
            {saved && <span className="saved-message" role="status">Saved online — timeline updated</span>}
          </div>
          <p className="local-note">Changes are stored online and appear on every device. Editing is restricted to the site owner.</p>
        </form>
      </aside>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"all" | YearPlan["id"]>("y1");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [editing, setEditing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [edits, setEdits] = useState<Edits>({});
  const [canEdit, setCanEdit] = useState(false);
  const [syncState, setSyncState] = useState<"loading" | "ready" | "saving" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadOnlinePlan() {
      try {
        const response = await fetch("/api/plan", { cache: "no-store" });
        const data = await response.json() as { edits?: Edits; canEdit?: boolean; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to load timeline.");
        if (!active) return;

        const onlineEdits = data.edits ?? {};
        const owner = Boolean(data.canEdit);
        setCanEdit(owner);
        setEdits(onlineEdits);
        setSyncState("ready");
      } catch {
        if (!active) return;
        setCanEdit(false);
        setSyncState("error");
      }
    }

    void loadOnlinePlan();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
        setEditorOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const visibleYears = useMemo(
    () => (view === "all" ? YEARS : YEARS.filter((year) => year.id === view)),
    [view],
  );

  async function saveEdit(taskId: string, edit: TaskEdit) {
    if (!canEdit) return false;
    const previous = edits;
    const next = { ...previous, [taskId]: edit };
    setEdits(next);
    setSelected((current) => current ? { ...current, task: { ...current.task, ...edit } } : current);
    setSyncState("saving");

    try {
      const response = await fetch("/api/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, edit }),
      });
      if (!response.ok) throw new Error("Unable to save timeline.");
      setSyncState("ready");
      return true;
    } catch {
      setEdits(previous);
      setSyncState("error");
      return false;
    }
  }

  async function resetTask(taskId: string) {
    if (!canEdit) return false;
    const previous = edits;
    const next = { ...previous };
    delete next[taskId];
    setEdits(next);
    setSyncState("saving");

    try {
      const response = await fetch(`/api/plan?taskId=${encodeURIComponent(taskId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to reset phase.");
      setSyncState("ready");
      return true;
    } catch {
      setEdits(previous);
      setSyncState("error");
      return false;
    }
  }

  async function resetEdits() {
    if (!canEdit || !window.confirm("Reset every online timeline edit and restore the original plan?")) return;
    const previous = edits;
    setEdits({});
    setSelected(null);
    setSyncState("saving");

    try {
      const response = await fetch("/api/plan", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to reset timeline.");
      setSyncState("ready");
    } catch {
      setEdits(previous);
      setSyncState("error");
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="project-mark" href="#timeline" aria-label="Go to Interactive Gantt Chart">
          <span aria-hidden="true">🔍</span>
          <div>
            <strong>Interactive Gantt Chart</strong>
          </div>
        </a>
        <div className="header-actions">
          {canEdit && (
            <>
              <span className={`sync-pill ${syncState}`} role="status">
                {syncState === "saving" ? "Saving…" : syncState === "error" ? "Sync issue" : "Owner · online"}
              </span>
              <button
                className={`text-button ${editing ? "active" : ""}`}
                onClick={() => {
                  if (editing) {
                    setEditing(false);
                    setEditorOpen(false);
                  } else {
                    setEditing(true);
                    setEditorOpen(true);
                  }
                }}
              >
                <MarkIcon type="edit" /> {editing ? "Editing on" : "Edit plan"}
              </button>
            </>
          )}
          <a
            className="github-link"
            href="https://github.com/A1deNxx1/Research-Plan-Gantt-chart"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <button className="export-button" onClick={() => window.print()}>
            <MarkIcon type="print" /> Export PDF
          </button>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div className="intro-copy">
          <a className="overline intro-plan-link" href="#timeline">Xixiang Nie PhD Research Plan</a>
          <h1 id="page-title">
            Social roles of object-based urban AI robots:
            <span>A designerly and citizen-centred inquiry</span>
          </h1>
        </div>
        <div className="research-question">
          <span>OVERALL RESEARCH QUESTION</span>
          <p>How do human citizens imagine, interpret, and negotiate the social roles of object-based urban AI robots that inhabit public spaces, and how might they regard them as “robot citizens”?</p>
        </div>
        <div className="project-facts">
          <div><strong>4</strong><span>formal studies</span></div>
          <div><strong>8</strong><span>planned outputs</span></div>
          <div><strong>3</strong><span>academic years</span></div>
        </div>
      </section>

      <section className="timeline-section" id="timeline" aria-labelledby="timeline-title">
        <div className="timeline-toolbar">
          <div>
            <h2 id="timeline-title">Research journey, week by week</h2>
          </div>
          <div className="toolbar-controls">
            <label className="year-picker">
              <span>ACADEMIC YEAR</span>
              <select value={view} onChange={(event) => setView(event.target.value as typeof view)}>
                <option value="y1">2026/27 · Year 1</option>
                <option value="y2">2027/28 · Year 2</option>
                <option value="y3">2028/29 · Year 3</option>
                <option value="all">All years</option>
              </select>
            </label>
            {canEdit && Object.keys(edits).length > 0 && (
              <button className="reset-button" onClick={() => void resetEdits()}>Reset {Object.keys(edits).length} online edit{Object.keys(edits).length === 1 ? "" : "s"}</button>
            )}
          </div>
        </div>

        <div className="chart-key">
          <span><i className="key-diamond hard" /> Fixed deadline</span>
          <span><i className="key-diamond target" /> Target window · date TBC</span>
          <span><i className="key-dash" /> Provisional activity</span>
          <strong className="week-rule">Every month: W1 1–7 · W2 8–14 · W3 15–21 · W4 22–month end</strong>
          {canEdit && editing && (
            <button className="editor-open-button" onClick={() => setEditorOpen(true)}>
              Open timeline editor
            </button>
          )}
        </div>

        <div className="years-stack">
          {visibleYears.map((year) => (
            <YearGantt
              key={year.id}
              year={year}
              edits={edits}
              editing={editing}
              onTask={(task, group, selectedYear) => setSelected({ task, group, year: selectedYear })}
            />
          ))}
        </div>
      </section>

      <footer>
        <p>Source · <strong>Year 1 Project Approval</strong>, 01 Sep 2026</p>
        <p>Working timeline · conference dates marked TBC until confirmed</p>
      </footer>

      {selected && (
        <TaskDrawer
          selected={selected}
          editing={editing}
          onClose={() => setSelected(null)}
          onSave={saveEdit}
        />
      )}
      {editorOpen && (
        <PlanEditor
          initialView={view}
          edits={edits}
          onClose={() => setEditorOpen(false)}
          onSave={saveEdit}
          onResetTask={resetTask}
        />
      )}
    </main>
  );
}
