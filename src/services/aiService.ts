import { ChatMessage, DetailedSolution } from "@/types";
import { solveQuestionText } from "./solverService";

/**
 * AI Tutoring Service
 * Implements conversational educational tutoring following the system prompt rules.
 */
export async function sendTutorMessage(
  userQuery: string,
  subject: string = "Mathematics",
  actionType?: "explain_simply" | "step_by_step" | "example" | "practice" | "summarize",
  attachments?: { images?: string[]; files?: { name: string; size: string; type: string }[] }
): Promise<ChatMessage> {
  // Simulate AI streaming/thinking
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const queryLower = userQuery.toLowerCase();
  let responseContent = "";
  let solution: DetailedSolution | undefined = undefined;

  if (actionType === "explain_simply" || queryLower.includes("explain simply") || queryLower.includes("eli5")) {
    responseContent = `### Explained Simply 💡\n\nThink of this concept like everyday physics or shopping: \n\nWhen we talk about **${userQuery}**, imagine you have a fixed budget or a balance scale. Every time you push or pull one side, the opposite side reacts proportionally.\n\n- **The Big Idea:** Instead of memorizing complicated formulas, remember the core balance.\n- **Real Life Analogy:** When you pedal a bicycle harder (applying Force), the bike accelerates forward ($F = ma$). If you carry a heavy backpack (more Mass), you need even more pedal power to get the same speed!\n\n**Key Takeaway:** Real-world intuition makes the math easy to remember.`;
  } else if (actionType === "example" || queryLower.includes("give an example") || queryLower.includes("example")) {
    responseContent = `### Concrete Practical Example 🎯\n\nLet's apply this with actual numbers:\n\n**Scenario:** Suppose a student is investigating ${userQuery}.\n\n1. **Setup:** Consider an object with mass $m = 4\\text{ kg}$ experiencing a net force $F = 20\\text{ N}$.\n2. **Calculation:** Using the fundamental relation $a = \\frac{F}{m}$:\n\n$$a = \\frac{20\\text{ N}}{4\\text{ kg}} = 5\\text{ m/s}^2$$\n\n3. **Interpretation:** Every second that passes, the object's speed increases by $5\\text{ meters per second}$.\n\nWould you like to try another example with different conditions?`;
  } else if (actionType === "practice" || queryLower.includes("practice questions")) {
    responseContent = `### Practice Questions Set 📝\n\nHere are 3 tailored practice questions to test your grasp on **${userQuery}**:\n\n1. **Question 1 (Foundational):** What is the core condition required for this principle to hold true?\n2. **Question 2 (Calculation):** If the input variable is doubled while keeping other factors constant, what happens to the output?\n3. **Question 3 (Exam Challenge):** Solve for the boundary case where the denominator approaches zero.\n\n*Type your answer to Question 1 below, and I'll grade it step-by-step!*`;
  } else if (actionType === "summarize" || queryLower.includes("summarize")) {
    responseContent = `### Summary & Cheat-Sheet 📋\n\nHere is your high-yield summary of **${userQuery}**:\n\n* **Core Definition:** The fundamental governing relationship in ${subject}.\n* **Key Equation:**\n\n$$\\text{Primary Equation: } f(x) = L$$\n\n* **Top 3 Rules to Remember:**\n  1. Always check your signs before expanding brackets.\n  2. Verify that units match on both sides of the equation.\n  3. Look for symmetries or cancellations before calculating.\n* **Common Pitfall:** Don't divide by zero without taking limits first!`;
  } else {
    // Generate full step-by-step educational solution
    solution = await solveQuestionText(userQuery, subject);
    responseContent = `I have analyzed your question in **${solution.subject}** (${solution.topic}). Below is the full step-by-step pedagogical explanation:`;
  }

  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    role: "assistant",
    content: responseContent,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    subject,
    solution,
    actionType,
  };

  return message;
}
