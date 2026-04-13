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
const data = chalk.hex("#00BFFF"); // Custom blue color for console logs

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
    await.signalRef.unref(); // Clean up the signal handler
    process.exit(0); // Exit the process
  });

  let answers = await inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: message("What is your name?"),
      default: "John",
      transformer: (input) => {
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
      name: "phone",
      type: "input",
      message: message("What is your phone number?"),
      validate: (value) => {
        const pass = value.match(
          /^([01])?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?)(?:\d+)?)?$/i,
        );
        if (pass) {
          return true;
        } else {
          return warning(
            "Please enter a valid phone number, Use backspace to clear the terminal and try again.",
          );
        }
      },
    },
    {
      name: "toBeDelivered",
      type: "list",
      prefix: "📞",
      message: message("Is this for delivery?"),
      default: false,
      choices: [
        { name: "Yes 👍", value: true },
        { name: "No 👎", value: false },
      ],
    },
    {
      type: "list",
      name: "pizza-amount",
      message: message("What size pizza do you want?"),
      choices: ["Large", "Medium", "Small"],
      filter(val) {
        return val.toLowerCase();
      },
    },
    {
      name: "pizza-quantity",
      type: "input",
      message: message("How many do you need?"),
      validate(val) {
        const valid = !Number.isNaN(Number.parseFloat(val));
        return (
          valid ||
          "Please enter a number, use the backspace key to clear the terminal and try again."
        );
      },
    },
    {
      name: "wants_pizza",
      type: "list",
      prefix: "🍕", // Add a pizza emoji prefix for the pizza offer
      message: message("Do you want free pizza?"),
      choices: [
        { name: answer("Yes!"), value: true },
        { name: warning("No"), value: false },
      ],
    },
  ]);

  if (!answers.wants_pizza) {
    const { confirm_answer } = await inquirer.prompt([
      {
        name: "confirm_answer",
        type: "list",
        prefix: "❓", // Add a question mark emoji prefix for the confirmation
        message: confirm("Are you sure you don't want free pizza?"),
        choices: [
          { name: answer("Yes, I am sure!"), value: true },
          { name: error("No, let me have pizza!"), value: false },
        ],
      },
    ]);
    if (!confirm_answer) {
      // User changed mind, wants pizza after all
      answers.wants_pizza = true;
    } else {
      // User is sure, skip pizza questions
      console.log(data(`Hi, ${answers.name} ${answers.last_name}!`));
      console.log(data(`Your password is ${answers.password}`));
      console.log(data("No pizza for you!"));
      console.log(
        data(
          "You can change your mind and order pizza at any time by running this program again.",
        ),
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
        prefix: "🍕",
        message: message("What type of crust do you want for your pizza?"),
        choices: [
          { name: chalk.red("Thin Crust"), value: "Thin Crust" },
          { name: chalk.green("Stuffed Crust"), value: "Stuffed Crust" },
          { name: chalk.blue("Deep Dish"), value: "Deep Dish" },
          { name: chalk.magenta("Hand Tossed"), value: "Hand Tossed" },
          new inquirer.Separator(), // Add a separator for better visual organization
          { name: chalk.yellow("Gluten Free"), value: "Gluten Free" },
        ],
      },
      {
        name: "pizza_toppings",
        type: "checkbox",
        prefix: "🍕",
        message: message("What toppings do you want on your pizza?"),
        choices: [
          { name: chalk.red("Pepperoni"), value: "Pepperoni" },
          { name: chalk.yellow("Mushrooms"), value: "Mushrooms" },
          { name: chalk.cyan("Onions"), value: "Onions" },
          { name: chalk.magenta("Sausage"), value: "Sausage" },
          { name: chalk.white("Bacon"), value: "Bacon" },
          { name: chalk.magenta("Extra cheese"), value: "Extra cheese" },
        ],
      },
      {
        name: "confirm_pizza",
        type: "expand",
        prefix: "❓",
        message: confirm("Do you confirm your pizza order?"),
        choices: [
          { key: "y", name: "Redo?", value: "overwrite" },
          { key: "a", name: "No I want to start over", value: "overwrite_all" },
          { key: "d", name: "Yes, I confirm my order!", value: "confirm" },
          new inquirer.Separator(),
          { key: "c", name: "Cancel order", value: "cancel" },
          { key: "x", name: "Call the store", value: "call" },
        ],
      },
    ]);
    signalRef.unref();
    answers = { ...answers, ...pizzaAnswers };
    console.log(data(`Hi, ${answers.name} ${answers.last_name}!`));
    console.log(data(`Your password is ${answers.password}`));
    console.log(data("Pizza is on the way!"));
    if (answers.pizza_toppings && answers.pizza_toppings.length > 0) {
      console.log(
        data(
          `You ordered a ${answers.pizza_crust} pizza with the following toppings: ${answers.pizza_toppings.join(", ")}.`,
        ),
      );
    } else {
      console.log(
        data(`You ordered a ${answers.pizza_crust} pizza with no toppings.`),
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
