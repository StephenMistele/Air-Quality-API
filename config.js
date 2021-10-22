require('dotenv').config();

const env = process.env.NODE_ENV;

const dev = {
    db: {
        DB_HOST : process.env.DB_HOST,
        DB_USER : process.env.DB_USER,
        DB_PASS : process.env.DB_PASSWORD 
    }
}

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