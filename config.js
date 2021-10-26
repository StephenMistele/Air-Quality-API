require('dotenv').config();

const env = process.env.NODE_ENV;
const cred = {
    secretpassword : process.env.API_PASSWORD,
    accountSid : process.env.ACCOUNT_SID,
    authToken : process.env.AUTH_TOKEN
};
const dev = {
    db: {
        DB_HOST : process.env.DB_HOST,
        DB_USER : process.env.DB_USER,
        DB_PASS : process.env.DB_PASSWORD 
    }
};

const test = {
    db: {
        DB_HOST : process.env.TEST_DB_HOST,
        DB_USER : process.env.TEST_DB_USER,
        DB_PASS : process.env.TEST_DB_PASSWORD
    }
};

const config = {
    dev,
    test
};


exports.config = config[env];
exports.env= env;
exports.cred = cred;