const inquirer = require("inquirer");
const fs = require("fs");
const { generateMarkdown } = require("../src/utils/generateMarkdown.js");
const SignalRef = require("../src/utils/signalref.js"); // << Make sure the path matches
const chalk = require("chalk");

const error = chalk.bold.red; // Red color for errors
const warning = chalk.hex("#FFA500"); // Orange color for warnings
const message = chalk.greenBright; // Green color for messages
const confirm = chalk.yellowBright.underline; // Yellow color for confirmations
const password = chalk.bold.magentaBright.underline;
const customChalk = new chalk.Instance({ level: 2 }); // Create a new chalk instance for custom colors
const answer = customChalk.bold.ansi256(56); // Custom green color for answers
const logColor = chalk.hex("#00BFFF"); // Custom blue color for console logs


class Pizza {
  constructor(size, crust, toppings = [], quantity = 1) {
    this.size = size;
    this.crust = crust;
    this.toppings = toppings;
    this.quantity = quantity;
  }

  get price() {
    const base = { large: 14, medium: 11, small: 8 };
    const toppingCost = this.toppings.length * 1.5;
    return (base[this.size] + toppingCost) * this.quantity;
  }

  get label() {
    const tops =
      this.toppings.length > 0 ? this.toppings.join(", ") : "no toppings";
    return `${this.quantity}x ${this.size} ${this.crust} Pizza with ${tops}`;
  }
}

class Order {
  constructor(customer) {
    this.customer = customer;
    this.pizzas = [];
    this.createdAt = new Date();
  }

  addPizza(pizza) {
    this.pizzas.push(pizza);
    return this;
  }

  get total() {
    return this.pizzas.reduce((sum, p) => sum + p.price, 0);
  }

  get receipt() {
    const lines = this.pizzas.map(
      (p, i) => ` ${i + 1}. ${p.label} - $${p.price.toFixed(2)}`,
    );
    return [
      `🍕 Order for ${this.customer.name} ${this.customer.last_name}`,
      `📅 ${this.createdAt.toLocaleDateString()}`,
      ``,
      `💰 Total: $${this.total.toFixed(2)}`,
      this.customer.delivery
        ? `🏎️ Delivery to: ${this.customer.phone}`
        : `🏢 Pickup order`,
    ].join("\n");
  }
}

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
      validate: (value) => {
        if (value.length > 0 && value.match(/^[a-zA-Z]+$/)) {
          return true;
        } else {
          return warning(
            "Please enter a valid name, use the backspace key to clear the terminal and try again.",
          );
        }
      },
      // transformer styles the visible typed text in the prompt UI (not the returned value)
      transformer: (input) => {
        // flags.pointer, flags.isFinal are available depending on inquirer version
        return answer(input);
      },
    },
    {
      name: "last_name",
      type: "input",
      message: message("Last name? (\x1b[3m*Optional\x1b[0m):"), // Italicize the optional note using ANSI escape codes
      validate: (value) => {
        if (value.length === 0 || value.match(/^[a-zA-Z]+$/)) {
          return true;
        } else {
          return warning(
            "Please enter a valid last name, use the backspace key to clear the terminal and try again.",
          );
        }
      },
      transformer: (input) => {
        return answer(input);
      },
    },
    {
      name: "email",
      type: "input",
      message: message("What is your email?"),
      validate: (value) => {
        const pass = value.match(
          /^[a-z0-9.%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i, // Simple email regex for basic validation
        );
        if (pass) {
          return true;
        } else {
          return warning(
            "Please enter a valid email address, use the backspace key to clear the terminal and try again.",
          );
        }
      },
    },
    {
      name: "password",
      type: "password",
      prefix: "🔒", // Add a lock emoji prefix for the password prompt
      message: password("Enter a password:"),
      mask: chalk.grey("*"), // Mask the password input with asterisk
      validate: (value) => {
        if (value.length >= 6) {
          return true;
        } else {
          return warning(
            "Password must be at least 6 characters long, use the backspace key to clear the terminal and try again.",
          );
        }
      },
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
      name: "delivery",
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
      name: "pizza_size",
      message: message("What size pizza do you want?"),
      choices: ["Large", "Medium", "Small"],
      filter(val) {
        return val.toLowerCase();
      },
    },
    {
      name: "pizza_quantity",
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

  // Step 2: If user says no, confirm
  if (!answers.wants_pizza) {
    const { confirm_answer } = await inquirer.prompt([
      {
        name: "confirm_answer",
        type: "list",
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
      console.log(`Hi, ${answers.name} ${answers.last_name}!`);
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
    signalRef.unref(); // Clean up the signal handler since we're done with prompts

    answers = { ...answers, ...pizzaAnswers };

    const pizza = new Pizza(
      answers.pizza_size,
      answers.pizza_crust,
      answers.pizza_toppings,
      Number(answers.pizza_quantity)
    );

    const order = new Order(answers);
    order.addPizza(pizza);

    const { confirm_pizza } = pizzaAnswers;

    if (confirm_pizza === "confirm") {
      console.log(logColor(order.receipt));
      console.log(
        message(`\n✅ Order confirmed! See you soon, ${answers.name}!`),
      );
    } else if (confirm_pizza === "overwrite") {
      console.log(warning("\n🔄 Restarting pizza selection..."));
      signalRef.unref();
      return main();
    } else if (confirm_pizza === "overwrite_all") {
      console.log(warning("\n🔄 Starting completely over..."));
      signalRef.unref();
      return main();
    } else if (confirm_pizza === "cancel") {
      console.log(error("\n Order cancelled. No pizza for you!"));
      process.exit(0);
    } else if (confirm_pizza === "call") {
      console.log(
        message(`\n📞Call us at: ${chalk.bold.white("(555) 867-5309")}`),
      );
      console.log(message("We'll help you sort out your order!"));
    }
  }

  const markdown = generateMarkdown(answers);
  fs.writeFileSync("output.md", markdown);
}

main().catch((err) => {
  console.error(error("An error occurred: "), warning(err));
  process.exit(1);
});
