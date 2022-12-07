const express = require("express");
const port = process.env.PORT || 3001;

const path = require("path");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

// ORIGINAL
const { Client } = require("@notionhq/client");
const databaseId = "3c4c08a90fd34e7da4a8f91e6efe51f3";

const notion = new Client({
  auth: "secret_gb7yt7zDltQ8Q2vrO6AtIFMDtnSbj7izEoywzMMMXnP",
});

var url = require("url");
// ORIGINAL

// CHANGING APP TO ROUTER | CHANGE ROUTER TO APP FOR ORIGINAL USE
app.get("/", (req, res) => {
  var current_url = req.protocol + "://" + req.get("host") + req.originalUrl;
  var address = current_url;
  var tool_category = url.parse(address, true);

  async function getTools() {
    if (tool_category.query.category == null && tool_category.query.p == null) {
      const payload = {
        path: `databases/${databaseId}/query`,
        method: "POST",
        page_size: 100,

        body: {
          sorts: [
            {
              property: "Name",
              direction: "ascending",
            },
          ],
          filter: {
            property: "show_few",
            select: {
              equals: "page1",
            },
          },
        },
      };

      const { results } = await notion.request(payload);
      console.log("MAIN PAGE");

      res.render("index", {
        tool: results,
        tool_category: tool_category.query.category,
        tool_page: tool_category.query.p,
      });
    } else if (
      tool_category.query.category != null &&
      tool_category.query.p == null
    ) {
      console.log("CATEGORY PAGE");
      const payload = {
        path: `databases/${databaseId}/query`,
        method: "POST",

        body: {
          filter: {
            property: "category",
            multi_select: {
              contains: `${tool_category.query.category}`,
            },
          },
        },
      };

      const { results } = await notion.request(payload);

      res.render("index", {
        tool: results,
        tool_category: tool_category.query.category,
        tool_page: tool_category.query.p,
      });
    }
    if (tool_category.query.p != null) {
      console.log("PAGINATION");
      const payload = {
        path: `databases/${databaseId}/query`,
        method: "POST",
        page_size: 100,

        body: {
          sorts: [
            {
              property: "Name",
              direction: "ascending",
            },
          ],
          filter: {
            property: "show_few",
            select: {
              equals: `${tool_category.query.p}`,
            },
          },
        },
      };

      const { results } = await notion.request(payload);

      let tool_page = tool_category.query.p;

      res.render("index", {
        tool: results,
        tool_category: tool_category.query.category,
        tool_page: tool_page.slice(-1),
      });
    }
  }
  getTools();
  // res.render('index')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
