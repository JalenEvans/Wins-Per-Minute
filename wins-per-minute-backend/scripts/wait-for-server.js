import { check } from 'express-validator';
import http from 'http';

const url = "http://localhost:3001-health";
const timeout = 20000; // 20 seconds
const interval = 5000; // 5 seconds

const startTime = Date.now();

function checkServer() {
    http.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Server is up and running!');
            process.exit(0);
        } else {
            retry()
        }
    }).on('error', retry);
}

function retry() {
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > timeout) {
        console.log('⏳ Timed out waiting for server to start.');
        process.exit(1);
    } else {
        setTimeout(checkServer, interval);
    }
}

checkServer();