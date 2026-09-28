import skill from "./napoleon/SKILL.md?raw";
import contrast from "./napoleon/contrast.md?raw";

export const PLACEHOLDER_SOURCE = "(owner pastes his full voice skill here)";

/** Full Napoleon Beltran voice skill v3.1 + calibration corpus. Core source of truth. */
export const NAPOLEON_VOICE_SOURCE = `${skill.trim()}

---

${contrast.trim()}
`;

export const NAPOLEON_CORE_BANNED = [
  "In today's world",
  "I hope this finds you well",
  "Moreover,",
  "As such,",
  "This is why",
  "my late father",
  "leverage",
  "synergy",
  "circle back",
];
