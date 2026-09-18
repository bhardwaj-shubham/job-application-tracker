import "dotenv/config";
import env from "./src/config/env.js";

import app from "./src/app.js";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`server listening on PORT:${env.PORT}`);
});
