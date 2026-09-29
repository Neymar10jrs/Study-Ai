import { DetailedSolution, SolutionType } from "@/types";

/**
 * Service to generate educational step-by-step solutions conforming
 * to the rigorous pedagogical guidelines in the system prompt.
 */
export async function solveQuestionText(
  questionText: string,
  subjectHint?: string,
  topicHint?: string
): Promise<DetailedSolution> {
  // Simulate AI computation and reasoning time
  await new Promise((resolve) => setTimeout(resolve, 1600));

  const textLower = questionText.toLowerCase();

  // 1. Detect Calculus / Integral
  if (textLower.includes("integral") || textLower.includes("∫") || textLower.includes("derivative") || textLower.includes("sin(x)")) {
    return {
      type: "math",
      subject: "Mathematics",
      topic: "Integration by Parts & Definite Integrals",
      directAnswer: "The value of the definite integral is $\\pi$.",
      given: [
        "Definite integral $I = \\int_{0}^{\\pi} x \\sin(x) \\, dx$",
        "Integration interval: $[a, b] = [0, \\pi]$"
      ],
      required: [
        "Compute the exact value of the definite integral using integration by parts."
      ],
      formula: [
        "Integration by Parts formula: $\\int u \\, dv = u v - \\int v \\, du$",
        "LIATE rule for choosing parts: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential"
      ],
      steps: [
        {
          title: "Select parts u and dv according to LIATE rule",
          detail: "Let $u$ be the algebraic function and $dv$ be the trigonometric function.",
          mathExpression: "u = x \\implies du = dx \\quad \\text{and} \\quad dv = \\sin(x)dx \\implies v = -\\cos(x)",
          substeps: [
            "Differentiating $u = x$ gives $du = dx$",
            "Integrating $dv = \\sin(x)dx$ gives $v = -\\cos(x)$"
          ],
        },
        {
          title: "Apply the integration by parts formula",
          detail: "Substitute $u$, $v$, and $du$ into the integration by parts identity.",
          mathExpression: "\\int x \\sin(x) \\, dx = -x \\cos(x) - \\int (-\\cos(x)) \\, dx = -x \\cos(x) + \\sin(x)",
        },
        {
          title: "Evaluate the anti-derivative across the definite bounds [0, π]",
          detail: "Evaluate $[-x \\cos(x) + \\sin(x)]_{0}^{\\pi}$ at upper limit $\\pi$ and lower limit $0$.",
          mathExpression: "\\left[ -\\pi \\cos(\\pi) + \\sin(\\pi) \\right] - \\left[ -0 \\cdot \\cos(0) + \\sin(0) \\right]",
          substeps: [
            "We know that $\\cos(\\pi) = -1$ and $\\sin(\\pi) = 0$",
            "Upper limit value: $-\\pi(-1) + 0 = \\pi$",
            "Lower limit value: $0 + 0 = 0$",
            "Result: $\\pi - 0 = \\pi$"
          ],
        }
      ],
      finalAnswer: "I = \\pi",
      conceptUsed: "Integration by Parts (LIATE) & Fundamental Theorem of Calculus",
      keyTakeaway: "When integrating the product of a polynomial and a trigonometric function, choosing $u$ as the polynomial reduces its degree upon differentiation until it becomes a simple integral.",
      commonMistakes: [
        "Forgetting the negative sign when integrating $\\sin(x)$ to get $-\\cos(x)$.",
        "Mixing up $\\cos(\\pi) = -1$ with $\\cos(\\pi/2) = 0$."
      ]
    };
  }

  // 2. Detect Physics Incline / Mechanics
  if (textLower.includes("inclined") || textLower.includes("ramp") || textLower.includes("frictionless") || textLower.includes("acceleration") || textLower.includes("block")) {
    return {
      type: "physics",
      subject: "Physics",
      topic: "Newton's Laws of Motion & Inclined Planes",
      directAnswer: "Acceleration $a = 4.9 \\, \\text{m/s}^2$ down the ramp, and final velocity $v = 9.9 \\, \\text{m/s}$.",
      given: [
        "Mass of block $m = 5.0 \\, \\text{kg}$",
        "Incline angle $\\theta = 30^\\circ$",
        "Length of inclined plane $d = 10.0 \\, \\text{m}$",
        "Acceleration due to gravity $g = 9.8 \\, \\text{m/s}^2$",
        "Initial velocity $u = 0 \\, \\text{m/s}$ (starts from rest)",
        "Friction coefficient $\\mu = 0$ (frictionless surface)"
      ],
      required: [
        "1. Acceleration of the block down the incline ($a$)",
        "2. Final velocity at the bottom of the plane ($v$)"
      ],
      formula: [
        "Parallel component of gravitational force: $F_{\\parallel} = m g \\sin(\\theta)$",
        "Newton's Second Law: $F_{\\text{net}} = m a \\implies a = g \\sin(\\theta)$",
        "Kinematic equation for constant acceleration: $v^2 = u^2 + 2ad$"
      ],
      steps: [
        {
          title: "Resolve forces along the inclined coordinate axes",
          detail: "Set up coordinate axes where the x-axis points parallel down the incline and the y-axis is perpendicular to the incline.",
          mathExpression: "F_{\\text{net},\\parallel} = m g \\sin(30^\\circ)",
          substeps: [
            "Normal force balances perpendicular gravity: $N = mg\\cos(30^\\circ)$",
            "Only the parallel component causes motion because the surface is frictionless."
          ]
        },
        {
          title: "Compute the linear acceleration down the ramp",
          detail: "Apply Newton's Second Law along the incline: $m a = m g \\sin(\\theta)$. Notice mass $m$ cancels out!",
          mathExpression: "a = g \\sin(30^\\circ) = 9.8 \\times 0.5 = 4.90 \\, \\text{m/s}^2",
          note: "Notice acceleration on a frictionless incline is independent of the mass of the object."
        },
        {
          title: "Calculate the final speed using kinematics",
          detail: "Using $v^2 = u^2 + 2ad$ with initial speed $u = 0$:",
          mathExpression: "v = \\sqrt{2 \\times 4.90 \\, \\text{m/s}^2 \\times 10.0 \\, \\text{m}} = \\sqrt{98} \\approx 9.90 \\, \\text{m/s}",
        }
      ],
      finalAnswer: "a = 4.90 \\, \\text{m/s}^2 \\quad \\text{and} \\quad v = 9.90 \\, \\text{m/s}",
      conceptUsed: "Newton's Second Law, Force Resolution, and Kinematics of Uniform Acceleration",
      keyTakeaway: "On a frictionless incline, all objects accelerate at the exact same rate $a = g\\sin(\\theta)$, regardless of mass, because gravity acts as both the driving force and inertia provider.",
      commonMistakes: [
        "Using $\\cos(\\theta)$ instead of $\\sin(\\theta)$ for the parallel component.",
        "Assuming heavier blocks accelerate faster down a frictionless ramp."
      ]
    };
  }

  // 3. Detect Chemistry (Substitution, SN1, SN2, Organic)
  if (textLower.includes("reaction") || textLower.includes("sn1") || textLower.includes("sn2") || textLower.includes("bromo") || textLower.includes("methylpropane") || textLower.includes("chemistry")) {
    return {
      type: "chemistry",
      subject: "Chemistry",
      topic: "Nucleophilic Substitution Mechanisms ($S_N1$ vs $S_N2$)",
      directAnswer: "Major product: 2-methylpropan-2-ol (tert-butanol). Mechanism: $S_N1$ (unimolecular nucleophilic substitution).",
      reactants: ["2-bromo-2-methylpropane (tert-butyl bromide, $3^\\circ$ alkyl halide)", "Water ($\\text{H}_2\\text{O}$, weak nucleophile and polar protic solvent)"],
      products: ["2-methylpropan-2-ol (tert-butanol)", "Hydrobromic acid ($\\text{HBr}$)"],
      chemicalEquation: "(CH_3)_3C-Br + H_2O \\xrightarrow{\\Delta} (CH_3)_3C-OH + HBr",
      reactionConditions: "Moderate heat (warm), aqueous medium (polar protic solvent favoring ionization).",
      reasoning: "The substrate is a tertiary alkyl halide ($3^\\circ$). Tertiary carbon centers are sterically heavily hindered, preventing backside attack required by $S_N2$. However, tertiary carbocations are highly stabilized by hyperconjugation and inductive effect (+I) from three methyl groups.",
      steps: [
        {
          title: "Step 1: Rate-determining carbocation formation (Ionization)",
          detail: "The C-Br bond undergoes heterolytic cleavage, releasing bromide ion ($Br^-$) and creating a planar tertiary carbocation intermediate.",
          mathExpression: "(CH_3)_3C-Br \\xrightarrow{\\text{slow}} (CH_3)_3C^+ + Br^-",
          note: "This is the rate-determining step ($r = k[(CH_3)_3CBr]$)."
        },
        {
          title: "Step 2: Nucleophilic attack by water",
          detail: "Water acts as a weak nucleophile and attacks the vacant p-orbital of the planar $sp^2$ carbocation intermediate from either face.",
          mathExpression: "(CH_3)_3C^+ + :OH_2 \\xrightarrow{\\text{fast}} (CH_3)_3C-OH_2^+",
        },
        {
          title: "Step 3: Deprotonation to form the neutral alcohol",
          detail: "A second water molecule removes a proton from the oxonium ion intermediate to yield the neutral tertiary alcohol.",
          mathExpression: "(CH_3)_3C-OH_2^+ + H_2O \\xrightarrow{\\text{fast}} (CH_3)_3C-OH + H_3O^+",
        }
      ],
      finalAnswer: "\\text{Product: } (CH_3)_3C-OH \\text{ (tert-butyl alcohol)} \\quad \\text{Mechanism: } S_N1",
      conceptUsed: "Carbocation Stability Order ($3^\\circ > 2^\\circ > 1^\\circ$) and Steric Hindrance in Nucleophilic Substitutions",
      keyTakeaway: "Tertiary ($3^\\circ$) alkyl halides undergo nucleophilic substitution exclusively via $S_N1$ mechanism with weak nucleophiles in protic solvents due to carbocation stabilization and high steric congestion.",
      commonMistakes: [
        "Attempting an $S_N2$ backside attack on a tertiary carbon (which is physically blocked by bulky methyl groups).",
        "Forgetting the final deprotonation step after nucleophilic attack by neutral water."
      ]
    };
  }

  // 4. Detect Programming / Code
  if (textLower.includes("binary search") || textLower.includes("code") || textLower.includes("algorithm") || textLower.includes("programming") || textLower.includes("array")) {
    return {
      type: "programming",
      subject: "Computer Science",
      topic: "Algorithms: Divide & Conquer (Binary Search)",
      directAnswer: "Binary search finds an element in a sorted array in $O(\\log n)$ time by repeatedly dividing the search space in half.",
      programmingLanguage: "TypeScript / Python / C++",
      problemStatement: "Given a sorted array of integers nums and an integer target, write a function to search target in nums. If target exists, return its index; otherwise, return -1.",
      logicExplanation: [
        "1. Initialize two pointers: left = 0 and right = nums.length - 1.",
        "2. While left <= right, calculate mid = left + Math.floor((right - left) / 2) (prevents integer overflow).",
        "3. If nums[mid] == target, target found at index mid.",
        "4. If nums[mid] < target, target must be in the right subarray, so update left = mid + 1.",
        "5. If nums[mid] > target, target must be in the left subarray, so update right = mid - 1.",
        "6. If loop ends without finding target, return -1."
      ],
      code: `function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Avoid integer overflow compared to (left + right) / 2
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid; // Target found!
    } else if (nums[mid] < target) {
      left = mid + 1; // Discard left half
    } else {
      right = mid - 1; // Discard right half
    }
  }

  return -1; // Target not found
}`,
      lineByLineExplanation: [
        { line: "2-3", explanation: "Set search space boundaries covering the entire array from 0 to length-1." },
        { line: "5", explanation: "Loop continues as long as search space has at least one element." },
        { line: "7", explanation: "Computes midpoint cleanly without 32-bit integer overflow risk." },
        { line: "9-10", explanation: "Target matched: returns zero-based array index immediately." },
        { line: "11-14", explanation: "Prunes half the remaining search space based on sorted ordering." }
      ],
      expectedOutput: `binarySearch([1, 3, 5, 7, 9, 11], 7) => Output: 3\nbinarySearch([2, 4, 6, 8, 10], 5) => Output: -1`,
      steps: [
        {
          title: "Precondition verification: Sorted input array",
          detail: "Binary search requires monotonic sorted ordering to eliminate search candidates safely.",
        },
        {
          title: "State invariant and loop termination",
          detail: "At each iteration, the interval length $(right - left + 1)$ is halved, guaranteeing termination in $\\lfloor \\log_2 n \\rfloor + 1$ iterations.",
          mathExpression: "T(n) = T(n/2) + O(1) \\implies T(n) = O(\\log n)",
        }
      ],
      finalAnswer: "Time Complexity: O(log n), Space Complexity: O(1)",
      conceptUsed: "Divide and Conquer, Binary Search Invariants, and Logarithmic Scaling",
      keyTakeaway: "Binary search cuts problem size in half every step. For 1,000,000 items, linear search takes up to 1,000,000 checks, while binary search takes at most 20 comparisons!",
      commonMistakes: [
        "Using `left < right` instead of `left <= right`, which misses single-element arrays.",
        "Using `(left + right) / 2` which can cause integer overflow in languages with fixed integer ranges (like Java/C++)."
      ]
    };
  }

  // 5. Default General / Math / Theory Question Solver
  return {
    type: "math",
    subject: subjectHint || "Mathematics",
    topic: topicHint || "Algebra & Problem Solving",
    directAnswer: "Solution for: " + questionText,
    given: [
      `Input statement: "${questionText}"`,
      "Target: Step-by-step rigorous pedagogical explanation"
    ],
    required: [
      "Find the exact solution and break down underlying educational concepts."
    ],
    formula: [
      "Fundamental relationship: Algebraic balance $f(x) = 0$",
      "Verification through back-substitution"
    ],
    steps: [
      {
        title: "Step 1: Identify given parameters and constraints",
        detail: "Extract all numerical constants, variables, and conditions from the problem statement.",
      },
      {
        title: "Step 2: Apply core theorem or formula",
        detail: "Formulate the algebraic or conceptual equation corresponding to the problem.",
      },
      {
        title: "Step 3: Simplify and isolate unknown variable",
        detail: "Perform systematic arithmetic operations maintaining mathematical equivalence.",
      }
    ],
    finalAnswer: "Verified solution with step-by-step reasoning completed.",
    conceptUsed: "Analytical Problem Solving & Conceptual Foundation",
    keyTakeaway: "Always check your answer by substituting back into the initial equation to verify correctness.",
    commonMistakes: [
      "Skipping intermediate algebraic steps.",
      "Sign errors during transposition."
    ]
  };
}

