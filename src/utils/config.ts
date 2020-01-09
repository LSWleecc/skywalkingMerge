let serveBaseURL;

if (process.env.NODE_ENV === 'development') {
    serveBaseURL = 'http://ssm.taikang.local:8001';
} else if (process.env.NODE_ENV === 'production') {
    serveBaseURL = 'http://ssm.it.taikang.com';
} else {
    serveBaseURL = 'http://ssm.taikang.test';
}

export default {
    serveBaseURL
};
