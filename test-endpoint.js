const https = require('https');
const http = require('http');

// Test HTTP endpoint
console.log('Testing HTTP endpoint...');
const httpOptions = {
  hostname: 'pw-gkyr1t3',
  path: '/202501HF01local/identity/connect/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic c2VydmVycG9ydGFscm86VGhlIGJlc3QgaXMgeWV0IHRvIGNvbWUuLi4=',
  },
};

const httpReq = http.request(httpOptions, (res) => {
  console.log(`HTTP Status: ${res.statusCode}`);
  console.log(`HTTP Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('HTTP Response:', data);
    testHttps();
  });
});

httpReq.on('error', (err) => {
  console.log('HTTP Error:', err.message);
  testHttps();
});

const body =
  'grant_type=password&username=test&password=test&scope=openid%20profile%20globallineapi&client_id=serverportalro';
httpReq.write(body);
httpReq.end();

function testHttps() {
  console.log('\nTesting HTTPS endpoint...');

  // Test HTTPS endpoint with SSL validation disabled
  const httpsOptions = {
    hostname: 'pw-gkyr1t3',
    path: '/202501HF01local/identity/connect/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic c2VydmVycG9ydGFscm86VGhlIGJlc3QgaXMgeWV0IHRvIGNvbWUuLi4=',
    },
    rejectUnauthorized: false, // Disable SSL validation
  };

  const httpsReq = https.request(httpsOptions, (res) => {
    console.log(`HTTPS Status: ${res.statusCode}`);
    console.log(`HTTPS Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('HTTPS Response:', data);
    });
  });

  httpsReq.on('error', (err) => {
    console.log('HTTPS Error:', err.message);
  });

  httpsReq.write(body);
  httpsReq.end();
}
