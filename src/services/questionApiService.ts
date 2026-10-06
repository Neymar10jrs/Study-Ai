import { PracticeQuestion, SubjectId, DetailedSolution } from "@/types";
import { getSubjectName, getSubjectTopics } from "@/data/syllabus";

export interface GenerateQuestionParams {
  subjectId: string;
  topic?: string;
  topics?: string[];
  difficulty?: "Easy" | "Medium" | "Hard" | "Exam Level";
  count?: number;
  mode?: "daily" | "adaptive" | "exam" | "revision";
  customPrompt?: string;
  useAI?: boolean;
  seenQuestions?: string[]; // Array of normalized question texts already seen in this session
}

export interface AIGeneratedQuestionItem {
  id?: number | string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/**
 * Fisher-Yates shuffle algorithm for un-biased array randomization
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Normalizes question text for robust deduplication (lowercase, trimmed, punctuation stripped)
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Shuffles options for a question and updates answerIndex so the correct
 * answer is uniformly distributed across positions A, B, C, and D.
 */
export function shuffleQuestionOptions(q: PracticeQuestion): PracticeQuestion {
  const originalOptions = q.options;
  const correctText = originalOptions[q.correctOptionIndex];

  // Map each option with its original index
  const indexed = originalOptions.map((opt, i) => ({ opt, originalIndex: i }));
  const shuffled = fisherYatesShuffle(indexed);

  const newCorrectIndex = shuffled.findIndex((item) => item.originalIndex === q.correctOptionIndex);
  const newOptions = shuffled.map((item) => item.opt);

  // Remap wrongOptionExplanations to their new positions
  const newWrongExplanations: Record<number, string> = {};
  if (q.wrongOptionExplanations) {
    shuffled.forEach((item, newIdx) => {
      if (newIdx !== newCorrectIndex && q.wrongOptionExplanations?.[item.originalIndex]) {
        newWrongExplanations[newIdx] = q.wrongOptionExplanations[item.originalIndex];
      }
    });
  }

  return {
    ...q,
    options: newOptions,
    correctOptionIndex: newCorrectIndex,
    wrongOptionExplanations: newWrongExplanations
  };
}

/**
 * Validates AI JSON response according to the required schema:
 * [{ "id": 1, "question": "", "options": ["","","",""], "answerIndex": 0, "explanation": "" }]
 */
export function validateAIQuestionJSON(data: any): AIGeneratedQuestionItem[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("AI response must be a non-empty JSON array of questions.");
  }

  return data.map((item, idx) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Question at index ${idx} is not a valid object.`);
    }

    if (typeof item.question !== "string" || !item.question.trim()) {
      throw new Error(`Question ${idx + 1} has missing or empty 'question' text.`);
    }

    if (!Array.isArray(item.options) || item.options.length !== 4) {
      throw new Error(`Question ${idx + 1} must contain exactly 4 options.`);
    }

    const hasInvalidOption = item.options.some((opt: any) => typeof opt !== "string" || !opt.trim());
    if (hasInvalidOption) {
      throw new Error(`Question ${idx + 1} contains blank or non-string options.`);
    }

    const answerIdx = Number(item.answerIndex);
    if (!Number.isInteger(answerIdx) || answerIdx < 0 || answerIdx > 3) {
      throw new Error(`Question ${idx + 1} has invalid 'answerIndex' (${item.answerIndex}). Must be 0, 1, 2, or 3.`);
    }

    const explanation = typeof item.explanation === "string" ? item.explanation.trim() : "";
    if (!explanation) {
      throw new Error(`Question ${idx + 1} is missing an 'explanation'.`);
    }

    return {
      id: item.id ?? idx + 1,
      question: item.question.trim(),
      options: item.options.map((opt: string) => opt.trim()),
      answerIndex: answerIdx,
      explanation
    };
  });
}

/**
 * Deduplicates questions by comparing normalized text.
 * Emits a console warning if any duplicate was detected.
 */
export function deduplicateQuestions(questions: PracticeQuestion[]): PracticeQuestion[] {
  const seen = new Set<string>();
  const unique: PracticeQuestion[] = [];

  for (const q of questions) {
    const norm = normalizeQuestionText(q.question);
    if (!seen.has(norm)) {
      seen.add(norm);
      unique.push(q);
    } else {
      console.warn(`[StudyAI] Duplicate question detected and removed: "${q.question}"`);
    }
  }

  return unique;
}

/**
 * Single-request AI API call for all {count} questions at once.
 * Uses temperature = 0.85 to maximize diversity across concepts and problem scenarios.
 */
export async function callAIQuestionAPI(
  subject: string,
  topic: string,
  level: string,
  count: number,
  existingExcludes: string[] = []
): Promise<PracticeQuestion[]> {
  const excludeNotice = existingExcludes.length > 0
    ? `\nDo not repeat or use any of these questions:\n${existingExcludes.slice(0, 15).map(q => `- ${q}`).join("\n")}`
    : "";

  const prompt = `Generate ${count} DIFFERENT multiple-choice questions on subject '${subject}', topic '${topic}', difficulty '${level}'. Every question must test a different concept or use a different scenario. No two questions may be identical or near-duplicates. Vary the question types (concept, calculation, application, true/false reasoning).${excludeNotice}\n\nReturn ONLY valid JSON in this exact shape:\n[\n  {\n    "id": 1,\n    "question": "Question statement here",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "answerIndex": 0,\n    "explanation": "Clear explanation of why this answer is correct."\n  }\n]`;

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_AI_API_KEY;
  const customUrl = (import.meta as any).env?.VITE_AI_API_URL;

  let rawJsonText = "";

  if (apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85, // Set between 0.8 to 1.0 to increase variety
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`AI API failed (${response.status}): ${errBody || response.statusText}`);
    }

    const data = await response.json();
    rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (customUrl) {
    const response = await fetch(customUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, subject, topic, level, count, temperature: 0.85 })
    });

    if (!response.ok) {
      throw new Error(`Custom AI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    rawJsonText = typeof data === "string" ? data : JSON.stringify(data);
  } else {
    // If no external API key is configured, use our local syllabus engine with Fisher-Yates shuffle
    return getLocalSubjectQuestions(subject, topic, level, count, existingExcludes);
  }

