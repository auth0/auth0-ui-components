import * as readline from "node:readline/promises"
import { $ } from "execa"

/**
 * Wait for user confirmation before proceeding
 */
export async function confirmWithUser(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await rl.question(`${message} (y/N): `)
  rl.close()

  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes"
}

/**
 * Wait for user input
 */
export async function getInputFromUser(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await rl.question(`${message} `)
  rl.close()

  return answer.toLowerCase()
}

/**
 * Capture temp password for org admin
 */
export async function getPasswordFromUser(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl._writeToOutput = function (stringToWrite) {
    if (rl.stdoutMuted) {
      // mask user input characters
      rl.output.write("*".repeat(stringToWrite.replace(/\r?\n|\u0004/g, "").length));
    } else {
      rl.output.write(stringToWrite);
    }
  }

  // write the prompt unmasked, then enable masking for input
  rl.output.write(`${message} `);
  rl.stdoutMuted = true;

  const answer = await rl.question("");
  rl.stdoutMuted = false;
  rl.output.write("\n");
  rl.close()

  return answer
}