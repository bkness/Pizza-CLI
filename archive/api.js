// Test API function to fetch JSON data from a URL using the https module and return a Promise that resolves with the parsed JSON data or rejects with an error message. This function handles HTTP status codes, network errors, and JSON parsing errors gracefully, making it suitable for use in async/await contexts.
// const https = require("https");

// function fetchJson(url) {
//   return new Promise((resolve, reject) => {
//     https
//       .get(url, (resp) => {
//         let data = "";
//         if (resp.statusCode < 200 || resp.statusCode >= 300) {
//           return reject(
//             new Error(`HTTP Status Code ${resp.statusCode} for URL ${url}`),
//           );
//         }
//         // A chunk of data has been received, so append it to `data`.
//         resp.on(`data`, (chunk) => {
//           data += chunk;
//         });

//         // The whole response has been received, so parse the result and resolve the promise.
//         resp.on(`end`, () => {
//           try {
//             const jsonData = JSON.parse(data);
//             resolve(jsonData);
//           } catch (err) {
//             reject(new Error(`Failed to parse JSON from URL ${url}`));
//           }
//         });
//       })
//       .on("error", (err) => {
//         reject(new Error(`Request failed for URL ${url}: ${err.message}`));
//       });
//   });
// }

// Initialize an empty string to accumulate the response data.
// Listen for 'data' events to receive chunks of the response and append them to the `data` variable.
// Listen for the 'end' event to know when the entire response has been received, then parse the JSON and resolve the promise.
// Handle HTTP errors by checking the status code and rejecting the promise if it's not in the 200-299 range.
// Handle HTTP errors by checking the status code and rejecting the promise if it's not in the 200-299 range.
// Handle network errors by listening for the 'error' event and rejecting the promise with an appropriate error message.
// Parse JSON safely with a try/catch block to handle any potential parsing errors and reject the promise with a clear error message if parsing fails.
//  Use .catch() to handle errors when calling this function, ensuring that any issues are properly logged or handled in the calling code.
//  Key best practices:
//  Use https for secure requests.
//  Wrap in a Promise for async/await compatibility.
//  Handle HTTP status codes and network errors.
//  Parse JSON safely with try/catch.
//  Use .catch() to handle errors.   thank you for the help! I hope this code is helpful for you. If you have any questions or need further assistance, feel free to ask.   <3
//  Key best practices:
//  Use https for secure requests.
//  Wrap in a Promise for async/await compatibility.
//  Handle HTTP status codes and network errors.
//  Parse JSON safely with try/catch.
//  Use .catch() to handle errors.