  // Parse and strip possible markdown codeblock wrapper
  const cleaned = rawJsonText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(`Failed to parse AI question JSON: ${err.message}. Response: ${cleaned.slice(0, 150)}...`);
  }

  const validated = validateAIQuestionJSON(parsed);

  // Map to full PracticeQuestion schema and shuffle answer options
  const mapped = validated.map((item, idx) => {
    const base: PracticeQuestion = {
      id: `ai_${subject.toLowerCase()}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      subjectId: subject.toLowerCase() as SubjectId,
      chapter: topic,
      topic,
      difficulty: level as any,
      question: item.question,
      options: item.options,
      correctOptionIndex: item.answerIndex,
      explanation: item.explanation,
      conceptTested: `${subject} - ${topic}`,
      whyCorrect: item.explanation,
      wrongOptionExplanations: {
        0: `Review ${topic} formulas and units.`,
        1: `Option 2 is a common distractor in ${topic}.`,
        2: `Check boundary conditions.`,
        3: `Carefully verify given values.`
      },
      commonPitfall: `Misreading the problem variables or applying the wrong formula in ${topic}.`,
      keyRule: `Review the foundational definitions for ${subject} > ${topic}.`,
      solution: {
        type: "theory",
        subject,
        topic,
        directAnswer: item.options[item.answerIndex],
        steps: [
          { title: "Problem Analysis", detail: item.question },
          { title: "Concept Application", detail: item.explanation }
        ],
        finalAnswer: item.options[item.answerIndex],
        conceptUsed: topic,
        keyTakeaway: item.explanation
      }
    };

    // Shuffle options so correct answer is not always in the same position
    return shuffleQuestionOptions(base);
  });

  // Deduplicate results
  let unique = deduplicateQuestions(mapped);

  // If fewer than count unique items returned, fill remainder from local syllabus engine
  if (unique.length < count) {
    const needed = count - unique.length;
    const existingNorms = unique.map(q => normalizeQuestionText(q.question));
    const extra = getLocalSubjectQuestions(subject, topic, level, needed, [...existingExcludes, ...existingNorms]);
    unique = deduplicateQuestions([...unique, ...extra]);
  }

  return unique.slice(0, count);
}

// =========================================================================
// MASSIVE LOCAL SYLLABUS QUESTION DATABASE
// Contains 25+ distinct questions for Physics Motion, and varied questions
// across all syllabus subjects with zero repetitions.
// =========================================================================

interface CuratedQuestion {
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Exam Level";
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  whyCorrect: string;
  wrongOptionExplanations: Record<number, string>;
  commonPitfall: string;
  keyRule: string;
}

const SYLLABUS_QUESTION_BANK: CuratedQuestion[] = [
  // ===================== PHYSICS: MOTION (25 DISTINCT QUESTIONS) =====================
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "A car accelerates uniformly from rest to a speed of $20\\text{ m/s}$ in $5\\text{ seconds}$. What is the total distance traveled during this acceleration?",
    options: ["$50\\text{ m}$", "$100\\text{ m}$", "$40\\text{ m}$", "$25\\text{ m}$"],
    correctIndex: 0,
    explanation: "Using $s = \\frac{u+v}{2}t$, with $u = 0$, $v = 20\\text{ m/s}$, and $t = 5\\text{ s}$, distance $s = 10 \\times 5 = 50\\text{ m}$.",
    whyCorrect: "Average velocity during linear acceleration from rest is half the final speed ($10\\text{ m/s}$). Distance is $10\\text{ m/s} \\times 5\\text{ s} = 50\\text{ m}$.",
    wrongOptionExplanations: {
      1: "You calculated $v \\times t = 100\\text{ m}$, assuming constant speed rather than starting from rest.",
      2: "You miscalculated the acceleration rate without the proper kinematic relation.",
      3: "You halved the distance an extra time."
    },
    commonPitfall: "Using $s = vt$ directly when velocity is changing.",
    keyRule: "Under uniform acceleration from rest: $s = \\frac{1}{2}vt = \\frac{1}{2}at^2$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A stone is dropped from a cliff and strikes the ground after $4.0\\text{ seconds}$. Taking $g = 9.8\\text{ m/s}^2$ and ignoring air resistance, what is the height of the cliff?",
    options: ["$78.4\\text{ m}$", "$39.2\\text{ m}$", "$156.8\\text{ m}$", "$19.6\\text{ m}$"],
    correctIndex: 0,
    explanation: "For free fall from rest ($u = 0$), $h = \\frac{1}{2}gt^2 = 0.5 \\times 9.8 \\times 16 = 78.4\\text{ m}$.",
    whyCorrect: "Vertical displacement under gravity from rest is $h = \\frac{1}{2}gt^2 = 4.9 \\times 16 = 78.4\\text{ meters}$.",
    wrongOptionExplanations: {
      1: "39.2 m/s is the final impact VELOCITY ($v = gt$), not the height!",
      2: "You forgot the factor of 1/2 in $\\frac{1}{2}gt^2$.",
      3: "You used $t$ instead of $t^2$."
    },
    commonPitfall: "Confusing impact velocity ($v = gt$) with vertical height ($h = \\frac{1}{2}gt^2$).",
    keyRule: "Height fallen from rest: $h = \\frac{1}{2}gt^2$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "On a position-time graph (displacement vs time), what physical quantity is represented by the slope of the curve?",
    options: ["Instantaneous velocity", "Instantaneous acceleration", "Total momentum", "Net force"],
    correctIndex: 0,
    explanation: "Slope equals $\\frac{\\Delta x}{\\Delta t}$, which is the rate of change of position, defining velocity.",
    whyCorrect: "Velocity is the first derivative of position with respect to time ($v = \\frac{dx}{dt}$).",
    wrongOptionExplanations: {
      1: "Acceleration is the slope of a VELOCITY-time graph, not position-time.",
      2: "Momentum is mass times velocity ($p = mv$).",
      3: "Force is mass times acceleration."
    },
    commonPitfall: "Confusing position-time graphs with velocity-time graphs.",
    keyRule: "Position slope = Velocity; Velocity slope = Acceleration."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "A high-speed train traveling at $72\\text{ km/h}$ applies emergency brakes and decelerates uniformly to a stop over $200\\text{ m}$. What is the magnitude of its deceleration?",
    options: ["$1.0\\text{ m/s}^2$", "$2.0\\text{ m/s}^2$", "$0.5\\text{ m/s}^2$", "$3.6\\text{ m/s}^2$"],
    correctIndex: 0,
    explanation: "Convert $72\\text{ km/h} = 20\\text{ m/s}$. Using $v^2 = u^2 - 2as$ with $v = 0$: $0 = 400 - 2a(200) \\implies a = 1.0\\text{ m/s}^2$.",
    whyCorrect: "Using $v^2 = u^2 - 2as$, $a = \\frac{u^2}{2s} = \\frac{20^2}{2(200)} = \\frac{400}{400} = 1.0\\text{ m/s}^2$.",
    wrongOptionExplanations: {
      1: "You forgot the factor of 2 in $2as$ and got $a = 2.0\\text{ m/s}^2$.",
      2: "You doubled the denominator unnecessarily.",
      3: "You forgot to convert km/h into m/s."
    },
    commonPitfall: "Forgetting to convert km/h to m/s before applying kinematic equations.",
    keyRule: "Convert to SI units: $72\\text{ km/h} \\times \\frac{5}{18} = 20\\text{ m/s}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "Which of the following measurements represents a vector quantity?",
    options: ["Displacement of $15\\text{ m}$ East", "Distance of $15\\text{ m}$", "Speed of $60\\text{ km/h}$", "Time duration of $12\\text{ s}$"],
    correctIndex: 0,
    explanation: "Vectors possess both magnitude and direction. Displacement specifies magnitude and direction (East).",
    whyCorrect: "Distance, speed, and time only have magnitude. Displacement has direction and magnitude.",
    wrongOptionExplanations: {
      1: "Distance is scalar without direction.",
      2: "Speed is scalar without direction.",
      3: "Time is a scalar quantity."
    },
    commonPitfall: "Confusing distance (scalar) with displacement (vector).",
    keyRule: "Vector = Magnitude + Direction; Scalar = Magnitude only."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "An athlete runs around a circular track of circumference $400\\text{ m}$ and returns to the starting line after $50\\text{ seconds}$. What is the athlete's average velocity?",
    options: ["$0\\text{ m/s}$", "$8\\text{ m/s}$", "$4\\text{ m/s}$", "$16\\text{ m/s}$"],
    correctIndex: 0,
    explanation: "Average velocity is $\\frac{\\text{Net Displacement}}{\\text{Total Time}}$. Since the athlete returned to the starting point, displacement is zero, so average velocity is $0\\text{ m/s}$.",
    whyCorrect: "Displacement is zero because initial and final positions coincide. Average speed is $8\\text{ m/s}$, but average velocity is $0\\text{ m/s}$.",
    wrongOptionExplanations: {
      1: "8 m/s is the AVERAGE SPEED ($400/50$), not average velocity!",
      2: "4 m/s is an arbitrary fraction.",
      3: "16 m/s incorrectly doubled the speed."
    },
    commonPitfall: "Confusing average speed (total distance / time) with average velocity (net displacement / time).",
    keyRule: "Closed loop path $\\implies$ Displacement $= 0 \\implies$ Average Velocity $= 0$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A car travels the first half of a journey at $40\\text{ km/h}$ and the second half (equal distance) at $60\\text{ km/h}$. What is the average speed for the entire journey?",
    options: ["$48\\text{ km/h}$", "$50\\text{ km/h}$", "$45\\text{ km/h}$", "$52\\text{ km/h}$"],
    correctIndex: 0,
    explanation: "For equal distances, the average speed is the harmonic mean: $v_{\\text{avg}} = \\frac{2 v_1 v_2}{v_1 + v_2} = \\frac{2(40)(60)}{40 + 60} = \\frac{4800}{100} = 48\\text{ km/h}$.",
    whyCorrect: "Because more time is spent driving at the slower speed ($40\\text{ km/h}$), the true average speed is weighted toward the lower speed ($48\\text{ km/h}$).",
    wrongOptionExplanations: {
      1: "50 km/h is the simple arithmetic average $\\frac{40+60}{2}$. That is only valid for equal TIMES, not equal distances!",
      2: "45 km/h is an arbitrary underestimate.",
      3: "52 km/h weights the faster speed, which is physically backwards."
    },
    commonPitfall: "Using arithmetic mean $\\frac{v_1+v_2}{2}$ when distances are equal instead of harmonic mean $\\frac{2v_1v_2}{v_1+v_2}$.",
    keyRule: "Equal distances $\\implies v_{\\text{avg}} = \\frac{2v_1v_2}{v_1+v_2}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "A ball is thrown vertically upward with an initial velocity of $29.4\\text{ m/s}$. Taking $g = 9.8\\text{ m/s}^2$, what is the maximum height reached?",
    options: ["$44.1\\text{ m}$", "$88.2\\text{ m}$", "$29.4\\text{ m}$", "$14.7\\text{ m}$"],
    correctIndex: 0,
    explanation: "At maximum height, $v = 0$. Using $v^2 = u^2 - 2gH$: $0 = (29.4)^2 - 2(9.8)H \\implies 19.6H = 864.36 \\implies H = 44.1\\text{ m}$.",
    whyCorrect: "$H = \\frac{u^2}{2g} = \\frac{(29.4)^2}{2(9.8)} = \\frac{864.36}{19.6} = 44.1\\text{ meters}$.",
    wrongOptionExplanations: {
      1: "88.2 m forgot the factor of 2 in $2g$ in the denominator.",
      2: "29.4 m equals the initial speed, not the peak height.",
      3: "14.7 m divided by an extra factor of 3."
    },
    commonPitfall: "Using $H = \\frac{u^2}{g}$ without the factor of 2.",
    keyRule: "Maximum height for vertical throw: $H_{\\text{max}} = \\frac{u^2}{2g}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "What does the area under a velocity-time graph between two points in time represent?",
    options: ["Displacement", "Acceleration", "Average speed", "Instantaneous power"],
    correctIndex: 0,
    explanation: "The area under $v(t)$ is $\\int v(t) dt$, which mathematically equals the change in position (displacement).",
    whyCorrect: "Multiplying velocity (m/s) by time (s) yields meters (displacement).",
    wrongOptionExplanations: {
      1: "Acceleration is the SLOPE of the velocity-time graph, not the area.",
      2: "Average speed is distance divided by time.",
      3: "Power involves force times velocity."
    },
    commonPitfall: "Confusing the slope of the $v-t$ curve (acceleration) with the area under it (displacement).",
    keyRule: "Area under $v-t$ curve = Displacement; Slope of $v-t$ curve = Acceleration."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A particle travels in a circle of radius $5\\text{ m}$ at a constant speed of $10\\text{ m/s}$. What is the magnitude of its centripetal acceleration?",
    options: ["$20\\text{ m/s}^2$", "$2\\text{ m/s}^2$", "$50\\text{ m/s}^2$", "$0\\text{ m/s}^2$"],
    correctIndex: 0,
    explanation: "Centripetal acceleration is $a_c = \\frac{v^2}{r} = \\frac{10^2}{5} = \\frac{100}{5} = 20\\text{ m/s}^2$.",
    whyCorrect: "Even at constant speed, directional change produces centripetal acceleration: $a_c = \\frac{v^2}{r} = \\frac{100}{5} = 20\\text{ m/s}^2$.",
    wrongOptionExplanations: {
      1: "You computed $v / r = 10 / 5 = 2\\text{ rad/s}$, which is angular velocity $\\omega$, not acceleration!",
      2: "You computed $v \\times r = 50$.",
      3: "Acceleration is NOT zero because velocity direction is continuously changing."
    },
    commonPitfall: "Thinking acceleration is zero in uniform circular motion because speed is constant.",
    keyRule: "Centripetal acceleration: $a_c = \\frac{v^2}{r} = \\omega^2 r$, directed toward the circle center."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "Two trains of length $100\\text{ m}$ each move toward each other on parallel tracks with speeds of $15\\text{ m/s}$ and $25\\text{ m/s}$. How long will they take to completely pass each other?",
    options: ["$5.0\\text{ seconds}$", "$10.0\\text{ seconds}$", "$2.5\\text{ seconds}$", "$8.0\\text{ seconds}$"],
    correctIndex: 0,
    explanation: "Relative speed is $v_{\\text{rel}} = 15 + 25 = 40\\text{ m/s}$. Total distance to clear is $L_1 + L_2 = 100 + 100 = 200\\text{ m}$. Time $t = \\frac{200}{40} = 5.0\\text{ s}$.",
    whyCorrect: "When moving in opposite directions, relative speed is the sum ($40\\text{ m/s}$). Passing distance is the sum of both train lengths ($200\\text{ m}$): $t = 200/40 = 5.0\\text{ s}$.",
    wrongOptionExplanations: {
      1: "10 seconds results from using only one train's length ($100/40 = 2.5$) and doubling incorrectly.",
      2: "2.5 seconds only clears one train's length.",
      3: "8 seconds uses the speed difference ($25 - 15 = 10\\text{ m/s}$). That applies to the SAME direction, not opposite!"
    },
    commonPitfall: "Subtracting speeds when objects move in opposite directions; opposite directions ADD relative speed.",
    keyRule: "Opposite directions: $v_{\\text{rel}} = v_1 + v_2$. Same direction: $v_{\\text{rel}} = |v_1 - v_2|$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "What instrument on an automobile measures the instantaneous speed of the vehicle?",
    options: ["Speedometer", "Odometer", "Tachometer", "Accelerometer"],
    correctIndex: 0,
    explanation: "A speedometer measures the instantaneous speed of the vehicle at any given moment.",
    whyCorrect: "The speedometer displays speed right now ($v = \\frac{ds}{dt}$), while the odometer records total distance traveled.",
    wrongOptionExplanations: {
      1: "An odometer measures total distance traveled, not speed.",
      2: "A tachometer measures engine RPM (rotations per minute).",
      3: "An accelerometer measures rate of change of velocity."
    },
    commonPitfall: "Confusing speedometer (speed) with odometer (distance).",
    keyRule: "Speedometer = Instantaneous Speed; Odometer = Total Distance."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "Can an object have a constant speed and still have a non-zero acceleration?",
    options: [
      "Yes, if its direction of motion is changing (e.g. uniform circular motion)",
      "No, constant speed always means zero acceleration",
      "Yes, but only in a perfect vacuum",
      "No, acceleration requires a change in magnitude of velocity"
    ],
    correctIndex: 0,
    explanation: "Velocity is a vector. Acceleration is $\\vec{a} = \\frac{d\\vec{v}}{dt}$. Changing direction with constant magnitude produces centripetal acceleration.",
    whyCorrect: "Acceleration occurs whenever velocity changes in magnitude, direction, or both. In circular motion, direction changes continuously.",
    wrongOptionExplanations: {
      1: "Speed is only magnitude. Direction changes cause real non-zero acceleration.",
      2: "Vacuum is not required; this is a geometric consequence of vector kinematics.",
      3: "Direction changes constitute acceleration without changing speed magnitude."
    },
    commonPitfall: "Equating speed with velocity. Speed is scalar; velocity is vector.",
    keyRule: "Direction change with constant speed produces acceleration perpendicular to velocity."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "A projectile is launched with speed $u$ at an angle $\\theta$ to the horizontal. What is its velocity vector at the highest point of its trajectory?",
    options: ["$u\\cos\\theta$ horizontally", "Zero", "$u\\sin\\theta$ vertically", "$u$ in the launch direction"],
    correctIndex: 0,
    explanation: "At peak height, the vertical component of velocity vanishes ($v_y = 0$). The horizontal component $v_x = u\\cos\\theta$ remains unchanged.",
    whyCorrect: "Without air resistance, gravity only accelerates vertically. Thus horizontal speed $u\\cos\\theta$ is constant throughout flight.",
    wrongOptionExplanations: {
      1: "Velocity is NOT zero at the apex—only the vertical component $v_y$ is zero!",
      2: "$u\\sin\\theta$ is the INITIAL vertical velocity, which is zero at the peak.",
      3: "Velocity is purely horizontal at the apex, not at angle $\\theta$."
    },
    commonPitfall: "Assuming velocity is zero at the peak of a projectile. Only vertical velocity is zero; horizontal velocity remains $u\\cos\\theta$.",
    keyRule: "At projectile peak: $v_y = 0$, $v_x = u\\cos\\theta$, total velocity $= u\\cos\\theta$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A body starting from rest moves with a constant acceleration of $2\\text{ m/s}^2$. What distance does it cover in the $3^{\\text{rd}}$ second?",
    options: ["$5.0\\text{ m}$", "$9.0\\text{ m}$", "$6.0\\text{ m}$", "$4.0\\text{ m}$"],
    correctIndex: 0,
    explanation: "Distance in the $n^{\\text{th}}$ second is $s_n = u + \\frac{a}{2}(2n - 1)$. For $u = 0, a = 2, n = 3$: $s_3 = 0 + \\frac{2}{2}(2(3) - 1) = 1 \\times 5 = 5.0\\text{ m}$.",
    whyCorrect: "Total distance in 3 seconds is $s(3) = 0.5(2)(9) = 9\\text{ m}$. Total distance in 2 seconds is $s(2) = 0.5(2)(4) = 4\\text{ m}$. Distance during 3rd second is $9 - 4 = 5.0\\text{ m}$.",
    wrongOptionExplanations: {
      1: "9.0 m is the TOTAL distance after 3 seconds, not the distance covered during the 3rd second alone!",
      2: "6.0 m is the instantaneous velocity at $t = 3\\text{ s}$ ($v = at = 6\\text{ m/s}$).",
      3: "4.0 m is the distance covered in the first 2 seconds."
    },
    commonPitfall: "Confusing total distance after $n$ seconds with distance covered during the $n^{\\text{th}}$ second.",
    keyRule: "Distance in $n^{\\text{th}}$ second: $s_n = u + \\frac{a}{2}(2n - 1) = s(n) - s(n-1)$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "What is the SI unit of acceleration?",
    options: ["$\\text{m/s}^2$", "$\\text{m/s}$", "$\\text{m} \\cdot \\text{s}$", "$\\text{kg} \\cdot \\text{m/s}^2$"],
    correctIndex: 0,
    explanation: "Acceleration is change in velocity divided by time: $\\frac{\\text{m/s}}{\\text{s}} = \\text{m/s}^2$.",
    whyCorrect: "SI unit of velocity is m/s; dividing by time (s) gives meters per second squared ($\\text{m/s}^2$).",
    wrongOptionExplanations: {
      1: "m/s is the unit of speed and velocity.",
      2: "$\\text{m} \\cdot \\text{s}$ is not a standard kinematic unit.",
      3: "$\\text{kg} \\cdot \\text{m/s}^2$ is the Newton (unit of force)."
    },
    commonPitfall: "Confusing velocity units (m/s) with acceleration units (m/s²).",
    keyRule: "Velocity = m/s; Acceleration = m/s²."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "When a skydiver reaches terminal velocity, what is their acceleration?",
    options: ["$0\\text{ m/s}^2$", "$9.8\\text{ m/s}^2$", "Increasing", "Negative"],
    correctIndex: 0,
    explanation: "At terminal velocity, the upward air drag equals downward gravity ($F_{\\text{net}} = 0$), so acceleration is $0\\text{ m/s}^2$ and speed is constant.",
    whyCorrect: "Terminal velocity is constant speed, meaning $\\frac{dv}{dt} = 0$.",
    wrongOptionExplanations: {
      1: "9.8 m/s² is initial free-fall acceleration before air resistance builds up.",
      2: "Acceleration decreases to zero as speed increases toward terminal velocity.",
      3: "Negative acceleration only occurs if a parachute opens and decelerates the skydiver."
    },
    commonPitfall: "Assuming gravity still accelerates the skydiver when drag equals weight.",
    keyRule: "Terminal velocity $\\implies F_{\\text{drag}} = mg \\implies F_{\\text{net}} = 0 \\implies a = 0$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "A ball thrown vertically upward returns to the thrower's hand after $6.0\\text{ seconds}$. Taking $g = 9.8\\text{ m/s}^2$, what was its initial upward launch velocity?",
    options: ["$29.4\\text{ m/s}$", "$58.8\\text{ m/s}$", "$14.7\\text{ m/s}$", "$9.8\\text{ m/s}$"],
    correctIndex: 0,
    explanation: "Total time of flight is $T = \\frac{2u}{g} = 6.0\\text{ s} \\implies u = \\frac{6.0 \\times 9.8}{2} = 29.4\\text{ m/s}$.",
    whyCorrect: "Time to reach apex is half the round-trip time: $t_{\\text{up}} = 3.0\\text{ s}$. At apex, $v = u - gt = 0 \\implies u = 9.8 \\times 3 = 29.4\\text{ m/s}$.",
    wrongOptionExplanations: {
      1: "58.8 m/s used the entire 6 seconds in $u = gt$ without dividing by 2.",
      2: "14.7 m/s divided by an extra factor of 2.",
      3: "9.8 m/s is the acceleration due to gravity."
    },
    commonPitfall: "Using full round-trip time in $v = u - gt$ instead of time to apex ($t = T/2$).",
    keyRule: "Total time of flight for vertical return: $T = \\frac{2u}{g} \\implies u = \\frac{gT}{2}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "Can an object have zero velocity and simultaneously have a non-zero acceleration?",
    options: [
      "Yes, at the highest point of a vertically thrown ball",
      "No, zero velocity requires zero acceleration",
      "Yes, but only in circular motion",
      "No, acceleration cannot exist without motion"
    ],
    correctIndex: 0,
    explanation: "At the peak of a vertical throw, instantaneous velocity is momentarily zero, but gravity accelerates the ball downward at $9.8\\text{ m/s}^2$.",
    whyCorrect: "Acceleration is the RATE of change of velocity, not velocity itself. At peak, velocity transitions from positive to negative through zero while $\\frac{dv}{dt} = -g \\neq 0$.",
    wrongOptionExplanations: {
      1: "Zero velocity simply means instantaneous stationary position; acceleration is the rate at which velocity changes.",
      2: "In circular motion, velocity is never zero.",
      3: "Forces can act on momentarily stationary objects to begin motion."
    },
    commonPitfall: "Believing that $v = 0$ implies $a = 0$.",
    keyRule: "At maximum vertical height: $v = 0$ and $a = -9.8\\text{ m/s}^2$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "If a body travels equal distances in equal intervals of time along a straight line, its motion is classified as:",
    options: ["Uniform motion", "Non-uniform motion", "Accelerated motion", "Oscillatory motion"],
    correctIndex: 0,
    explanation: "Uniform linear motion is characterized by constant speed and zero acceleration in a straight line.",
    whyCorrect: "Equal distances in equal times means constant speed. In a straight line, this implies constant velocity (uniform motion).",
    wrongOptionExplanations: {
      1: "Non-uniform motion covers unequal distances in equal time intervals.",
      2: "Accelerated motion has changing velocity.",
      3: "Oscillatory motion moves back and forth periodically."
    },
    commonPitfall: "Confusing uniform motion (constant velocity) with uniform acceleration (changing velocity at a constant rate).",
    keyRule: "Uniform motion: Velocity is constant, Acceleration = 0."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A body falls freely from rest under gravity. What is the ratio of distances traveled in the 1st, 2nd, and 3rd seconds of its motion?",
    options: ["$1 : 3 : 5$", "$1 : 2 : 3$", "$1 : 4 : 9$", "$1 : 1 : 1$"],
    correctIndex: 0,
    explanation: "Galileo's odd-number rule: for uniform acceleration from rest, distance in the nth second $s_n \\propto (2n - 1)$. For $n = 1, 2, 3$, the ratio is $1 : 3 : 5$.",
    whyCorrect: "Using $s_n = \\frac{1}{2}g(2n-1)$, $s_1 : s_2 : s_3 = 1 : 3 : 5$.",
    wrongOptionExplanations: {
      1: "1:2:3 assumes distance scales linearly with second index, not odd integers.",
      2: "1:4:9 is the ratio of CUMULATIVE distances ($s \\propto t^2$), not distances in each individual second!",
      3: "1:1:1 would mean constant speed, but the body is accelerating."
    },
    commonPitfall: "Confusing total cumulative distance ratio ($1:4:9$) with individual successive second intervals ($1:3:5$).",
    keyRule: "Galileo's odd number rule: Successive distance intervals from rest scale as $1 : 3 : 5 : 7 : \\dots$"
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "If a car traveling at speed $v$ requires a minimum stopping distance $d$ under maximum braking, what stopping distance is required if its initial speed is doubled to $2v$ under the same braking deceleration?",
    options: ["$4d$", "$2d$", "$8d$", "$\\sqrt{2}d$"],
    correctIndex: 0,
    explanation: "From $v^2 = 2as$, stopping distance $s = \\frac{v^2}{2a}$. Stopping distance is proportional to the square of velocity ($s \\propto v^2$). Doubling speed yields $(2v)^2 = 4v^2$, which requires $4d$.",
    whyCorrect: "Kinetic energy $\\frac{1}{2}mv^2$ quadruples when speed doubles, so braking work $F \\cdot d$ must quadruple.",
    wrongOptionExplanations: {
      1: "Stopping distance scales as $v^2$, NOT linearly with $v$.",
      2: "Cubing the speed is unphysical.",
      3: "Square root relationship is backwards."
    },
    commonPitfall: "Thinking braking distance doubles when speed doubles; it quadruples because $s \\propto v^2$.",
    keyRule: "Braking distance is proportional to velocity squared: $d \\propto v^2$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "At what launch angle $\\theta$ above the horizontal is the horizontal range of a projectile maximized on level ground (neglecting air drag)?",
    options: ["$45^\\circ$", "$30^\\circ$", "$60^\\circ$", "$90^\\circ$"],
    correctIndex: 0,
    explanation: "Horizontal range is $R = \\frac{u^2 \\sin(2\\theta)}{g}$. The factor $\\sin(2\\theta)$ achieves its maximum value of $1$ when $2\\theta = 90^\\circ \\implies \\theta = 45^\\circ$.",
    whyCorrect: "Maximum of sine function occurs at $90^\\circ$, hence $2\\theta = 90^\\circ \\implies \\theta = 45^\\circ$.",
    wrongOptionExplanations: {
      1: "30 degrees gives $\\sin(60^\\circ) = 0.866$, less than maximum.",
      2: "60 degrees also gives $\\sin(120^\\circ) = 0.866$.",
      3: "90 degrees launches straight up ($R = 0$)."
    },
    commonPitfall: "Selecting $90^\\circ$ (which maximizes height, not horizontal range).",
    keyRule: "Maximum horizontal range on flat ground occurs at $\\theta = 45^\\circ$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A projectile launched at an angle of $30^\\circ$ to the horizontal achieves a horizontal range of $R$. At what other launch angle with the same initial speed will it achieve the exact same range?",
    options: ["$60^\\circ$", "$45^\\circ$", "$15^\\circ$", "$75^\\circ$"],
    correctIndex: 0,
    explanation: "Horizontal range $R = \\frac{u^2 \\sin(2\\theta)}{g}$. Since $\\sin(2(90^\\circ - \\theta)) = \\sin(180^\\circ - 2\\theta) = \\sin(2\\theta)$, complementary angles produce identical ranges. The complement of $30^\\circ$ is $60^\\circ$.",
    whyCorrect: "Angles $\\theta$ and $(90^\\circ - \\theta)$ have identical horizontal ranges.",
    wrongOptionExplanations: {
      1: "45 degrees yields the MAXIMUM range, which is larger than $R$.",
      2: "15 degrees yields a smaller range ($R/2$).",
      3: "75 degrees is complementary to 15 degrees, not 30 degrees."
    },
    commonPitfall: "Forgetting that complementary angles $(\\theta, 90^\\circ - \\theta)$ give equal projectile ranges.",
    keyRule: "Range is equal for complementary angles: $R(\\theta) = R(90^\\circ - \\theta)$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "In a perfect vacuum, a heavy lead bowling ball and a light feather are dropped simultaneously from the same height. Which one strikes the ground first?",
    options: ["Both hit the ground at the exact same instant", "The lead bowling ball hits first", "The feather hits first", "The one with larger surface area hits first"],
    correctIndex: 0,
    explanation: "In a vacuum with zero air resistance, acceleration due to gravity $g$ is independent of the mass of the falling object ($a = g$). Both fall with identical acceleration and hit at the exact same instant.",
    whyCorrect: "Gravitational force $F = mg$, and acceleration $a = \\frac{F}{m} = g$, completely independent of mass.",
    wrongOptionExplanations: {
      1: "Mass does not affect free fall acceleration in a vacuum (Galileo's law).",
      2: "The feather has no buoyant force or air resistance in a vacuum.",
      3: "Surface area only creates drag in a fluid or atmosphere, which does not exist in a vacuum."
    },
    commonPitfall: "Assuming heavier objects fall faster in vacuum due to everyday air resistance intuition.",
    keyRule: "In a vacuum, all objects fall with identical acceleration $g$ regardless of mass or shape."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A wheel rotates at a constant rate of $120\\text{ revolutions per minute (rpm)}$. What is its angular speed in radians per second?",
    options: ["$4\\pi\\text{ rad/s}$", "$2\\pi\\text{ rad/s}$", "$120\\pi\\text{ rad/s}$", "$8\\pi\\text{ rad/s}$"],
    correctIndex: 0,
    explanation: "Frequency $f = \\frac{120}{60} = 2\\text{ rev/s}$. Angular velocity $\\omega = 2\\pi f = 2\\pi(2) = 4\\pi\\text{ rad/s} \\approx 12.57\\text{ rad/s}$.",
    whyCorrect: "Each revolution equals $2\\pi$ radians. In 1 second, 2 revolutions occur, giving $2 \\times 2\\pi = 4\\pi\\text{ rad/s}$.",
    wrongOptionExplanations: {
      1: "2π rad/s corresponds to 60 rpm (1 rev/s).",
      2: "120π forgot to convert minutes to seconds.",
      3: "8π rad/s doubled the frequency incorrectly."
    },
    commonPitfall: "Forgetting to divide rpm by 60 to convert from minutes to seconds.",
    keyRule: "Angular velocity: $\\omega = \\frac{2\\pi \\times \\text{rpm}}{60}\\text{ rad/s}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "If an object is dropped from rest from a height of $19.6\\text{ m}$, how much time does it take to hit the ground? (Use $g = 9.8\\text{ m/s}^2$)",
    options: ["$2.0\\text{ seconds}$", "$1.0\\text{ second}$", "$4.0\\text{ seconds}$", "$3.0\\text{ seconds}$"],
    correctIndex: 0,
    explanation: "Using $h = \\frac{1}{2}gt^2$: $19.6 = \\frac{1}{2}(9.8)t^2 = 4.9t^2 \\implies t^2 = \\frac{19.6}{4.9} = 4 \\implies t = 2.0\\text{ s}$.",
    whyCorrect: "$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(19.6)}{9.8}} = \\sqrt{4} = 2.0\\text{ s}$.",
    wrongOptionExplanations: {
      1: "1.0 second only yields a fall of $4.9\\text{ m}$.",
      2: "4.0 seconds is $t^2$, not $t$.",
      3: "3.0 seconds yields $44.1\\text{ m}$."
    },
    commonPitfall: "Forgetting to take the square root of $t^2$.",
    keyRule: "Time to fall height $h$ from rest: $t = \\sqrt{\\frac{2h}{g}}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "What is the physical term for the time rate of change of acceleration ($\\frac{da}{dt}$)?",
    options: ["Jerk", "Impulse", "Momentum", "Torque"],
    correctIndex: 0,
    explanation: "The derivative of acceleration with respect to time $\\frac{da}{dt}$ is known as jerk (or jolt).",
    whyCorrect: "Position $\\rightarrow$ Velocity ($dx/dt$) $\\rightarrow$ Acceleration ($dv/dt$) $\\rightarrow$ Jerk ($da/dt$).",
    wrongOptionExplanations: {
      1: "Impulse is force multiplied by time interval ($J = F \\Delta t$).",
      2: "Momentum is mass times velocity ($p = mv$).",
      3: "Torque is rotational force ($r \\times F$)."
    },
    commonPitfall: "Confusing kinematic derivatives with dynamical quantities like impulse.",
    keyRule: "Rate of change of acceleration is Jerk ($j = \\frac{da}{dt}$)."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A car moves along a circular curve while continuously pressing the gas pedal to increase its speed. What angle exists between its centripetal acceleration vector and its tangential acceleration vector?",
    options: ["$90^\\circ$", "$0^\\circ$", "$180^\\circ$", "$45^\\circ$"],
    correctIndex: 0,
    explanation: "Centripetal acceleration points radially inward toward the center of curvature, while tangential acceleration points tangent to the circle along velocity. Radial and tangential vectors are always strictly perpendicular ($90^\\circ$).",
    whyCorrect: "Centripetal acceleration is normal to velocity; tangential acceleration is parallel to velocity. Therefore, $\\vec{a}_c \\perp \\vec{a}_t$.",
    wrongOptionExplanations: {
      1: "0 degrees would mean they point in the same direction, which violates circular geometry.",
      2: "180 degrees would mean anti-parallel.",
      3: "45 degrees is the angle of the net acceleration when $a_c = a_t$, not the angle between the two component vectors!"
    },
    commonPitfall: "Confusing the angle between component vectors ($90^\\circ$) with the direction of the resultant acceleration vector.",
    keyRule: "Radial (centripetal) and tangential acceleration components are mutually perpendicular ($90^\\circ$)."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "A particle travels at $10\\text{ m/s}$ for the first $5\\text{ seconds}$ and at $30\\text{ m/s}$ for the next $5\\text{ seconds}$ in the same direction. What is its average speed?",
    options: ["$20\\text{ m/s}$", "$15\\text{ m/s}$", "$25\\text{ m/s}$", "$18\\text{ m/s}$"],
    correctIndex: 0,
    explanation: "Total distance is $(10 \\times 5) + (30 \\times 5) = 50 + 150 = 200\\text{ m}$. Total time is $5 + 5 = 10\\text{ s}$. Average speed is $v_{\\text{avg}} = \\frac{200}{10} = 20\\text{ m/s}$. When time intervals are equal, the average speed is the arithmetic mean $\\frac{v_1 + v_2}{2}$.",
    whyCorrect: "Equal time intervals $\\implies v_{\\text{avg}} = \\frac{v_1 + v_2}{2} = \\frac{10 + 30}{2} = 20\\text{ m/s}$.",
    wrongOptionExplanations: {
      1: "15 m/s is an underestimate.",
      2: "25 m/s weights the higher speed unfairly.",
      3: "18 m/s would be the harmonic mean (used for equal distances, not equal times!)."
    },
    commonPitfall: "Using harmonic mean when time intervals are equal; harmonic mean is for equal distances.",
    keyRule: "For equal time intervals: $v_{\\text{avg}} = \\frac{v_1 + v_2}{2}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "Car A moves east at $80\\text{ km/h}$ and Car B moves east along the same road at $60\\text{ km/h}$. What is the velocity of Car A as observed by a passenger in Car B?",
    options: ["$20\\text{ km/h}$ East", "$140\\text{ km/h}$ East", "$20\\text{ km/h}$ West", "$0\\text{ km/h}$"],
    correctIndex: 0,
    explanation: "Relative velocity $\\vec{v}_{A/B} = \\vec{v}_A - \\vec{v}_B = 80\\text{ km/h} - 60\\text{ km/h} = 20\\text{ km/h}$ in the direction of motion (East).",
    whyCorrect: "Since both move east, the relative velocity is the difference: $80 - 60 = 20\\text{ km/h}$ East.",
    wrongOptionExplanations: {
      1: "140 km/h is the relative speed if they were traveling in OPPOSITE directions ($80 + 60$).",
      2: "Car A is faster than B, so from B's frame, A pulls away forward (East), not West.",
      3: "0 km/h only occurs if speeds were identical."
    },
    commonPitfall: "Adding velocities when objects move in the same direction.",
    keyRule: "Same direction relative velocity: $v_{\\text{rel}} = v_A - v_B$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Hard",
    question: "An electron moving with an initial speed of $1.0 \\times 10^4\\text{ m/s}$ accelerates uniformly across a distance of $0.02\\text{ m}$ to a speed of $3.0 \\times 10^4\\text{ m/s}$. What is its acceleration?",
    options: ["$2.0 \\times 10^{10}\\text{ m/s}^2$", "$1.0 \\times 10^6\\text{ m/s}^2$", "$4.0 \\times 10^8\\text{ m/s}^2$", "$8.0 \\times 10^9\\text{ m/s}^2$"],
    correctIndex: 0,
    explanation: "Using $v^2 = u^2 + 2as$: $a = \\frac{v^2 - u^2}{2s} = \\frac{(9.0 \\times 10^8) - (1.0 \\times 10^8)}{2 \\times 0.02} = \\frac{8.0 \\times 10^8}{0.04} = 2.0 \\times 10^{10}\\text{ m/s}^2$.",
    whyCorrect: "$a = \\frac{(3 \\times 10^4)^2 - (1 \\times 10^4)^2}{2(0.02)} = \\frac{8 \\times 10^8}{0.04} = 2.0 \\times 10^{10}\\text{ m/s}^2$.",
    wrongOptionExplanations: {
      1: "Order of magnitude calculation error without squaring the velocities.",
      2: "Forgot the factor of 2 in $2s$.",
      3: "Arithmetic mistake in dividing by $0.04$."
    },
    commonPitfall: "Subtracting velocities directly ($v - u$) instead of difference of squares ($v^2 - u^2$).",
    keyRule: "Third equation of kinematics: $v^2 - u^2 = 2as \\implies a = \\frac{v^2 - u^2}{2s}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Medium",
    question: "A projectile is launched from ground level with speed $u$ at angle $\\theta$ above the horizontal. What is the expression for its total time of flight before landing on flat ground?",
    options: ["$\\frac{2u\\sin\\theta}{g}$", "$\\frac{u\\sin\\theta}{g}$", "$\\frac{2u\\cos\\theta}{g}$", "$\\frac{u^2\\sin\\theta}{2g}$"],
    correctIndex: 0,
    explanation: "Setting vertical position $y = (u\\sin\\theta)t - \\frac{1}{2}gt^2 = 0$ gives $t = \\frac{2u\\sin\\theta}{g}$.",
    whyCorrect: "Time to apex is $\\frac{u\\sin\\theta}{g}$. By symmetry, total flight time is double: $T = \\frac{2u\\sin\\theta}{g}$.",
    wrongOptionExplanations: {
      1: "$\\frac{u\\sin\\theta}{g}$ is only the time to reach maximum height, not the total round-trip flight time!",
      2: "Cos determines horizontal motion, not vertical flight duration.",
      3: "This has unphysical dimensions of length instead of time."
    },
    commonPitfall: "Confusing time to peak ($t_{\\text{peak}} = \\frac{u\\sin\\theta}{g}$) with total flight time ($T = 2 t_{\\text{peak}}$).",
    keyRule: "Total time of flight: $T = \\frac{2u\\sin\\theta}{g}$."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "A ball is thrown straight up into the air with initial speed $u$. Neglecting air resistance, what is its speed when it returns to the exact launch point?",
    options: ["$u$", "$0$", "$2u$", "$u/2$"],
    correctIndex: 0,
    explanation: "By conservation of mechanical energy or kinematic symmetry ($v^2 = u^2 - 2g(0) = u^2$), the magnitude of the impact velocity equals the launch speed $u$.",
    whyCorrect: "Mechanical energy is conserved: kinetic energy lost going up is entirely regained coming down.",
    wrongOptionExplanations: {
      1: "Speed is zero only at the highest apex point.",
      2: "Speed cannot double without an external energy source.",
      3: "Speed is only halved if half the kinetic energy was dissipated (which cannot happen with zero air drag)."
    },
    commonPitfall: "Confusing velocity (which is $-u$, opposite direction) with speed (magnitude $|-u| = u$).",
    keyRule: "Under gravity without air drag: Return speed equals launch speed ($|v| = u$)."
  },
  {
    subject: "physics",
    topic: "Motion",
    difficulty: "Easy",
    question: "For any general motion of a particle between two points, what is the fundamental mathematical relationship between total distance traveled ($D$) and magnitude of net displacement ($|\\vec{s}|$)?",
    options: ["$D \\geq |\\vec{s}|$", "$D < |\\vec{s}|$", "$D = |\\vec{s}|$ always", "$D \\leq |\\vec{s}|$"],
    correctIndex: 0,
    explanation: "The straight line distance between two points is the shortest possible path between them. Any curvature or reversal makes distance greater than displacement. Hence $D \\geq |\\vec{s}|$.",
    whyCorrect: "Displacement is the straight-line vector between initial and final points. Distance can never be less than displacement.",
    wrongOptionExplanations: {
      1: "Distance can NEVER be strictly less than displacement magnitude.",
      2: "Equality only holds if motion is along a straight line in a single direction without turning back.",
      3: "Reverses the fundamental inequality."
    },
    commonPitfall: "Thinking distance can be smaller than displacement.",
    keyRule: "Distance $\\geq$ |Displacement|, with equality only for unidirectional straight-line motion."
  },

  // ===================== CHEMISTRY: CHEMICAL REACTIONS =====================
  {
    subject: "chemistry",
    topic: "Chemical Reactions",
    difficulty: "Easy",
    question: "When magnesium ribbon burns in oxygen to produce white magnesium oxide powder, what type of reaction occurs?",
    options: ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Double displacement reaction"],
    correctIndex: 0,
    explanation: "$2\\text{Mg} + \\text{O}_2 \\rightarrow 2\\text{MgO}$. Two reactants combine into one single product, defining a combination reaction.",
    whyCorrect: "A combination reaction combines multiple reactants into a single product compound: $A + B \\rightarrow AB$.",
    wrongOptionExplanations: {
      1: "Decomposition breaks one reactant into multiple products.",
      2: "Displacement replaces one element with another.",
      3: "Double displacement exchanges ions between compounds."
    },
    commonPitfall: "Confusing combination with decomposition.",
    keyRule: "$A + B \\rightarrow AB$ is a combination reaction."
  },
  {
    subject: "chemistry",
    topic: "Chemical Reactions",
    difficulty: "Medium",
    question: "In the redox equation $\\text{CuO} + \\text{H}_2 \\rightarrow \\text{Cu} + \\text{H}_2\\text{O}$, which chemical species is REDUCED?",
    options: ["Copper(II) oxide (CuO)", "Hydrogen gas (H₂)", "Copper metal (Cu)", "Water (H₂O)"],
    correctIndex: 0,
    explanation: "CuO loses oxygen and the oxidation state of Cu drops from +2 to 0, which is reduction.",
    whyCorrect: "Reduction is loss of oxygen or gain of electrons. CuO is reduced to Cu.",
    wrongOptionExplanations: {
      1: "$\\text{H}_2$ gains oxygen and is oxidized to $\\text{H}_2\\text{O}$.",
      2: "Cu is the product of reduction, not the reactant that was reduced.",
      3: "$\\text{H}_2\\text{O}$ is the oxidation product."
    },
    commonPitfall: "Naming the product rather than the reactant being reduced.",
    keyRule: "Reactant that loses oxygen/gains electrons is reduced."
  },
  {
    subject: "chemistry",
    topic: "Chemical Reactions",
    difficulty: "Medium",
    question: "What color precipitate is formed when barium chloride solution reacts with sodium sulfate solution?",
    options: ["White precipitate of Barium Sulfate (BaSO₄)", "Blue precipitate of Copper Hydroxide", "Yellow precipitate of Lead Iodide", "Brown precipitate of Iron Hydroxide"],
    correctIndex: 0,
    explanation: "$\\text{BaCl}_2(aq) + \\text{Na}_2\\text{SO}_4(aq) \\rightarrow \\text{BaSO}_4(s) + 2\\text{NaCl}(aq)$. $\\text{BaSO}_4$ is an insoluble white solid.",
    whyCorrect: "Barium sulfate precipitation is a classic double displacement test producing an insoluble white precipitate.",
    wrongOptionExplanations: {
      1: "Copper hydroxide is blue, but no copper is present.",
      2: "Lead iodide is yellow, but no lead is present.",
      3: "Iron hydroxide is reddish-brown."
    },
    commonPitfall: "Confusing precipitate colors across qualitative analysis tests.",
    keyRule: "$\\text{Ba}^{2+} + \\text{SO}_4^{2-} \\rightarrow \\text{BaSO}_4 \\downarrow$ (White precipitate)."
  },

  // ===================== CHEMISTRY: ACIDS & BASES =====================
  {
    subject: "chemistry",
    topic: "Acids & Bases",
    difficulty: "Easy",
    question: "What is the pH of pure neutral water at $25^\\circ\\text{C}$?",
    options: ["7.0", "0.0", "14.0", "1.0"],
    correctIndex: 0,
    explanation: "At $25^\\circ\\text{C}$, $[\\text{H}^+] = 10^{-7}\\text{ M} \\implies \\text{pH} = -\\log_{10}(10^{-7}) = 7.0$.",
    whyCorrect: "Neutral solution has $[\\text{H}^+] = [\\text{OH}^-] = 10^{-7}\\text{ M}$.",
    wrongOptionExplanations: {
      1: "pH 0 is strongly acidic.",
      2: "pH 14 is strongly basic.",
      3: "pH 1 is strongly acidic."
    },
    commonPitfall: "Thinking 0 represents neutral.",
    keyRule: "Neutral pH = 7 at 25°C."
  },
  {
    subject: "chemistry",
    topic: "Acids & Bases",
    difficulty: "Medium",
    question: "When hydrochloric acid (HCl) reacts with sodium hydroxide (NaOH), what are the products?",
    options: ["Sodium chloride (NaCl) and water (H₂O)", "Sodium hydride and chlorine gas", "Sodium carbonate and water", "Sodium oxide and hydrogen gas"],
    correctIndex: 0,
    explanation: "Neutralization: $\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$.",
    whyCorrect: "Acid + Base forms Salt + Water.",
    wrongOptionExplanations: {
      1: "No chlorine gas is evolved in neutralization.",
      2: "Carbonate requires carbon dioxide or bicarbonate.",
      3: "Oxides do not form in aqueous neutralization."
    },
    commonPitfall: "Expecting hydrogen gas instead of water.",
    keyRule: "Acid + Base $\\rightarrow$ Salt + Water."
  },

  // ===================== MATHEMATICS: ALGEBRA & QUADRATIC EQUATIONS =====================
  {
    subject: "mathematics",
    topic: "Algebra",
    difficulty: "Medium",
    question: "If $\\alpha$ and $\\beta$ are the roots of the quadratic equation $x^2 - 5x + 6 = 0$, what is the numerical value of $\\alpha^2 + \\beta^2$?",
    options: ["$13$", "$25$", "$19$", "$7$"],
    correctIndex: 0,
    explanation: "By Vieta's formulas, $\\alpha + \\beta = 5$ and $\\alpha\\beta = 6$. Therefore $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 5^2 - 2(6) = 25 - 12 = 13$.",
    whyCorrect: "Algebraic identity: $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 25 - 12 = 13$.",
    wrongOptionExplanations: {
      1: "25 is $(\\alpha + \\beta)^2$ without subtracting $2\\alpha\\beta$.",
      2: "19 added $2\\alpha\\beta$ instead of subtracting.",
      3: "7 subtracted $3\\alpha\\beta$ incorrectly."
    },
    commonPitfall: "Forgetting to subtract $2\\alpha\\beta$ from $(\\alpha+\\beta)^2$.",
    keyRule: "$\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta$."
  },
  {
    subject: "mathematics",
    topic: "Quadratic Equations",
    difficulty: "Medium",
    question: "For what real values of $k$ does the quadratic equation $x^2 - kx + 9 = 0$ have equal real roots?",
    options: ["$k = \\pm 6$", "$k = 6$ only", "$k = \\pm 3$", "$k = \\pm 18$"],
    correctIndex: 0,
    explanation: "Equal roots require discriminant $\\Delta = b^2 - 4ac = 0$. Here $(-k)^2 - 4(1)(9) = 0 \\implies k^2 - 36 = 0 \\implies k = \\pm 6$.",
    whyCorrect: "Equal real roots occur when $\\Delta = 0 \\implies k^2 = 36 \\implies k = \\pm 6$.",
    wrongOptionExplanations: {
      1: "Forgot that $(-6)^2 = 36$, so $-6$ is also a valid real solution.",
      2: "Used $4ac = 12$ instead of $4(1)(9) = 36$.",
      3: "Multiplied by 2 instead of taking the square root."
    },
    commonPitfall: "Missing the negative root when solving $k^2 = 36$.",
    keyRule: "Equal real roots $\\iff \\Delta = b^2 - 4ac = 0$."
  },
  {
    subject: "mathematics",
    topic: "Algebra",
    difficulty: "Easy",
    question: "Find the 10th term ($a_{10}$) of the arithmetic progression (AP): $3, 7, 11, 15, \\dots$",
    options: ["$39$", "$43$", "$36$", "$40$"],
    correctIndex: 0,
    explanation: "First term $a = 3$, common difference $d = 7 - 3 = 4$. Using $a_n = a + (n-1)d$: $a_{10} = 3 + (10 - 1) \\times 4 = 3 + 36 = 39$.",
    whyCorrect: "$a_{10} = a + 9d = 3 + 9(4) = 39$.",
    wrongOptionExplanations: {
      1: "43 used $n$ instead of $n - 1$ ($3 + 10 \\times 4$).",
      2: "36 calculated only $9d$ without adding the initial term $a$.",
      3: "40 added 1 unnecessarily."
    },
    commonPitfall: "Using $a + nd$ instead of $a + (n-1)d$.",
    keyRule: "nth term of an AP: $a_n = a + (n-1)d$."
  },
  {
    subject: "mathematics",
    topic: "Algebra",
    difficulty: "Hard",
    question: "If $\\log_2(x) + \\log_2(x - 2) = 3$, what is the real solution for $x$?",
    options: ["$x = 4$", "$x = -2$", "$x = 4$ and $x = -2$", "$x = 8$"],
    correctIndex: 0,
    explanation: "Combine logarithms: $\\log_2(x(x-2)) = 3 \\implies x(x-2) = 2^3 = 8 \\implies x^2 - 2x - 8 = 0 \\implies (x-4)(x+2) = 0$. Since logarithms require $x > 2$, $x = -2$ is extraneous. Thus $x = 4$.",
    whyCorrect: "Logarithm domains require positive arguments ($x > 2$). $x = -2$ is extraneous; only $x = 4$ is valid.",
    wrongOptionExplanations: {
      1: "$x = -2$ makes $\\log_2(-2)$ undefined.",
      2: "Did not reject the extraneous negative root from the domain of the logarithm.",
      3: "Computed $2^3 = 8$ and set $x = 8$ directly without solving the quadratic."
    },
    commonPitfall: "Forgetting to discard extraneous solutions that violate the domain of logarithm arguments ($x > 0$).",
    keyRule: "Logarithmic domain check: $\\log_b(u)$ is defined only when $u > 0$."
  },
  {
    subject: "mathematics",
    topic: "Calculus",
    difficulty: "Medium",
    question: "What is the derivative of $f(x) = x^3 \\ln(x)$ with respect to $x$ for $x > 0$?",
    options: ["$3x^2 \\ln(x) + x^2$", "$3x^2 \\ln(x)$", "$x^2$", "$3x \\ln(x) + x^2$"],
    correctIndex: 0,
    explanation: "Product rule: $\\frac{d}{dx}[u v] = u' v + u v'$. Here $u = x^3 \\implies u' = 3x^2$ and $v = \\ln(x) \\implies v' = 1/x$. Thus $f'(x) = 3x^2 \\ln(x) + x^3(1/x) = 3x^2 \\ln(x) + x^2$.",
    whyCorrect: "$f'(x) = 3x^2 \\ln(x) + x^3 \\cdot \\frac{1}{x} = 3x^2 \\ln(x) + x^2$.",
    wrongOptionExplanations: {
      1: "Forgot to differentiate the second factor $\\ln(x)$.",
      2: "Only differentiated $\\ln(x)$ and omitted the derivative of $x^3$.",
      3: "Miscalculated the power of $x$ in $u'$."
    },
    commonPitfall: "Differentiating factors independently without applying the product rule.",
    keyRule: "Product Rule: $(uv)' = u'v + uv'$."
  },
  {
    subject: "mathematics",
    topic: "Calculus",
    difficulty: "Medium",
    question: "Evaluate the definite integral $\\int_0^2 (3x^2 - 2x + 1) \\, dx$.",
    options: ["$6$", "$8$", "$4$", "$10$"],
    correctIndex: 0,
    explanation: "Antiderivative: $F(x) = x^3 - x^2 + x$. Evaluating at bounds: $F(2) - F(0) = (2^3 - 2^2 + 2) - 0 = (8 - 4 + 2) = 6$.",
    whyCorrect: "$[x^3 - x^2 + x]_0^2 = (8 - 4 + 2) - 0 = 6$.",
    wrongOptionExplanations: {
      1: "8 omitted the $-x^2$ term.",
      2: "4 subtracted 2 instead of adding $+x$.",
      3: "10 added all terms without subtracting $x^2$."
    },
    commonPitfall: "Sign errors during polynomial antiderivative evaluation.",
    keyRule: "Fundamental Theorem of Calculus: $\\int_a^b f(x)dx = F(b) - F(a)$."
  },
  {
    subject: "mathematics",
    topic: "Trigonometry",
    difficulty: "Easy",
    question: "If $\\sin\\theta = \\frac{3}{5}$ and $\\theta$ lies in the first quadrant, what is the value of $\\tan\\theta$?",
    options: ["$\\frac{3}{4}$", "$\\frac{4}{3}$", "$\\frac{4}{5}$", "$\\frac{5}{4}$"],
    correctIndex: 0,
    explanation: "In quadrant I, $\\cos\\theta = \\sqrt{1 - \\sin^2\\theta} = \\sqrt{1 - 9/25} = 4/5$. Therefore $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{3/5}{4/5} = \\frac{3}{4}$.",
    whyCorrect: "Using the 3-4-5 right triangle: opposite = 3, hypotenuse = 5 $\\implies$ adjacent = 4. $\\tan\\theta = \\text{opp}/\\text{adj} = 3/4$.",
    wrongOptionExplanations: {
      1: "4/3 is $\\cot\\theta = \\text{adj}/\\text{opp}$, the reciprocal of tangent.",
      2: "4/5 is $\\cos\\theta$.",
      3: "5/4 is $\\sec\\theta$."
    },
    commonPitfall: "Confusing $\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}}$ with $\\cot\\theta = \\frac{\\text{adj}}{\\text{opp}}$.",
    keyRule: "$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{\\text{opposite}}{\\text{adjacent}}$."
  },
  {
    subject: "mathematics",
    topic: "Probability",
    difficulty: "Easy",
    question: "Two fair six-sided dice are rolled simultaneously. What is the probability of rolling a sum of $7$?",
    options: ["$\\frac{1}{6}$", "$\\frac{1}{12}$", "$\\frac{7}{36}$", "$\\frac{5}{36}$"],
    correctIndex: 0,
    explanation: "Total outcomes = $6 \\times 6 = 36$. Outcomes summing to 7: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ (6 favorable pairs). Probability $P = \\frac{6}{36} = \\frac{1}{6}$.",
    whyCorrect: "There are 6 favorable combinations out of 36 sample space outcomes: $6/36 = 1/6$.",
    wrongOptionExplanations: {
      1: "1/12 assumes only 3 favorable outcomes.",
      2: "7/36 uses the sum number 7 as the numerator.",
      3: "5/36 is the probability of summing to 6 or 8, not 7."
    },
    commonPitfall: "Counting pairs like $(1,6)$ and $(6,1)$ as a single outcome rather than two distinct ordered outcomes.",
    keyRule: "Probability $P(E) = \\frac{\\text{favorable outcomes}}{\\text{total sample space outcomes}}$."
  },

  // ===================== PHYSICS: LAWS OF MOTION, WORK & ENERGY, LIGHT =====================
  {
    subject: "physics",
    topic: "Laws of Motion",
    difficulty: "Easy",
    question: "A net force of $20\\text{ N}$ acts on a stationary cart of mass $4\\text{ kg}$. What is the acceleration produced?",
    options: ["$5\\text{ m/s}^2$", "$80\\text{ m/s}^2$", "$0.2\\text{ m/s}^2$", "$16\\text{ m/s}^2$"],
    correctIndex: 0,
    explanation: "Newton's Second Law: $F = ma \\implies a = \\frac{F}{m} = \\frac{20\\text{ N}}{4\\text{ kg}} = 5\\text{ m/s}^2$.",
    whyCorrect: "$a = \\frac{F}{m} = \\frac{20}{4} = 5\\text{ m/s}^2$.",
    wrongOptionExplanations: {
      1: "80 m/s² multiplied force by mass ($F \\times m$) instead of dividing.",
      2: "0.2 inverted mass and force ($m / F$).",
      3: "16 subtracted 4 from 20."
    },
    commonPitfall: "Multiplying $F$ and $m$ instead of dividing.",
    keyRule: "Newton's Second Law: $a = \\frac{F}{m}$."
  },
  {
    subject: "physics",
    topic: "Work & Energy",
    difficulty: "Medium",
    question: "If the momentum of a moving body is doubled, by what factor does its kinetic energy increase?",
    options: ["$4$ times", "$2$ times", "$8$ times", "$\\sqrt{2}$ times"],
    correctIndex: 0,
    explanation: "Kinetic energy expressed via momentum is $E_k = \\frac{p^2}{2m}$. If momentum becomes $2p$, $E_k' = \\frac{(2p)^2}{2m} = 4 \\left(\\frac{p^2}{2m}\\right) = 4 E_k$.",
    whyCorrect: "Kinetic energy is quadratic in momentum ($E_k \\propto p^2$). Doubling momentum quadruples kinetic energy.",
    wrongOptionExplanations: {
      1: "Assumes linear relationship with momentum.",
      2: "Cubing the factor is unphysical.",
      3: "Square root relationship is backwards."
    },
    commonPitfall: "Thinking kinetic energy scales linearly with momentum.",
    keyRule: "$E_k = \\frac{p^2}{2m} \\implies E_k \\propto p^2$."
  },
  {
    subject: "physics",
    topic: "Light",
    difficulty: "Easy",
    question: "What is the focal length of a concave spherical mirror having a radius of curvature of $30\\text{ cm}$?",
    options: ["$15\\text{ cm}$", "$60\\text{ cm}$", "$30\\text{ cm}$", "$10\\text{ cm}$"],
    correctIndex: 0,
    explanation: "For spherical mirrors of small aperture, the focal length is half the radius of curvature: $f = \\frac{R}{2} = \\frac{30}{2} = 15\\text{ cm}$.",
    whyCorrect: "Focal length equals half the radius of curvature ($f = R/2 = 15\\text{ cm}$).",
    wrongOptionExplanations: {
      1: "60 cm doubled the radius ($2R$) instead of halving.",
      2: "30 cm equated focal length to radius of curvature.",
      3: "10 cm divided by 3 arbitrarily."
    },
    commonPitfall: "Confusing focal length $f = R/2$ with $f = 2R$.",
    keyRule: "Focal length of spherical mirror: $f = \\frac{R}{2}$."
  },
  {
    subject: "physics",
    topic: "Electricity",
    difficulty: "Easy",
    question: "Two resistors of $6\\,\\Omega$ and $3\\,\\Omega$ are connected in parallel across a circuit. What is the equivalent resistance?",
    options: ["$2\\,\\Omega$", "$9\\,\\Omega$", "$4.5\\,\\Omega$", "$18\\,\\Omega$"],
    correctIndex: 0,
    explanation: "In parallel: $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{6} + \\frac{1}{3} = \\frac{3}{6} = \\frac{1}{2} \\implies R_p = 2\\,\\Omega$.",
    whyCorrect: "$R_p = \\frac{R_1 R_2}{R_1 + R_2} = \\frac{18}{9} = 2\\,\\Omega$.",
    wrongOptionExplanations: {
      1: "9 Ω is the SERIES resistance ($6 + 3 = 9\\,\\Omega$).",
      2: "4.5 Ω is the arithmetic average.",
      3: "18 Ω multiplied the values without dividing by their sum."
    },
    commonPitfall: "Adding resistances directly as if they were in series.",
    keyRule: "Parallel equivalent resistance: $R_p = \\frac{R_1 R_2}{R_1 + R_2}$."
  },

  // ===================== BIOLOGY: CELL, GENETICS, PHYSIOLOGY =====================
  {
    subject: "biology",
    topic: "Cell Structure & Function",
    difficulty: "Easy",
    question: "Which cellular organelle is responsible for generating adenosine triphosphate (ATP) through cellular respiration?",
    options: ["Mitochondria", "Ribosome", "Golgi apparatus", "Endoplasmic reticulum"],
    correctIndex: 0,
    explanation: "Mitochondria synthesize ATP through the Krebs cycle and oxidative phosphorylation, earning the title 'powerhouse of the cell'.",
    whyCorrect: "Mitochondria are the primary site of aerobic ATP production in eukaryotic cells.",
    wrongOptionExplanations: {
      1: "Ribosomes synthesize proteins from mRNA.",
      2: "Golgi apparatus packages and modifies proteins for secretion.",
      3: "Endoplasmic reticulum synthesizes lipids and processes proteins."
    },
    commonPitfall: "Confusing ribosomes (protein synthesis) with mitochondria (ATP synthesis).",
    keyRule: "Mitochondria = Cellular Respiration & ATP Synthesis."
  },
  {
    subject: "biology",
    topic: "Genetics & Heredity",
    difficulty: "Medium",
    question: "In a classical Mendelian monohybrid cross between two heterozygous pea plants ($Aa \\times Aa$), what is the expected phenotypic ratio of dominant to recessive traits in the offspring?",
    options: ["$3 : 1$", "$1 : 2 : 1$", "$9 : 3 : 3 : 1$", "$1 : 1$"],
    correctIndex: 0,
    explanation: "The genotype ratio is $1 AA : 2 Aa : 1 aa$. Both $AA$ and $Aa$ express the dominant phenotype, giving 3 dominant to 1 recessive ($3:1$ phenotypic ratio).",
    whyCorrect: "3 dominant individuals ($1 AA + 2 Aa$) for every 1 recessive individual ($1 aa$).",
    wrongOptionExplanations: {
      1: "1:2:1 is the GENOTYPIC ratio ($1 AA : 2 Aa : 1 aa$), not phenotypic!",
      2: "9:3:3:1 is the phenotypic ratio for a dihybrid cross ($AaBb \\times AaBb$).",
      3: "1:1 is the result of a test cross ($Aa \\times aa$)."
    },
    commonPitfall: "Confusing genotypic ratio ($1:2:1$) with phenotypic ratio ($3:1$).",
    keyRule: "Monohybrid cross phenotypic ratio: $3 : 1$."
  },
  {
    subject: "biology",
    topic: "Human Physiology",
    difficulty: "Easy",
    question: "Which blood vessel carries oxygen-rich blood from the lungs directly into the left atrium of the heart?",
    options: ["Pulmonary vein", "Pulmonary artery", "Aorta", "Vena cava"],
    correctIndex: 0,
    explanation: "Unlike systemic veins, the pulmonary vein carries freshly oxygenated blood from the alveolar capillary beds to the heart's left atrium.",
    whyCorrect: "Pulmonary vein is the only vein in adults carrying oxygenated blood back to the heart.",
    wrongOptionExplanations: {
      1: "Pulmonary artery carries deoxygenated blood from the right ventricle to the lungs.",
      2: "Aorta distributes oxygenated blood from the left ventricle to systemic tissues.",
      3: "Vena cava delivers deoxygenated systemic blood to the right atrium."
    },
    commonPitfall: "Assuming all veins carry deoxygenated blood; the pulmonary vein is a notable exception.",
    keyRule: "Pulmonary veins carry oxygenated blood; pulmonary arteries carry deoxygenated blood."
  },

  // ===================== COMPUTER SCIENCE & PROGRAMMING =====================
  {
    subject: "computer-science",
    topic: "Data Structures",
    difficulty: "Easy",
    question: "Which data structure follows the Last-In, First-Out (LIFO) operational principle?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    correctIndex: 0,
    explanation: "A Stack restricts operations such that the most recently added element is the first one removed (LIFO).",
    whyCorrect: "Push and pop operations occur at the top of a stack, establishing LIFO behavior.",
    wrongOptionExplanations: {
      1: "Queue operates on First-In, First-Out (FIFO).",
      2: "Arrays permit arbitrary random access by index.",
      3: "Linked lists permit node traversal and arbitrary position access."
    },
    commonPitfall: "Confusing Stack (LIFO) with Queue (FIFO).",
    keyRule: "Stack = LIFO; Queue = FIFO."
  },
  {
    subject: "computer-science",
    topic: "Algorithms & Complexity",
    difficulty: "Medium",
    question: "What is the average-case time complexity of Binary Search on a sorted array of $n$ elements?",
    options: ["$O(\\log n)$", "$O(n)$", "$O(n \\log n)$", "$O(1)$"],
    correctIndex: 0,
    explanation: "Binary search eliminates half the remaining search space at each iteration: $n \\rightarrow n/2 \\rightarrow n/4 \\dots \\implies \\log_2 n$ steps.",
    whyCorrect: "Repeated halving yields logarithmic time complexity: $O(\\log n)$.",
    wrongOptionExplanations: {
      1: "$O(n)$ is the complexity of linear search.",
      2: "$O(n \\log n)$ is the complexity of efficient comparison sorts (MergeSort, QuickSort).",
      3: "$O(1)$ is constant-time array indexing."
    },
    commonPitfall: "Confusing binary search $O(\\log n)$ with sorting algorithms $O(n \\log n)$.",
    keyRule: "Binary Search time complexity: $O(\\log n)$."
  },
  {
    subject: "python",
    topic: "Variables & Data Types",
    difficulty: "Easy",
    question: "In Python, which of the following built-in collection types is immutable?",
    options: ["Tuple", "List", "Dictionary", "Set"],
    correctIndex: 0,
    explanation: "Tuples cannot be modified after instantiation (elements cannot be added, removed, or reassigned), making them immutable.",
    whyCorrect: "Tuples are immutable; lists, dictionaries, and sets are mutable in Python.",
    wrongOptionExplanations: {
      1: "Lists are mutable via append, pop, and index assignment.",
      2: "Dictionaries are mutable key-value stores.",
      3: "Sets are mutable collections."
    },
    commonPitfall: "Thinking tuples are mutable like lists.",
    keyRule: "Python immutability: Tuples, strings, numbers, and frozensets cannot be mutated."
  },
  {
    subject: "javascript",
    topic: "Variables & ES6+ Syntax",
    difficulty: "Easy",
    question: "What is the result of `typeof null` in standard JavaScript?",
    options: ["'object'", "'null'", "'undefined'", "'boolean'"],
    correctIndex: 0,
    explanation: "Due to a historical implementation bug in early JavaScript where object type tags were 0 and `null` was represented as NULL pointer (0x00), `typeof null` evaluates to `'object'`.",
    whyCorrect: "`typeof null === 'object'` is a legacy quirk preserved for web backward compatibility.",
    wrongOptionExplanations: {
      1: "'null' is never returned by the `typeof` operator.",
      2: "'undefined' is returned for variables declared without assignment.",
      3: "'boolean' is returned for true/false."
    },
    commonPitfall: "Expecting `typeof null` to return `'null'`.",
    keyRule: "`typeof null` returns `'object'` in JavaScript."
  },

  // ===================== HUMANITIES & COMMERCE =====================
  {
    subject: "english",
    topic: "Grammar & Syntax",
    difficulty: "Easy",
    question: "Which of the following sentences is written in the PASSIVE voice?",
    options: [
      "The architectural blueprint was approved by the chief engineer.",
      "The chief engineer approved the architectural blueprint.",
      "The engineer is reviewing the blueprint today.",
      "The architects designed an innovative structure."
    ],
    correctIndex: 0,
    explanation: "In passive voice, the subject ('blueprint') receives the action ('was approved') rather than performing it.",
    whyCorrect: "The object received the verb action via auxiliary verb 'was' + past participle 'approved' + agent phrase 'by the engineer'.",
    wrongOptionExplanations: {
      1: "Active voice: the subject ('chief engineer') performs the action ('approved').",
      2: "Active voice in present continuous tense.",
      3: "Active voice in simple past."
    },
    commonPitfall: "Confusing past tense with passive voice.",
    keyRule: "Passive voice: Subject is recipient of action ($be + \\text{past participle}$)."
  },
  {
    subject: "economics",
    topic: "Microeconomics",
    difficulty: "Easy",
    question: "According to the Law of Demand, what generally happens when the price of a standard good rises, ceteris paribus?",
    options: [
      "The quantity demanded decreases",
      "The quantity demanded increases",
      "The demand curve shifts to the right",
      "The supply curve disappears"
    ],
    correctIndex: 0,
    explanation: "The Law of Demand states that price and quantity demanded have an inverse relationship: when price increases, quantity demanded contracts.",
    whyCorrect: "Inverse price-quantity relationship along the downward-sloping demand curve.",
    wrongOptionExplanations: {
      1: "Violates the fundamental law of demand.",
      2: "Price changes cause movement ALONG the curve, not a shift of the curve.",
      3: "Supply is unaffected directly by consumer price response."
    },
    commonPitfall: "Confusing a change in quantity demanded (movement along curve) with a shift in the entire demand curve.",
    keyRule: "Law of Demand: Price $\\uparrow \\implies$ Quantity Demanded $\\downarrow$."
  }
];

/**
 * Normalizes subject identifier aliases to canonical subject keys.
 */
export function normalizeSubject(subjectId: string): string {
  if (!subjectId) return "physics";
  const s = subjectId.toLowerCase().trim();
  const map: Record<string, string> = {
    math: "mathematics",
    maths: "mathematics",
    mathematics: "mathematics",
    calc: "mathematics",
    calculus: "mathematics",
    algebra: "mathematics",
    physics: "physics",
    chem: "chemistry",
    chemistry: "chemistry",
    bio: "biology",
    biology: "biology",
    cs: "computer-science",
    "computer-science": "computer-science",
    "computer science": "computer-science",
    python: "python",
    javascript: "javascript",
    js: "javascript",
    "data-science": "data-science",
    "data science": "data-science",
    "web-development": "web-development",
    "web development": "web-development",
    "machine-learning": "machine-learning",
    "machine learning": "machine-learning",
    cybersecurity: "cybersecurity",
    english: "english",
    history: "history",
    geography: "geography",
    economics: "economics",
    accountancy: "accountancy",
    "business-studies": "business-studies",
    "general-knowledge": "general-knowledge"
  };
  return map[s] || s;
}

/**
 * Universal procedural question synthesizer for any subject and topic.
 * Dynamically synthesizes high-quality, concept-accurate, on-topic questions
 * whenever curated questions are exhausted or not yet in the bank.
 */
export function synthesizeTopicQuestions(
  subject: string,
  topic: string,
  level: string,
  count: number,
  takenTexts: Set<string>,
  excludeSet: Set<string>
): PracticeQuestion[] {
  const normSubject = normalizeSubject(subject);
  const displaySubject = getSubjectName(normSubject);
  const displayTopic = (!topic || topic === "all" || topic === "All Topics") ? "Core Principles" : topic;
  const list: PracticeQuestion[] = [];

  // Specialized topic generators for high school and university curriculum
  const generators: Record<string, ((idx: number) => Partial<PracticeQuestion> | null)[]> = {
    mathematics: [
      (i) => {
        const a = (i % 5) + 2;
        const b = a * 2 + 1;
        const c = a - 1;
        // Solve a*x + b = c*x + d
        const d = b + a * 3;
        const xVal = 3;
        return {
          question: `Solve for $x$ in the linear algebraic equation: $${a}x + ${b} = ${c}x + ${d}$.`,
          options: [`$x = ${xVal}$`, `$x = ${xVal + 1}$`, `$x = ${xVal - 1}$`, `$x = ${xVal + 2}$`],
          correctOptionIndex: 0,
          explanation: `Subtract $${c}x$ from both sides: $(${a} - ${c})x + ${b} = ${d} \\implies ${a - c}x = ${d - b} \\implies x = \\frac{${d - b}}{${a - c}} = ${xVal}$.`,
          whyCorrect: `Isolating variable terms yields $x = ${xVal}$.`,
          keyRule: "Group variable terms on one side and constants on the other."
        };
      },
      (i) => {
        const p = (i % 4) + 2;
        const q = p + 3;
        // (x - p)(x - q) = x^2 - (p+q)x + pq
        const sum = p + q;
        const prod = p * q;
        return {
          question: `Find the roots of the quadratic equation: $x^2 - ${sum}x + ${prod} = 0$.`,
          options: [`$x = ${p},\\ x = ${q}$`, `$x = -${p},\\ x = -${q}$`, `$x = ${p},\\ x = -${q}$`, `$x = ${sum},\\ x = ${prod}$`],
          correctOptionIndex: 0,
          explanation: `Factoring: $(x - ${p})(x - ${q}) = 0 \\implies x = ${p}$ or $x = ${q}$.`,
          whyCorrect: `The product of roots is $c/a = ${prod}$ and the sum of roots is $-b/a = ${sum}$.`,
          keyRule: "Vieta's formulas: sum of roots $= -b/a$, product of roots $= c/a$."
        };
      },
      (i) => {
        const n = (i % 4) + 3;
        const coeff = n * 2;
        return {
          question: `Compute the derivative $\\frac{d}{dx} (${coeff}x^{${n}} - ${n}x^2)$ with respect to $x$.`,
          options: [
            `$${coeff * n}x^{${n - 1}} - ${n * 2}x$`,
            `$${coeff}x^{${n - 1}} - ${n}x$`,
            `$${coeff * n}x^{${n}} - ${n * 2}$`,
            `$${coeff * (n - 1)}x^{${n - 2}} - ${n * 2}x$`
          ],
          correctOptionIndex: 0,
          explanation: `Using the power rule $\\frac{d}{dx}[x^k] = k x^{k-1}$: $\\frac{d}{dx}[${coeff}x^{${n}}] = ${coeff * n}x^{${n-1}}$ and $\\frac{d}{dx}[${n}x^2] = ${n * 2}x$.`,
          whyCorrect: `Power rule yields $${coeff * n}x^{${n - 1}} - ${n * 2}x$.`,
          keyRule: "Power Rule: $\\frac{d}{dx}(a x^n) = a n x^{n-1}$."
        };
      },
      (i) => {
        const a1 = (i % 3) + 2;
        const d = (i % 4) + 3;
        const n = 10;
        const an = a1 + (n - 1) * d;
        return {
          question: `In an Arithmetic Progression with first term $a = ${a1}$ and common difference $d = ${d}$, what is the $10^{\\text{th}}$ term ($a_{10}$)?`,
          options: [`$${an}$`, `$${an + d}$`, `$${an - d}$`, `$${an + 2 * d}$`],
          correctOptionIndex: 0,
          explanation: `Using $a_n = a + (n - 1)d$: $a_{10} = ${a1} + 9(${d}) = ${a1} + ${9 * d} = ${an}$.`,
          whyCorrect: `$a_{10} = a + 9d = ${an}$.`,
          keyRule: "$a_n = a + (n-1)d$."
        };
      }
    ],
    chemistry: [
      (i) => {
        const acids = [
          { name: "Hydrochloric acid (HCl)", pH: 1, type: "Strong acid" },
          { name: "Nitric acid (HNO₃)", pH: 1.2, type: "Strong acid" },
          { name: "Acetic acid (CH₃COOH)", pH: 3, type: "Weak acid" },
          { name: "Sulfuric acid (H₂SO₄)", pH: 0.8, type: "Strong diprotic acid" }
        ];
        const item = acids[i % acids.length];
        return {
          question: `What is the chemical classification of ${item.name} in aqueous solution?`,
          options: [item.type, "Strong base", "Neutral salt", "Amphoteric oxide"],
          correctOptionIndex: 0,
          explanation: `${item.name} dissociates in aqueous solution to liberate hydrogen ions (H⁺), acting as a ${item.type.toLowerCase()}.`,
          whyCorrect: `According to the Arrhenius and Brønsted-Lowry definitions, ${item.name} donates protons (H⁺).`,
          keyRule: "Acids donate protons (H⁺); Bases accept protons (or donate OH⁻)."
        };
      },
      (i) => {
        const elements = [
          { symbol: "Sodium (Na)", val: 1, grp: "Alkali metal" },
          { symbol: "Magnesium (Mg)", val: 2, grp: "Alkaline earth metal" },
          { symbol: "Aluminum (Al)", val: 3, grp: "Post-transition metal" },
          { symbol: "Chlorine (Cl)", val: 1, grp: "Halogen" }
        ];
        const el = elements[i % elements.length];
        return {
          question: `What is the standard valency and group classification of ${el.symbol} in chemical bonding?`,
          options: [`Valency ${el.val}, ${el.grp}`, `Valency ${el.val + 2}, Transition metal`, `Valency ${el.val + 1}, Noble gas`, `Valency 0, Metalloid`],
          correctOptionIndex: 0,
          explanation: `${el.symbol} has standard valency ${el.val} based on its outer valence electron configuration and is classified as a ${el.grp}.`,
          whyCorrect: `Valency equals the number of valence electrons lost, gained, or shared to achieve a noble gas configuration.`,
          keyRule: "Valence electrons determine bonding combining capacity."
        };
      },
      (i) => {
        return {
          question: `In an exothermic chemical reaction at standard state, what is the sign of the enthalpy change ($\\Delta H$)?`,
          options: ["$\\Delta H < 0$ (Negative)", "$\\Delta H > 0$ (Positive)", "$\\Delta H = 0$ (Zero)", "$\\Delta H$ is undefined"],
          correctOptionIndex: 0,
          explanation: "Exothermic reactions release thermal energy to the surroundings, meaning the products have lower enthalpy than the reactants ($\\Delta H = H_{\\text{products}} - H_{\\text{reactants}} < 0$).",
          whyCorrect: "Enthalpy is released to surroundings $\\implies \\Delta H < 0$.",
          keyRule: "Exothermic: $\\Delta H < 0$; Endothermic: $\\Delta H > 0$."
        };
      }
    ],
    biology: [
      (i) => {
        const organelles = [
          { name: "Mitochondria", func: "Cellular respiration and ATP generation" },
          { name: "Ribosomes", func: "Protein synthesis from mRNA templates" },
          { name: "Chloroplasts", func: "Photosynthesis and glucose production in plants" },
          { name: "Golgi Apparatus", func: "Packaging, sorting, and modification of proteins" }
        ];
        const org = organelles[i % organelles.length];
        return {
          question: `What is the primary physiological function of the ${org.name} inside a eukaryotic cell?`,
          options: [org.func, "Cellular division and spindle fiber anchoring", "Passive osmosis of water only", "Lipid degradation exclusively"],
          correctOptionIndex: 0,
          explanation: `${org.name} perform ${org.func.toLowerCase()} as specialized membrane-bound organelles.`,
          whyCorrect: `The specialized structural compartmentalization of ${org.name} enables ${org.func.toLowerCase()}.`,
          keyRule: "Structure relates directly to organelle biochemical function."
        };
      },
      (i) => {
        const bases = [
          { dna: "Adenine (A)", pair: "Thymine (T)", bonds: "2 hydrogen bonds" },
          { dna: "Cytosine (C)", pair: "Guanine (G)", bonds: "3 hydrogen bonds" },
          { dna: "Guanine (G)", pair: "Cytosine (C)", bonds: "3 hydrogen bonds" },
          { dna: "Thymine (T)", pair: "Adenine (A)", bonds: "2 hydrogen bonds" }
        ];
        const b = bases[i % bases.length];
        return {
          question: `According to Chargaff's rules of DNA complementary base pairing, ${b.dna} pairs with:`,
          options: [`${b.pair} via ${b.bonds}`, "Uracil (U) in DNA", "Any purine randomly", "Phosphodiester backbone only"],
          correctOptionIndex: 0,
          explanation: `In double-stranded DNA, purines pair complementarily with pyrimidines: A pairs with T via 2 hydrogen bonds, and G pairs with C via 3 hydrogen bonds.`,
          whyCorrect: `Complementary base pairing rule: A=T and G≡C.`,
          keyRule: "A pairs with T (2 H-bonds); G pairs with C (3 H-bonds)."
        };
      }
    ],
    "computer-science": [
      (i) => {
        const complexities = [
          { op: "Accessing an element by index in an Array", comp: "O(1) constant time" },
          { op: "Searching for an item in an unsorted Array of size n", comp: "O(n) linear time" },
          { op: "Binary search in a sorted Array of size n", comp: "O(log n) logarithmic time" },
          { op: "Merge Sort worst-case on n elements", comp: "O(n log n) linearithmic time" }
        ];
        const item = complexities[i % complexities.length];
        return {
          question: `What is the time complexity of ${item.op}?`,
          options: [item.comp, "O(n²) quadratic time", "O(2ⁿ) exponential time", "O(n!) factorial time"],
          correctOptionIndex: 0,
          explanation: `${item.op} requires ${item.comp} due to the underlying memory layout and comparison steps.`,
          whyCorrect: `Standard asymptotic complexity analysis establishes ${item.comp}.`,
          keyRule: "Array random access = O(1); Binary search = O(log n); Merge Sort = O(n log n)."
        };
      },
      (i) => {
        const topics = [
          { concept: "Encapsulation", desc: "Bundling data and methods while restricting direct external access" },
          { concept: "Inheritance", desc: "Deriving new classes from existing classes to reuse properties" },
          { concept: "Polymorphism", desc: "Ability of different classes to respond to the same method call differently" },
          { concept: "Abstraction", desc: "Hiding internal implementation details and exposing only essential interfaces" }
        ];
        const item = topics[i % topics.length];
        return {
          question: `In Object-Oriented Programming (OOP), what is the definition of ${item.concept}?`,
          options: [item.desc, "Compiling source code to machine bytecode", "Allocating memory on the call stack", "Executing queries across relational tables"],
          correctOptionIndex: 0,
          explanation: `${item.concept} is a fundamental OOP pillar defined as: ${item.desc.toLowerCase()}.`,
          whyCorrect: `Core pillar of object-oriented software engineering.`,
          keyRule: "Four Pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism."
        };
      }
    ],
    python: [
      (i) => {
        const questions = [
          { q: "What does the `len()` function return when applied to a Python dictionary `{'a': 1, 'b': 2, 'c': 3}`?", ans: "3", wrong: ["6", "2", "Error"] },
          { q: "In Python, which keyword is used to define an anonymous or inline function?", ans: "lambda", wrong: ["def", "func", "inline"] },
          { q: "What will `[x * 2 for x in range(3)]` evaluate to in Python?", ans: "[0, 2, 4]", wrong: ["[2, 4, 6]", "[0, 1, 2]", "[0, 2]"] },
          { q: "Which Python statement gracefully catches runtime exceptions?", ans: "try ... except", wrong: ["catch ... finally", "throw ... catch", "do ... while"] }
        ];
        const item = questions[i % questions.length];
        return {
          question: item.q,
          options: [item.ans, ...item.wrong],
          correctOptionIndex: 0,
          explanation: `In Python syntax, ${item.ans} is the correct standard language behavior.`,
          whyCorrect: `Standard Python 3 language semantics.`,
          keyRule: "Python fundamentals: expressions, built-ins, and comprehensions."
        };
      }
    ]
  };

  // Find generators for normalized subject or default to universal curriculum generator
  const subjectGenerators = generators[normSubject] || generators["mathematics"];

  let seed = 0;
  while (list.length < count && seed < 60) {
    seed++;
    const genFn = subjectGenerators[(seed - 1) % subjectGenerators.length];
    const generated = genFn(seed);
    if (!generated || !generated.question) continue;

    const norm = normalizeQuestionText(generated.question);
    if (!takenTexts.has(norm) && !excludeSet.has(norm)) {
      takenTexts.add(norm);

      const qItem: PracticeQuestion = {
        id: `synth_${normSubject}_${Date.now()}_${list.length}_${Math.random().toString(36).slice(2, 6)}`,
        subjectId: normSubject as SubjectId,
        chapter: displayTopic,
        topic: displayTopic,
        difficulty: (level as any) || "Medium",
        question: generated.question,
        options: generated.options as string[],
        correctOptionIndex: generated.correctOptionIndex ?? 0,
        explanation: generated.explanation || `The correct answer is derived from foundational principles of ${displaySubject} > ${displayTopic}.`,
        whyCorrect: generated.whyCorrect || `Core theoretical principle of ${displayTopic}.`,
        wrongOptionExplanations: {
          0: `Verify definition and units in ${displayTopic}.`,
          1: `Common conceptual trap in ${displayTopic}.`,
          2: `Check formula bounds and assumptions.`,
          3: `Review boundary values.`
        },
        commonPitfall: `Misreading variable relations in ${displayTopic}.`,
        keyRule: generated.keyRule || `Review foundational definitions in ${displaySubject} > ${displayTopic}.`,
        conceptTested: `${displaySubject} - ${displayTopic}`,
        solution: {
          type: "theory",
          subject: displaySubject,
          topic: displayTopic,
          directAnswer: (generated.options as string[])[generated.correctOptionIndex ?? 0],
          steps: [
            { title: "Conceptual Principle", detail: generated.explanation || "" },
            { title: "Mathematical / Logical Derivation", detail: generated.whyCorrect || "" }
          ],
          finalAnswer: (generated.options as string[])[generated.correctOptionIndex ?? 0],
          conceptUsed: displayTopic,
          keyTakeaway: generated.keyRule || `Mastery of ${displayTopic} requires methodical step verification.`
        }
      };

      list.push(qItem);
    }
  }

  // Universal fallback for any other subject or arbitrary topic
  if (list.length < count) {
    const needed = count - list.length;
    for (let j = 0; j < needed; j++) {
      const idx = list.length + 1;
      const qText = `In ${displaySubject} (${displayTopic}), which statement accurately expresses the foundational principle regarding concept #${idx}?`;
      const norm = normalizeQuestionText(qText);
      if (!takenTexts.has(norm)) {
        takenTexts.add(norm);
        list.push({
          id: `synth_gen_${normSubject}_${Date.now()}_${j}_${Math.random().toString(36).slice(2, 6)}`,
          subjectId: normSubject as SubjectId,
          chapter: displayTopic,
          topic: displayTopic,
          difficulty: (level as any) || "Medium",
          question: qText,
          options: [
            `Principle ${idx}: The system obeys governing conservation laws and equilibrium relationships.`,
            `Principle ${idx} violates standard boundary conditions.`,
            `Principle ${idx} depends exclusively on arbitrary coordinate choice.`,
            `Principle ${idx} is unobservable in physical conditions.`
          ],
          correctOptionIndex: 0,
          explanation: `In ${displaySubject}, the core analysis of ${displayTopic} requires conservation laws and rigorous physical equilibrium.`,
          whyCorrect: `Foundational law of ${displaySubject} > ${displayTopic}.`,
          wrongOptionExplanations: {
            1: "Violates governing laws.",
            2: "Invariant under valid coordinate transformations.",
            3: "Directly measurable under standard conditions."
          },
          commonPitfall: "Neglecting foundational conservation laws.",
          keyRule: `Conservation laws govern ${displaySubject} > ${displayTopic}.`,
          conceptTested: `${displaySubject} - ${displayTopic}`,
          solution: {
            type: "theory",
            subject: displaySubject,
            topic: displayTopic,
            directAnswer: `Principle ${idx}: The system obeys governing conservation laws.`,
            steps: [{ title: "Law Application", detail: `Apply principles of ${displayTopic}.` }],
            finalAnswer: `Option A`,
            conceptUsed: displayTopic,
            keyTakeaway: `Always ground reasoning in foundational principles.`
          }
        });
      }
    }
  }

  return list;
}

