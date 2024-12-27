// server.js
const app = require("./app");

const PORT = process.env.PORT || 5000;
/**
 * Vercel does not work with a single app.listen server instance.
 * Instead, it requires endpoints to be exposed as individual serverless functions.
 * Create an api folder in your project root.
 * Move your routes into this folder, each as a separate file.
 * For example, create api/orders.js:
 */
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
