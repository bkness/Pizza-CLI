const inquirer = require("inquirer");
const fs = require("fs");
const { generateMarkdown } = require("./utils/generateMarkdown.js");
const SignalRef = require("./signalref.js"); // << Make sure the path matches
const chalk = require("chalk");

const error = chalk.bold.red; // Red color for errors
const warning = chalk.hex("#FFA500"); // Orange color for warnings
const message = chalk.greenBright; // Green color for messages
const confirm = chalk.yellowBright.underline; // Yellow color for confirmations
const password = chalk.bold.magentaBright.underline;
const customChalk = new chalk.Instance({ level: 2 }); // Create a new chalk instance for custom colors
const answer = customChalk.bold.ansi256(56); // Custom green color for answers

const toppingArray = [
  "Pepperoni",
  "Mushrooms",
  "Onions",
  "Sausage",
  "Bacon",
  "Extra cheese",
];

async function main() {
  // Ctrl+C will print a friendly message during any inquirer prompt, thanks to SignalRef!
  //See https://github.com/SBoudrias/Inquirer.js/issues/293#issuecomment-1151843211
  const signalRef = new SignalRef("SIGINT", () => {
    console.log(warning("\nGracefully shutting down..."));
    signalRef.unref(); // Clean up the signal handler
    process.exit(0); // Exit the process
  });

  // Step 1: Basic info and pizza offer
  let answers = await inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: message("What is your name?"),
      // transformer styles the visible typed text in the prompt UI (not the returned value)
      transformer: (input) => {
        // flags.pointer, flags.isFinal are available depending on inquirer version
        return answer(input);
      },
    },
    {
      name: "last_name",
      type: "input",
      message: message("What is your last name?"),
      transformer: (input) => {
        return answer(input);
      },
    },
    {
      name: "password",
      type: "password",
      prefix: "🔒", // Add a lock emoji prefix for the password prompt
      message: password("Enter a password:"),
      mask: chalk.grey("*"), // Mask the password input with asterisks
    },
    {
      name: "wants_pizza",
      type: "confirm",
      prefix: "🍕", // Add a pizza emoji prefix for the pizza offer
      message: message("Do you want free pizza?"),
    },
  ]);

  // Step 2: If user says no, confirm
  if (!answers.wants_pizza) {
    const { confirm_answer } = await inquirer.prompt([
      {
        name: "confirm_answer",
        type: "list",
        message: confirm("Are you sure you don't want free pizza?"),
        choices: [
          { name: confirm("Yes, I am sure!"), value: true },
          { name: warning("No, let me have pizza!"), value: false },
        ],
      },
    ]);
    if (!confirm_answer) {
      // User changed mind, wants pizza after all
      answers.wants_pizza = true;
    } else {
      // User is sure, skip pizza questions
      console.log(`Hi, ${answers.name} ${answers.last_name}!`);
      console.log(`Your password is ${answers.password}`);
      console.log("No pizza for you!");
      console.log(
        "You can change your mind and order pizza at any time by running this program again.",
      );
      const markdown = generateMarkdown(answers);
      fs.writeFileSync("output.md", markdown);
      await signalRef.unref(); // Clean up the signal handler since we're done with prompts
      process.exit(0);
    }
  }

  // Step 3: Ask pizza questions if user wants pizza
  if (answers.wants_pizza) {
    const pizzaAnswers = await inquirer.prompt([
      {
        name: "pizza_crust",
        type: "list",
        message: "What type of crust do you want for your pizza?",
        choices: ["Thin Crust", "Stuffed Crust", "Deep Dish", "Hand Tossed"],
      },
      {
        name: "pizza_toppings",
        type: "checkbox",
        message: "What toppings do you want on your pizza?",
        choices: toppingArray,
      },
    ]);
    signalRef.unref(); // Clean up the signal handler since we're done with prompts
    answers = { ...answers, ...pizzaAnswers };
    console.log(`Hi, ${answers.name} ${answers.last_name}!`);
    console.log(`Your password is ${answers.password}`);
    console.log("Pizza is on the way!");
    if (answers.pizza_toppings && answers.pizza_toppings.length > 0) {
      console.log(
        `You ordered a ${answers.pizza_crust} pizza with the following toppings: ${answers.pizza_toppings.join(", ")}.`,
      );
    } else {
      console.log(
        `You ordered a ${answers.pizza_crust} pizza with no toppings.`,
      );
    }
    const markdown = generateMarkdown(answers);
    fs.writeFileSync("output.md", markdown);
  }
}

main().catch((err) => {
  console.error(error("An error occurred: "), warning(err));
  process.exit(1);
});