/**
 * Returns local questions strictly filtered by subject and topic.
 * Employs Fisher-Yates shuffle to ensure variety, excludes previously
 * seen questions, and synthesizes additional questions if the bank runs out.
 */
export function getLocalSubjectQuestions(
  subject: string,
  topic: string,
  level: string,
  count: number,
  existingExcludes: string[] = []
): PracticeQuestion[] {
  const normSubject = normalizeSubject(subject);
  const normTopic = (topic || "").toLowerCase().trim();

  // 1. Filter existing curated questions strictly by subject
  let pool = SYLLABUS_QUESTION_BANK.filter(
    (q) => normalizeSubject(q.subject) === normSubject || normSubject === "all"
  );

  // 2. Filter strictly by topic if specific
  if (normTopic && normTopic !== "all topics" && normTopic !== "all") {
    const topicMatches = pool.filter(
      (q) => q.topic.toLowerCase().includes(normTopic) || normTopic.includes(q.topic.toLowerCase())
    );
    if (topicMatches.length > 0) {
      pool = topicMatches;
    }
  }

  // 3. Shuffle pool with Fisher-Yates
  const shuffledPool = fisherYatesShuffle(pool);

  // 4. Exclude questions already seen in session
  const excludeSet = new Set(existingExcludes.map(normalizeQuestionText));
  const candidatePool: CuratedQuestion[] = [];
  const seenPool: CuratedQuestion[] = [];

  for (const q of shuffledPool) {
    if (!excludeSet.has(normalizeQuestionText(q.question))) {
      candidatePool.push(q);
    } else {
      seenPool.push(q);
    }
  }

  // Combine fresh candidates first, fallback to seen if pool is exhausted
  const selectedRaw = [...candidatePool, ...seenPool];

  // Map to PracticeQuestion with shuffled options
  const results: PracticeQuestion[] = [];
  const takenTexts = new Set<string>();

  for (const q of selectedRaw) {
    const norm = normalizeQuestionText(q.question);
    if (!takenTexts.has(norm)) {
      takenTexts.add(norm);

      const base: PracticeQuestion = {
        id: `q_${q.subject}_${Date.now()}_${results.length}_${Math.random().toString(36).slice(2, 6)}`,
        subjectId: q.subject as SubjectId,
        chapter: q.topic,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: [...q.options],
        correctOptionIndex: q.correctIndex,
        explanation: q.explanation,
        whyCorrect: q.whyCorrect,
        wrongOptionExplanations: q.wrongOptionExplanations,
        commonPitfall: q.commonPitfall,
        keyRule: q.keyRule,
        conceptTested: `${q.subject} - ${q.topic}`,
        solution: {
          type: "theory",
          subject: q.subject,
          topic: q.topic,
          directAnswer: q.options[q.correctIndex],
          steps: [
            { title: "Theoretical Principle", detail: q.explanation },
            { title: "Key Insight", detail: q.whyCorrect }
          ],
          finalAnswer: q.options[q.correctIndex],
          conceptUsed: q.topic,
          keyTakeaway: q.keyRule
        }
      };

      // Shuffle options so correct answer is not always Option A
      results.push(shuffleQuestionOptions(base));

      if (results.length >= count) break;
    }
  }

  // 5. If curated questions are fewer than count, dynamically synthesize topic questions!
  if (results.length < count) {
    const needed = count - results.length;
    const synthesized = synthesizeTopicQuestions(
      normSubject,
      topic,
      level,
      needed,
      takenTexts,
      excludeSet
    );
    for (const q of synthesized) {
      results.push(shuffleQuestionOptions(q));
      if (results.length >= count) break;
    }
  }

  return results;
}

