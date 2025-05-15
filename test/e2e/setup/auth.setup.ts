import dotenv from "dotenv";

async function globalSetup() {
    // Load test env vars
    dotenv.config({ path: ".env.test" });
}

export default globalSetup;
