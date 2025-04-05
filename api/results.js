import { renderFile } from "ejs";
import { resolve } from "path";

export default async function handler(req, res) {
  try {
    // Get and log the full query object
    console.log("Full query:", req.query);

    const address = req.query.address;
    console.log("Address value:", address);

    if (!address) {
      console.log("No address provided, redirecting to home");
      return res.redirect("/");
    }

    // Get the template path
    const templatePath = resolve(process.cwd(), "site/results.ejs");
    console.log("Template path:", templatePath);

    // Render with explicit data object
    const html = await renderFile(templatePath, {
      address: address,
    });

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("Error details:", error);
    res.redirect("/?error=rendering_failed");
  }
}