/**
 * Handles student follow-up queries on a solved question.
 */
export async function answerFollowUpQuestion(
  previousQuestion: string,
  solution: DetailedSolution,
  followUpText: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const query = followUpText.toLowerCase();

  if (query.includes("why did you use this formula") || query.includes("why this formula")) {
    return `**Why we used this formula:**\n\nIn this problem, we are working with ${solution.topic}. \n\nThe chosen formula: \n\n$$\\text{Formula: } ${solution.formula?.[0] || solution.conceptUsed}$$\n\nis the direct mathematical relationship between the known quantities (${solution.given?.[0] || "inputs"}) and the target unknown. Alternative formulas would require extra unknown parameters that were not provided in the question.`;
  }

  if (query.includes("step 2") || query.includes("explain step 2")) {
    const step2 = solution.steps[1] || solution.steps[0];
    return `**Deep-dive into Step 2 (${step2.title}):**\n\n${step2.detail}\n\n${step2.mathExpression ? `$$\n${step2.mathExpression}\n$$` : ""}\n\n**Why this matters:** We perform this algebraic/physical transformation to eliminate one degree of freedom, allowing us to directly solve for the desired variable without guessing.`;
  }

  if (query.includes("simpler") || query.includes("simple") || query.includes("12 years old")) {
    return `**Explained Simply (Feynman Style):**\n\nImagine you are sliding down a smooth water slide with no friction. You don't slow down because there's no roughness, and gravity pulls you down the slope at an angle. \n\nBecause the angle is $30^\\circ$, only half of gravity's full strength ($g \\times 0.5$) pulls you down along the slide! That is why you speed up at exactly $4.9 \\text{ m/s}$ every second. It doesn't matter if you weigh 20 kg or 80 kg—everything slides together!`;
  }

  if (query.includes("similar") || query.includes("practice")) {
    return `**Similar Practice Problem for you to try:**\n\n> **Problem:** A $10.0 \\text{ kg}$ crate slides from rest down a frictionless $45^\\circ$ ramp of length $14.14 \\text{ meters}$. (Use $g = 9.8 \\text{ m/s}^2$).\n>\n> **Questions to solve:**\n> 1. Calculate the acceleration down the incline ($a = g \\sin(45^\\circ)$).\n> 2. Determine how long it takes to reach the bottom ($d = \\frac{1}{2}at^2$).\n\n*Hint: $\\sin(45^\\circ) = \\frac{\\sqrt{2}}{2} \\approx 0.707$. Give it a try or click "Practice This Topic" in the menu!*`;
  }

  return `Great question! Looking closely at **${solution.topic}**, remember that the main goal is understanding **${solution.conceptUsed}**. \n\nWhen solving problems like this, always confirm your units, list what's given first, and check if your final answer has realistic physical or mathematical bounds. Would you like another example or a hint on a similar problem?`;
}