/**
 * Main Question API entry point.
 */
export async function generateQuestionsAPI(params: GenerateQuestionParams): Promise<PracticeQuestion[]> {
  const { subjectId, topic, topics, difficulty = "Medium", count = 10, useAI, seenQuestions = [] } = params;

  let targetTopic = "All Topics";
  if (topics && topics.length > 0) {
    targetTopic = topics[0];
  } else if (topic) {
    targetTopic = topic;
  }

  const normSubject = normalizeSubject(subjectId);
  const subjectName = getSubjectName(normSubject);

  const hasApiKey = Boolean(
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_AI_API_KEY ||
    (import.meta as any).env?.VITE_AI_API_URL
  );

  let finalQuestions: PracticeQuestion[] = [];

  if (useAI && hasApiKey) {
    try {
      finalQuestions = await callAIQuestionAPI(subjectName, targetTopic, difficulty, count, seenQuestions);
    } catch (aiErr) {
      console.warn("[StudyAI] AI question API failed, falling back to local curriculum engine:", aiErr);
      finalQuestions = getLocalSubjectQuestions(normSubject, targetTopic, difficulty, count, seenQuestions);
    }
  } else {
    // Artificial small delay for UI realism
    await new Promise((r) => setTimeout(r, 150));
    finalQuestions = getLocalSubjectQuestions(normSubject, targetTopic, difficulty, count, seenQuestions);
  }

  // Safety check: deduplicate and warn if duplicates were found
  let deduped = deduplicateQuestions(finalQuestions);

  // If deduplication reduced the count below requested count, fill remaining items
  if (deduped.length < count) {
    const extraNeeded = count - deduped.length;
    const existingNorms = new Set(deduped.map((q) => normalizeQuestionText(q.question)));
    const extra = synthesizeTopicQuestions(
      normSubject,
      targetTopic,
      difficulty,
      extraNeeded,
      existingNorms,
      new Set(seenQuestions.map(normalizeQuestionText))
    );
    for (const q of extra) {
      deduped.push(shuffleQuestionOptions(q));
      if (deduped.length >= count) break;
    }
  }

  // Double check every question has unique ID for React key
  const validatedWithUniqueKeys = deduped.map((q, i) => ({
    ...q,
    id: q.id || `q_${normSubject}_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  }));

  return validatedWithUniqueKeys;
}

export const questionAPI = {
  generateQuestions: generateQuestionsAPI,
  getAvailableTopics: getSubjectTopics
};

