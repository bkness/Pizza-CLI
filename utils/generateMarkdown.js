function generateMarkdown(answers) {
  return `# ${answers.name} ${answers.last_name}
    

  
## Pizza Order
${answers.wants_pizza ? "Pizza is on the way!" : "No pizza for you!"}

${
  answers.wants_pizza
    ? `You ordered a ${answers.pizza_crust} pizza with the following toppings: ${answers.pizza_toppings}.`
    : "You can change your mind and order pizza at any time by running this program again."
}
`;
}

module.exports = { generateMarkdown };
