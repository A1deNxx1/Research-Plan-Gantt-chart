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

type PhaseId = "understanding" | "building" | "deploy" | "ethics";

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
  breaks?: { start: string; end: string }[];
};

type OutputGroup = {
  id: string;
  number: string;
  phase?: PhaseId;
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

type TaskEdit = Partial<Pick<Task, "title" | "start" | "end" | "detail" | "category">> & {
  deleted?: boolean;
};
type Edits = Record<string, TaskEdit>;
type SaveTaskEdit = (taskId: string, edit: TaskEdit) => Promise<boolean>;

const CATEGORY_LABELS: Record<Category, string> = {
  ethics: "Ethics approval",
  recruitment: "Recruitment",
  making: "Design, making & development",
  fieldwork: "Experiment & data collection",
  writing: "Analysis & writing",
  feedback: "Supervisor paper review",
  revision: "Revision & finalisation",
  internship: "Industry collaboration",
  leave: "Annual leave",
};

const PHASES: Record<PhaseId, { number: number; title: string; color: string; soft: string }> = {
  understanding: { number: 1, title: "UNDERSTANDING", color: "#b56b43", soft: "#f8eee8" },
  building: { number: 2, title: "BUILDING AND DEVELOPMENT", color: "#287c84", soft: "#e9f3f4" },
  deploy: { number: 3, title: "DEPLOY AND EVALUATE", color: "#697b49", soft: "#f0f3e7" },
  ethics: { number: 4, title: "ETHICAL CONSIDERATIONS", color: "#875d88", soft: "#f5eef5" },
};

const LATER_GROUP_COLORS: Record<Category, string> = {
  ethics: "#388184",
  recruitment: "#4b9691",
  making: "#3d8da2",
  fieldwork: "#55a4a6",
  writing: "#3e75a2",
  feedback: "#5867a8",
  revision: "#555697",
  internship: "#2f6a73",
  leave: "#92a0a1",
};

const SPECIAL_ACTIVITY_COLORS: Record<string, string> = {
  "p2-robotics-visit": "#1f5fd6",
  "cdt-industry-internship": "#d49a00",
};

function taskColor(phase: PhaseId | undefined, category: Category, taskId?: string) {
  if (taskId && SPECIAL_ACTIVITY_COLORS[taskId]) return SPECIAL_ACTIVITY_COLORS[taskId];
  if (category === "feedback") return "#5867a8";
  if (category === "leave") return "#a8a49e";
  return phase ? PHASES[phase].color : LATER_GROUP_COLORS[category];
}

const BASE_YEARS: YearPlan[] = [
  { id: "y1", label: "2026/27", yearName: "Year 1", dates: "Sep 2026 — Sep 2027", start: "2026-09-01", end: "2027-10-01", accent: "#706c65", soft: "#f5f3ef", ink: "#272b29", deadlines: [], groups: [] },
  { id: "y2", label: "2027/28", yearName: "Year 2", dates: "Oct 2027 — Sep 2028", start: "2027-10-01", end: "2028-10-01", accent: "#706c65", soft: "#f5f3ef", ink: "#272b29", deadlines: [], groups: [] },
  { id: "y3", label: "2028/29", yearName: "Year 3", dates: "Oct 2028 — Sep 2029", start: "2028-10-01", end: "2029-10-01", accent: "#706c65", soft: "#f5f3ef", ink: "#272b29", deadlines: [], groups: [] },
];
function plannedTask(
  id: string,
  title: string,
  start: string,
  end: string,
  category: Category,
  detail: string,
  meta?: string[],
): Task {
  return { id, title, start, end, category, detail, meta };
}

const YEARS: YearPlan[] = [
  {
    ...BASE_YEARS[0],
    accent: "#706c65",
    soft: "#f5f3ef",
    ink: "#272b29",
    deadlines: [
      { date: "2027-01-11", label: "DIS 2027 pictorial abstract & title", kind: "target" },
      { date: "2027-01-18", label: "DIS 2027 pictorial submission", kind: "target" },
      { date: "2027-09-01", label: "Annual Progression 1", kind: "hard" },
      { date: "2027-09-10", label: "CHI 2028 paper target · estimated", kind: "target" },
    ],
    groups: [
      {
        id: "phase1-study1",
        number: "01",
        phase: "understanding",
        eyebrow: "Phase 1 · Understanding · Study 1",
        title: "Imagine the design space of Object-inspired Robotic Agents through a co-design workshop",
        venue: "DIS 2027 Pictorial",
        tasks: [
          plannedTask("p1-s1-ethics", "Study 1&2 Ethics approval", "2026-10-15", "2026-11-14", "ethics", "Obtain approval for the Study 1 expert session and co-design workshops and the linked Study 2 puppet-prototyping work before collecting research data. The review window runs from October W3 through November W2."),
          plannedTask("p1-s1-recruit", "Participant recruitment · Studies 1 & 2", "2026-11-08", "2027-02-28", "recruitment", "Recruit adult participants for the co-design and follow-on puppet-prototyping studies. Study 1 recruits approximately 10–12 people with backgrounds in robotics, AI or design; Study 2 welcomes adults without prior robotics or AI knowledge.", ["Study 1: approximately 10–12 adults", "Recruitment continues into February for Study 2"]),
          plannedTask("p1-s1-cards", "Design object & AI capability cards", "2026-10-15", "2026-10-31", "making", "Prepare cards that help participants combine familiar urban objects, possible inputs, AI capabilities and social goals. The cards are generative prompts, not finished robot specifications."),
          plannedTask("p1-s1-experts", "Expert session", "2026-11-01", "2026-11-07", "fieldwork", "Discuss the cards and research setup with approximately four HCI, HRI, computer-science and AI experts; use their critique to refine the co-design activities."),
          plannedTask("p1-s1-refine", "Refine research design", "2026-11-01", "2026-11-14", "writing", "Refine the card set, workshop prompts, documentation and facilitation plan after the expert session and before the participant workshops."),
          plannedTask("p1-s1-workshops", "Participant co-design workshops", "2026-11-15", "2026-12-14", "fieldwork", "Run three co-design rounds in which participants select urban objects, inputs, AI capabilities and goals; sketch, make and enact object-inspired robotic agents, then reflect on their possible social roles. Document visual artefacts, discussion and peer feedback.", ["Three object concepts", "Annotated visual and artefact analysis", "Performance prompts for Study 2"]),
          plannedTask("p1-s1-pictorial", "DIS 2028 pictorial design & draft writing", "2026-11-01", "2026-11-30", "writing", "Develop a visually led DIS 2027 pictorial presenting the card-based method and emerging imagined social roles. Analyse workshop artefacts and transcripts using annotated visual analysis and reflexive thematic analysis."),
          plannedTask("p1-s1-review", "Supervisor paper review", "2026-12-01", "2026-12-14", "feedback", "Share the pictorial draft, images and analysis with supervisors for focused review during December W1–W2."),
          plannedTask("p1-s1-revision", "Revision & finalisation", "2026-12-15", "2027-01-14", "revision", "Revise and finalise the DIS 2027 pictorial. Submit its title and abstract by 11 January and the complete pictorial by the official 18 January deadline."),
        ],
      },
      {
        id: "phase1-study2",
        number: "02",
        phase: "understanding",
        eyebrow: "Phase 1 · Understanding · Study 2",
        title: "Puppet prototyping of imagined robotic agents",
        venue: "CHI 2028 Full Paper · Studies 1 & 2",
        tasks: [
          plannedTask("p1-s2-leave", "Annual leave · China", "2027-02-01", "2027-02-14", "leave", "Annual leave in China during February W1–W2."),
          plannedTask("p1-s2-refine", "Check & refine research design", "2027-02-15", "2027-02-28", "writing", "Review the three selected concepts and performance prompt cards from Study 1; refine the embodied workshop protocol, facilitation and recording plan for puppet prototyping."),
          plannedTask("p1-s2-puppet", "Puppet prototyping workshop", "2027-03-01", "2027-03-31", "fieldwork", "Participants make full-scale puppets from everyday materials, improvise encounters, rotate between operator, citizen and observer roles, and iteratively refine behaviours. Document performance video, robot personas, discussion, design cases and exit interviews.", ["Three groups of four participants", "Embodied exploration before physical robot construction"]),
          plannedTask("p1-s2-analysis", "Data analysis · CHI 2028 full-paper draft", "2027-04-01", "2027-04-30", "writing", "Analyse performance videos, scenario-based design cases, focus groups and interviews while beginning the CHI 2028 full-paper draft. Develop findings on behaviours, relationships, capabilities and tensions to guide Phase 2 building."),
          plannedTask("p1-chi-draft", "Studies 1 & 2 · CHI 2028 full-paper draft", "2027-04-01", "2027-05-14", "writing", "Combine Study 1 co-design and Study 2 puppet-prototyping evidence into a CHI 2028 full-paper draft on imagined design spaces, social roles, behaviours, strengths, boundaries and tensions of urban object-inspired robotic agents."),
          plannedTask("p1-chi-review", "Supervisor paper review", "2027-05-15", "2027-05-31", "feedback", "Supervisors review the integrated Studies 1 and 2 CHI manuscript during May W3–W4."),
          plannedTask("p1-chi-revise", "Revision & finalisation", "2027-06-01", "2027-06-30", "revision", "Revise and finalise the integrated CHI 2028 full paper during June. The September submission marker is an estimate based on the CHI 2027 schedule, not an announced CHI 2028 deadline."),
        ],
      },
      {
        id: "phase2-study3-y1",
        number: "03",
        phase: "building",
        eyebrow: "Phase 2 · Building and Development · Study 3",
        title: "Immersive evaluation and robotic-agent development",
        venue: "DIS 2028 Full Paper · UIST 2028 Paper",
        tasks: [
          plannedTask("p2-ethics", "Study 3 ethics approval", "2027-01-01", "2027-02-28", "ethics", "Secure approval for immersive prototype evaluation with adult citizens before participant recruitment and research sessions."),
          plannedTask("p2-recruit", "Participant recruitment · Study 3", "2027-03-01", "2027-04-30", "recruitment", "Recruit approximately 10–12 adult citizens to experience and evaluate the virtual robotic agent in an immersive outdoor setting."),
          plannedTask("p2-virtual", "Virtual prototyping evaluation", "2027-05-01", "2027-05-31", "fieldwork", "Select an agent concept from Phase 1 and evaluate a virtual prototype in VR or XR within an urban context. Gather feedback on form, behaviour, interaction and the proposed social role before physical construction."),
          plannedTask("p2-interaction-ai", "Final interaction design & AI agent development", "2027-06-01", "2027-08-31", "making", "Translate the immersive evaluation into final interaction design and develop the AI agent, including its sensing, interpretation and responses. Iterate virtual models and test technical feasibility."),
          { ...plannedTask("p2-robotics-visit", "Plan a PhD visit to a AI robotics group", "2027-07-01", "2027-08-31", "making", "Visit an AI robotics research group to pursue technical collaboration and joint development."), provisional: true },
          plannedTask("p2-physical-y1", "Physical prototype & structural engineering · design and test", "2027-09-01", "2027-09-30", "making", "Begin physical form, structural engineering and interaction testing in September. This activity continues through October W4 in the next academic-year view."),
        ],
      },
    ],
  },
  {
    ...BASE_YEARS[1],
    accent: "#706c65",
    soft: "#f5f3ef",
    ink: "#272b29",
    deadlines: [
      { date: "2028-01-18", label: "DIS 2028 full-paper target · estimated", kind: "target" },
      { date: "2028-03-31", label: "UIST 2028 paper target · estimated", kind: "target" },
      { date: "2028-09-01", label: "Annual Progression 2", kind: "hard" },
      { date: "2028-09-07", label: "CHI 2029 full-paper target · estimated", kind: "target" },
    ],
    groups: [
      {
        id: "phase2-study3-y2",
        number: "03",
        phase: "building",
        eyebrow: "Phase 2 · Building and Development · Study 3",
        title: "Immersive evaluation and robotic-agent development",
        venue: "DIS 2028 Full Paper · UIST 2028 Paper",
        tasks: [
          plannedTask("p2-physical-y2", "Physical prototype & structural engineering · design and test", "2027-10-01", "2027-10-31", "making", "Continue the September–October physical prototype and structural-engineering work, including design, fabrication and interaction testing."),
          plannedTask("p2-leave-2027", "Annual leave · China", "2027-10-01", "2027-10-21", "leave", "Annual leave in China during October W1–W3."),
          plannedTask("p2-dis-draft", "Robot design process & recommendations · DIS 2028 full-paper draft", "2027-10-15", "2027-11-14", "writing", "Draft a DIS 2028 full paper on the iterative design process from October W3 through November W2: Phase 1 findings, immersive evaluation, robot interaction design and resulting design recommendations."),
          plannedTask("p2-dis-review", "Supervisor paper review", "2027-11-15", "2027-12-14", "feedback", "Supervisors review the DIS design-process manuscript from November W3 through December W2."),
          plannedTask("p2-final-integration", "Final physical development & AI agent integration", "2027-11-01", "2027-12-31", "making", "Build and test the final physical robot, integrating its structure, interaction mechanisms and AI agent."),
          plannedTask("p2-dis-revise", "Revision & finalisation", "2027-12-01", "2028-01-14", "revision", "Revise and finalise the DIS 2028 design-process manuscript through January W2. The January 2028 deadline marker is estimated from the DIS 2027 call, not yet an official date."),
          plannedTask("p2-development-final", "Robotic agent development finalisation", "2028-01-01", "2028-01-21", "making", "Complete integration, reliability tests and final adjustments to the physical robotic agent by January W3."),
          plannedTask("p2-leave-2028", "Annual leave · China", "2028-01-22", "2028-02-29", "leave", "Annual leave in China from January W4 through February W4."),
          plannedTask("p2-uist-draft", "Technical systems · UIST 2028 full-paper draft (alternative is IUI 2029)", "2028-01-08", "2028-02-14", "writing", "Draft a UIST 2028 technical systems paper on the software and/or hardware methods used to develop and integrate the robotic agent."),
          plannedTask("p2-uist-review", "Supervisor paper review", "2028-02-08", "2028-03-14", "feedback", "Supervisors review the technical systems manuscript from February W2 through March W2, including rolling draft feedback."),
          plannedTask("p2-uist-revise", "Revision & finalisation", "2028-03-15", "2028-03-31", "revision", "Revise and finalise the UIST 2028 paper in March W3–W4. The 31 March submission marker is a planning estimate, not an announced deadline."),
        ],
      },
      {
        id: "phase3-study4",
        number: "04",
        phase: "deploy",
        eyebrow: "Phase 3 · Deploy and Evaluate · Study 4",
        title: "Urban deployment and evaluation",
        venue: "CHI 2029 Full Paper",
        tasks: [
          plannedTask("p3-s4-ethics", "Study 4 ethics approval", "2028-01-01", "2028-01-31", "ethics", "Secure ethics approval during January W1–W4 in 2028 for the public urban deployment and evaluation planned for April 2028."),
          plannedTask("p3-s4-deploy", "Urban deployment", "2028-03-01", "2028-04-30", "fieldwork", "Deploy the robotic agent in everyday urban settings across March and April 2028, documenting interactions, public responses and evaluation data. If feasible, this could include a comparative study in China and the UK to explore how different urban and cultural contexts shape citizens' interpretations of its social role."),
          plannedTask("p3-s4-analysis", "Data analysis · CHI 2029 full-paper draft", "2028-05-01", "2028-05-31", "writing", "Analyse the urban deployment data and draft a CHI 2029 full paper on the agent's social role, public interpretation and observed interactions."),
          plannedTask("p3-s4-review", "Supervisor paper review", "2028-06-01", "2028-06-30", "feedback", "Share the Study 4 manuscript with supervisors throughout June for rolling review and feedback."),
          plannedTask("p3-s4-revise", "Revision & finalisation", "2028-06-15", "2028-07-14", "revision", "Revise and finalise the Study 4 CHI 2029 full paper from June W3 through July W2. The September 2028 submission marker is an estimate, not an announced CHI 2029 deadline."),
        ],
      },
      {
        id: "cdt-industry-internship",
        number: "",
        eyebrow: "Additional research activity",
        title: "CDT-supported 3-month industry internship",
        venue: "Industry collaboration · Jun–Aug 2028",
        tasks: [
          { ...plannedTask("cdt-industry-internship", "CDT-supported 3-month industry internship", "2028-06-01", "2028-08-31", "internship", "Undertake a CDT-supported three-month industry internship, with potential hosts including Google, Microsoft Cambridge and Nokia Lab."), provisional: true },
        ],
      },
      {
        id: "study5-preparation",
        number: "05",
        phase: "ethics",
        eyebrow: "Phase 4 · Ethical Considerations · Study 5 (preparation)",
        title: "Public theatre and ethical reflection",
        venue: "AAAI/ACM AIES 2029 Full Paper · alternative CHI 2029",
        tasks: [
          plannedTask("p4-s5-ethics", "Study 5 ethics approval", "2028-05-01", "2028-05-31", "ethics", "Submit and complete the ethics review for Study 5 in May, before recruiting public participants and developing the theatre-based work."),
          plannedTask("p4-s5-recruit", "Participant recruitment and seek professional actors and theatre venues for collaboration · Study 5", "2028-06-01", "2028-09-30", "recruitment", "Recruit participants and seek professional actors, theatre collaborators and possible venues for the Study 5 public theatre and voice workshops."),
          plannedTask("p4-s5-leave-2028", "Annual leave · China", "2028-09-08", "2028-09-30", "leave", "Annual leave in China from September W2 through W4."),
        ],
      },
    ],
  },
  {
    ...BASE_YEARS[2],
    accent: "#706c65",
    soft: "#f5f3ef",
    ink: "#272b29",
    deadlines: [
      { date: "2029-05-20", label: "AIES 2029 full-paper target · estimated", kind: "target" },
      { date: "2029-09-29", label: "PhD thesis submission · 29 Sep 2029", kind: "hard" },
    ],
    groups: [
      {
        id: "phase4-study5",
        number: "05",
        phase: "ethics",
        eyebrow: "Phase 4 · Ethical Considerations · Study 5",
        title: "Public theatre and ethical reflection",
        venue: "AAAI/ACM AIES 2029 Full Paper · alternative CHI 2029",
        tasks: [
          plannedTask("p4-s5-scenarios", "Developing and revising scenarios", "2028-10-01", "2028-10-31", "making", "Develop and revise public-theatre scenarios that make the ethical tensions and social roles of urban object-inspired robotic agents open to discussion."),
          plannedTask("p4-s5-workshop", "Theatre development and public voice workshop", "2028-11-01", "2028-11-30", "fieldwork", "Work with theatre collaborators and members of the public to develop the performance, test scenes and bring citizen voices into the ethical inquiry."),
          {
            ...plannedTask("p4-s5-theatre", "Final public theatre", "2028-12-01", "2029-01-14", "fieldwork", "Stage the final public theatre during December W1–W2 and January W1–W2, with a Christmas holiday break in between. Invite audiences to reflect on urban robotic agents and their social and ethical implications, and gather their responses."),
            breaks: [{ start: "2028-12-15", end: "2028-12-31" }],
          },
          plannedTask("p4-s5-leave-2029", "Annual leave · China", "2029-01-15", "2029-02-07", "leave", "Three continuous planning weeks of annual leave in China: January W3–W4 and February W1."),
          plannedTask("p4-s5-analysis", "Data analysis · AAAI/ACM AIES 2029 full-paper draft (alternative is CHI 2029)", "2029-02-15", "2029-03-14", "writing", "Analyse the theatre workshops, performances and public responses, then draft an AIES 2029 full paper on the ethical considerations of urban object-inspired robotic agents. CHI 2029 is an alternative venue."),
          plannedTask("p4-s5-review", "Supervisor paper review", "2029-03-15", "2029-04-14", "feedback", "Share the Study 5 AIES manuscript with supervisors for review from March W3 through April W2."),
          plannedTask("p4-s5-revise", "Revision & finalisation", "2029-04-15", "2029-05-14", "revision", "Revise and finalise the Study 5 paper from April W3 through May W2. The AIES 2029 target near 20 May is estimated from the official AIES 2025 and 2026 calls, not an announced 2029 deadline."),
        ],
      },
      {
        id: "phd-project-closing",
        number: "",
        eyebrow: "PhD project closing & social impact",
        title: "Final thesis, exhibition & viva preparation",
        venue: "PhD thesis submission · 29 Sep 2029",
        tasks: [
          plannedTask("thesis-write", "Write and organise final thesis", "2029-02-15", "2029-07-31", "writing", "Write and organise the final thesis across all studies, integrating the empirical, design, technical and theoretical contributions."),
          { ...plannedTask("exhibition-plan", "Find creative partner & plan exhibition", "2029-02-15", "2029-07-31", "making", "Identify a creative partner and plan a public exhibition of the research findings and robotic prototypes to extend the project's social impact."), provisional: true },
          plannedTask("thesis-feedback", "Supervisor thesis review", "2029-04-01", "2029-07-31", "feedback", "Send completed thesis chapters to supervisors on a rolling basis from April through July, so they can review the previous chapter while the next is being written."),
          plannedTask("internship-chi-draft", "Internship · CHI 2030 full-paper draft", "2029-06-01", "2029-06-30", "writing", "Draft a full paper drawing on the earlier CDT-supported industry internship and its contribution to the doctoral research, targeting CHI 2030."),
          plannedTask("internship-chi-revise", "Internship paper · Revision & finalisation", "2029-07-01", "2029-07-31", "revision", "Revise and finalise the full paper developed from the industry internship during July."),
          plannedTask("thesis-finalise", "Revision & finalisation", "2029-08-01", "2029-09-30", "revision", "Apply supervisor feedback, complete the thesis quality checks and prepare the submission files for 29 September 2029."),
          plannedTask("viva-practice", "Viva rehearsal", "2029-08-01", "2029-09-30", "fieldwork", "Rehearse the viva throughout August and September, focusing on contributions, methodological choices, evidence and limitations."),
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

function rawTimelineWeekSpan(task: Pick<Task, "start" | "end">, year: YearPlan) {
  return Math.max(1, weekSlot(task.end, year.start) - weekSlot(task.start, year.start) + 1);
}

function shiftDate(value: string, days: number) {
  const point = new Date(`${value}T00:00:00Z`);
  point.setUTCDate(point.getUTCDate() + days);
  return point.toISOString().slice(0, 10);
}

function isSupervisorPaperFeedback(task: Pick<Task, "category" | "title">) {
  return task.category === "feedback" && task.title.startsWith("Supervisor");
}

function taskSegments(task: Task) {
  let segments = [{ start: task.start, end: task.end }];
  const breaks = [...(task.breaks ?? [])];

  if (isSupervisorPaperFeedback(task)) {
    const firstYear = new Date(`${task.start}T00:00:00Z`).getUTCFullYear();
    const lastYear = new Date(`${task.end}T00:00:00Z`).getUTCFullYear();
    for (let year = firstYear; year <= lastYear; year += 1) {
      for (const month of [8, 12]) {
        const monthString = String(month).padStart(2, "0");
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        breaks.push({
          start: `${year}-${monthString}-15`,
          end: `${year}-${monthString}-${String(lastDay).padStart(2, "0")}`,
        });
      }
    }
  }

  for (const pause of breaks) {
    segments = segments.flatMap((segment) => {
      if (asTime(segment.end) < asTime(pause.start) || asTime(segment.start) > asTime(pause.end)) {
        return [segment];
      }
      const activeSegments: { start: string; end: string }[] = [];
      if (asTime(segment.start) < asTime(pause.start)) {
        activeSegments.push({ start: segment.start, end: shiftDate(pause.start, -1) });
      }
      if (asTime(segment.end) > asTime(pause.end)) {
        activeSegments.push({ start: shiftDate(pause.end, 1), end: segment.end });
      }
      return activeSegments;
    });
  }

  return segments;
}

function hasTaskBreak(task: Task) {
  const segments = taskSegments(task);
  return segments.length !== 1 || segments[0]?.start !== task.start || segments[0]?.end !== task.end;
}

function timelineWeekSpan(task: Task, year: YearPlan) {
  return taskSegments(task).reduce(
    (total, segment) => total + rawTimelineWeekSpan(segment, year),
    0,
  );
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
  const edit = edits[task.id];
  if (!edit) return task;

  return {
    ...task,
    title: edit.title ?? task.title,
    start: edit.start ?? task.start,
    end: edit.end ?? task.end,
    detail: edit.detail ?? task.detail,
    category: edit.category ?? task.category,
  };
}

function isTaskDeleted(taskId: string, edits: Edits) {
  return edits[taskId]?.deleted === true;
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
  onDeleteTask,
}: {
  year: YearPlan;
  edits: Edits;
  editing: boolean;
  onTask: (task: Task, group: OutputGroup, year: YearPlan) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const segments = monthSegments(year);
  const weeks = segments.length * 4;
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
    const scrollElement = chart;

    function updateScrollRange() {
      const max = Math.max(0, scrollElement.scrollWidth - scrollElement.clientWidth);
      setScrollMax(max);
      setScrollLeft(Math.min(scrollElement.scrollLeft, max));
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
            <div className="output-group" key={group.id} style={{ "--phase-accent": group.phase ? PHASES[group.phase].color : "#586862", "--phase-soft": group.phase ? PHASES[group.phase].soft : "#f1f3ef" } as CSSProperties}>
              <div className={`group-heading sticky-cell ${group.number ? "" : "standalone-heading"}`}>
                {group.number && <span className="group-number">{group.number}</span>}
                <div>
                  <p>{group.eyebrow}</p>
                  <h3>{group.title}</h3>
                </div>
              </div>
              <div className="group-heading-timeline">
                <MonthGrid year={year} />
                <DeadlineLines year={year} />
                <span style={{ transform: `translate3d(${scrollLeft}px, 0, 0)` }}>{group.venue}</span>
              </div>

              {group.tasks.filter((task) => !isTaskDeleted(task.id, edits)).map((originalTask) => {
                const task = mergeTask(originalTask, edits);
                const supervisorFeedback = isSupervisorPaperFeedback(task);
                const activeSegments = taskSegments(task);
                const span = timelineWeekSpan(task, year);
                return (
                  <div className="task-pair" key={task.id}>
                    {editing ? (
                      <div
                        className={`task-label sticky-cell edit-ready ${supervisorFeedback ? "supervisor-review-label" : ""}`}
                      >
                        <i style={{ background: taskColor(group.phase, task.category, task.id) }} />
                        <button
                          className="task-label-title"
                          type="button"
                          onClick={() => onTask(task, group, year)}
                          aria-label={`Edit ${task.title}`}
                        >
                          <span>{task.title}</span>
                        </button>
                        <small className="duration-badge">{span}w</small>
                        <div className="task-row-actions">
                          {task.provisional && <em>PROVISIONAL</em>}
                          <button type="button" className="task-edit-action" onClick={() => onTask(task, group, year)}>EDIT</button>
                          <button type="button" className="task-delete-action" onClick={() => onDeleteTask(task)}>DELETE</button>
                        </div>
                      </div>
                    ) : (
                      <div className={`task-label sticky-cell ${supervisorFeedback ? "supervisor-review-label" : ""}`}>
                        <i style={{ background: taskColor(group.phase, task.category, task.id) }} />
                        <span>{task.title}</span>
                        <small className="duration-badge">{span}w</small>
                        {task.provisional && <em>PROVISIONAL</em>}
                      </div>
                    )}
                    <div className="task-timeline">
                      <MonthGrid year={year} />
                      <DeadlineLines year={year} />
                      {activeSegments.map((segment, segmentIndex) => {
                        const segmentTask = { ...task, ...segment };
                        const segmentContext = activeSegments.length > 1
                          ? `, active segment ${segmentIndex + 1} of ${activeSegments.length}`
                          : "";
                        return (
                          <button
                            key={`${task.id}-${segment.start}`}
                            className={`task-bar ${supervisorFeedback ? "supervisor-review" : ""} ${task.provisional ? "provisional" : ""} ${editing ? "edit-ready" : ""}`}
                            style={{
                              ...taskPosition(segmentTask, year),
                              backgroundColor: supervisorFeedback
                                ? "rgba(88, 103, 168, 0.40)"
                                : taskColor(group.phase, task.category, task.id),
                            }}
                            onClick={() => onTask(task, group, year)}
                            aria-label={`${task.title}${segmentContext}, ${formatDate(segment.start)} to ${formatDate(segment.end)}. Open details.`}
                            title={`${task.title} · ${formatDate(segment.start)} — ${formatDate(segment.end)}`}
                          />
                        );
                      })}
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
  const { task, year } = selected;
  const [title, setTitle] = useState(task.title);
  const [start, setStart] = useState(task.start);
  const [end, setEnd] = useState(task.end);
  const [detail, setDetail] = useState(task.detail);
  const [category, setCategory] = useState<Category>(task.category);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const editedTask = { ...task, title, start, end, category };
  const weeks = timelineWeekSpan(editedTask, year);
  const hasBreak = hasTaskBreak(editedTask);

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
        <div className="drawer-accent" style={{ background: taskColor(selected.group.phase, task.category, task.id) }} />
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
            <div className="date-card">
              <div>
                <span>START</span>
                <strong>{formatDate(task.start)}</strong>
              </div>
              <div className="duration-orbit">
                <span>{weeks}</span>
                <small>{hasBreak ? "active weeks" : weeks === 1 ? "week" : "weeks"}</small>
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
                    background: taskColor(selected.group.phase, task.category, task.id),
                    opacity: 0.3 + (index / Math.max(1, Math.min(weeks, 16) - 1)) * 0.7,
                  }}
                />
              ))}
            </div>
            <div className="drawer-section">
              <h3>What happens here</h3>
              <p>{task.detail}</p>
            </div>
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
                    <option value={item.id} key={item.id}>
                      {isTaskDeleted(item.id, edits) ? "[Deleted] " : ""}{mergeTask(item, edits).title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="editor-context">
          <i style={{ background: taskColor(selectedEntry.group.phase, category, task.id) }} />
          <div>
            <span>{selectedEntry.group.eyebrow}</span>
            <strong>{selectedEntry.group.venue}</strong>
          </div>
          <em>{timelineWeekSpan({ ...task, title, start, end, category }, year)} active planning weeks</em>
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
              {isTaskDeleted(task.id, edits) ? "Restore this phase" : "Reset this phase"}
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
  const isGitHubPages = typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
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

  async function deleteTask(task: Task) {
    if (!canEdit || !window.confirm(`Delete “${task.title}” from the timeline? You can restore it from the timeline editor or by resetting online edits.`)) return;
    const previous = edits;
    const next = { ...previous, [task.id]: { deleted: true } };
    setEdits(next);
    setSelected((current) => current?.task.id === task.id ? null : current);
    setSyncState("saving");

    try {
      const response = await fetch("/api/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, edit: { deleted: true } }),
      });
      if (!response.ok) throw new Error("Unable to delete phase.");
      setSyncState("ready");
    } catch {
      setEdits(previous);
      setSyncState("error");
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
          {isGitHubPages ? (
            <span className="overline intro-plan-link intro-plan-label">Xixiang Nie PhD Research Plan</span>
          ) : (
            <a className="overline intro-plan-link" href="#timeline">Xixiang Nie PhD Research Plan</a>
          )}
          <h1 id="page-title">
            <span className="hero-title-line">Social roles of </span>
            <span className="hero-title-line">urban object-inspired </span>
            <span className="hero-title-line">robotic agents:</span>
            <span className="hero-subtitle">A designerly and citizen-centred inquiry</span>
          </h1>
        </div>
        <div className="research-question">
          <span>OVERALL RESEARCH QUESTION</span>
          <p>How do human citizens imagine, interpret, and negotiate the social roles of urban object-inspired robotic agents that inhabit everyday spaces?</p>
        </div>
        <div className="project-facts">
          <div><strong>3</strong><span>academic years</span></div>
          <div><strong>5</strong><span>studies</span></div>
          <div><strong>4</strong><span>research phases</span></div>
        </div>
      </section>

      <section className="timeline-section" id="timeline" aria-labelledby="timeline-title">
        <div className="timeline-toolbar">
          <div>
            <h2 id="timeline-title">Research journey, weekly plan</h2>
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
          <strong className="week-rule">Every month: W1 days 1–7 · W2 days 8–14 · W3 days 15–21 · W4 days 22–end of month</strong>
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
              onDeleteTask={(task) => void deleteTask(task)}
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
