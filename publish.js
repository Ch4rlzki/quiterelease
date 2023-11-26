const ghpages = require("gh-pages");

ghpages.publish("dist", {
    branch: "pages"
}).then(() => {
    console.log("OK!");
}).catch((err) => {
    console.log(err);
})