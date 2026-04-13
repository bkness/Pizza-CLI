🍕 Node.js Pizza CLI – Interactive Inquirer Example with Robust Ctrl+C Handling

This CLI app lets you order a pizza in style—all via your terminal!

- Interactive prompts (using [`inquirer`](https://www.npmjs.com/package/inquirer))
- Colorful questions and answers (via [chalk](https://www.npmjs.com/package/chalk))
- Advanced **Ctrl+C handling** — see a friendly exit message no matter when you hit Ctrl+C during prompts (using the [`SignalRef`](https://github.com/SBoudrias/Inquirer.js/issues/293#issuecomment-1151843211) workaround)
- Example of custom password masking, emoji prefixes, colored output, and more

---

## Features

- Custom colored prompts for great CLI UX
- Password masking with emoji
- Clean exit with a message on **any** Ctrl+C (even mid-question!)
- Modular code you can adapt to any inquirer CLI
- Good basis for any Node.js prompt tool

---

## Usage

```sh
npm install
node index.js
```

You’ll be guided through:

- Entering your name
- Entering your last name
- Choosing a pizza
- Customizing topping and crust type

**Press Ctrl+C at any point** to see a friendly exit message and a clean shutdown.

---

## Project Structure

```
index.js         # Main CLI code (with colored prompts, password mask, etc)
signalref.js     # SignalRef class for robust SIGINT (Ctrl+C) handling in inquirer
utils/
  generateMarkdown.js
  ...
README.md
package.json
```

---

## Ctrl+C Handling

> **NOTE:**  
> By default, inquirer/Node does not always allow you to show a custom message on Ctrl+C due to how readline handles signals.
>
> This project uses [SignalRef](https://github.com/SBoudrias/Inquirer.js/issues/293#issuecomment-1151843211), which keeps the event loop alive while inquirer is busy, so your Ctrl+C handler reliably displays your goodbye message **every time**.
>
> Try it—start a question, hit Ctrl+C. Enjoy the custom exit message!

---

## Colored Prompts and Output

- See `index.js` for how to color **prompt questions, messages, and CLI output** using [chalk](https://www.npmjs.com/package/chalk)
- _Note: you can’t color `[Y/n]` in default confirm prompts, but you can color list choices or your output after the prompt._

---

## Credits

- [inquirer](https://www.npmjs.com/package/inquirer) for the interactive CLI
- [chalk](https://www.npmjs.com/package/chalk) for colors
- [SignalRef GitHub workaround](https://github.com/SBoudrias/Inquirer.js/issues/293#issuecomment-1151843211) for proper Ctrl+C handling with inquirer

---

## Example Run

```text
What is your name? John
What is your last name? Doe
🔒 Enter a password: ******
🍕 Do you want free pizza? Yes
What type of crust do you want for your pizza? Hand Tossed
What toppings do you want on your pizza? Cheese, Bacon

Hi, John Doe!
Your password is hunter2
Pizza is on the way!
You ordered a Hand Tossed pizza with the following toppings: Cheese, Bacon.
```

(Ctrl+C anywhere during questions prints:  
`Gracefully shutting down...`)

---

**Happy hacking—and eat your pizza! 🍕**
