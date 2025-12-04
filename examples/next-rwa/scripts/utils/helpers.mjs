import * as readline from "node:readline/promises"

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
  // use the classic readline (not the promises wrapper) to allow _writeToOutput override
  const { createInterface } = await import("node:readline");

  return await new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        // mask user input characters
        // eslint-disable-next-line no-control-regex
        rl.output.write("*".repeat(stringToWrite.replace(/\r?\n|\u0004/g, "").length));
      } else {
        rl.output.write(stringToWrite);
      }
    };

    // ask the question (this prints the prompt synchronously)
    rl.question(`${message} `, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });

    // enable masking for the subsequent user input
    rl.stdoutMuted = true;
  });
}