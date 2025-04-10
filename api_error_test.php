<?php
// API Error Test Tool
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>API Error Test Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        button:hover { background: #45a049; }
        input[type="text"] { padding: 8px; width: 100%; margin-bottom: 10px; }
        .response { max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>API Error Test Tool</h1>

        <div class="card">
            <h2>1. Test Login Endpoint</h2>
            <p>This will test the /api/login_check endpoint with various credentials</p>
            
            <form id="loginForm" method="post">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" value="student@bigproject.com">
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="text" id="password" name="password" value="Password123@">
                </div>
                <div>
                    <label for="endpoint">API Endpoint:</label>
                    <input type="text" id="endpoint" name="endpoint" value="/api/login_check">
                </div>
                <button type="button" onclick="testLogin()">Test Login</button>
            </form>
            
            <div id="loginResponse" class="response">
                <p>Response will appear here...</p>
            </div>
        </div>

        <div class="card">
            <h2>2. Test Other API Endpoints</h2>
            <form id="apiForm" method="post">
                <div>
                    <label for="apiEndpoint">API Endpoint:</label>
                    <input type="text" id="apiEndpoint" name="apiEndpoint" value="/api/users">
                </div>
                <div>
                    <label for="token">JWT Token (if needed):</label>
                    <input type="text" id="token" name="token" placeholder="Paste token here">
                </div>
                <button type="button" onclick="testAPI('GET')">GET</button>
                <button type="button" onclick="testAPI('POST')">POST</button>
                <button type="button" onclick="testAPI('PUT')">PUT</button>
                <button type="button" onclick="testAPI('DELETE')">DELETE</button>
            </form>
            
            <div id="apiResponse" class="response">
                <p>Response will appear here...</p>
            </div>
        </div>
    </div>

    <script>
        function testLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const endpoint = document.getElementById('endpoint').value;
            const responseEl = document.getElementById('loginResponse');
            
            responseEl.innerHTML = '<p>Testing login...</p>';
            
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                const status = response.status;
                return response.text().then(text => {
                    try {
                        return { status, data: JSON.parse(text) };
                    } catch (e) {
                        return { status, data: text };
                    }
                });
            })
            .then(({ status, data }) => {
                let html = `<h3>Status: ${status}</h3>`;
                html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
                
                if (status === 200 && data.token) {
                    document.getElementById('token').value = data.token;
                    html += '<p class="success">✓ Login successful! Token copied to API test.</p>';
                }
                
                responseEl.innerHTML = html;
            })
            .catch(error => {
                responseEl.innerHTML = `<h3 class="error">Error</h3><pre>${error.toString()}</pre>`;
            });
        }
        
        function testAPI(method) {
            const endpoint = document.getElementById('apiEndpoint').value;
            const token = document.getElementById('token').value;
            const responseEl = document.getElementById('apiResponse');
            
            responseEl.innerHTML = `<p>Testing ${method} ${endpoint}...</p>`;
            
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            fetch(endpoint, {
                method: method,
                headers: headers
            })
            .then(response => {
                const status = response.status;
                return response.text().then(text => {
                    try {
                        return { status, data: JSON.parse(text) };
                    } catch (e) {
                        return { status, data: text };
                    }
                });
            })
            .then(({ status, data }) => {
                let html = `<h3>Status: ${status}</h3>`;
                html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
                responseEl.innerHTML = html;
            })
            .catch(error => {
                responseEl.innerHTML = `<h3 class="error">Error</h3><pre>${error.toString()}</pre>`;
            });
        }
    </script>
</body>
</html> 