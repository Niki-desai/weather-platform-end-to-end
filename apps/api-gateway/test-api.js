// Quick test script to verify the weather API endpoint
// Run with: node test-api.js

const testEndpoint = async () => {
    try {
        console.log('Testing health endpoint...');
        const healthRes = await fetch('http://localhost:3000/health');
        const healthData = await healthRes.json();
        console.log('Health response:', healthData);

        console.log('\nTesting weather endpoint...');
        const weatherRes = await fetch('http://localhost:3000/api/weather/London');
        const weatherData = await weatherRes.json();
        console.log('Weather response:', weatherData);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testEndpoint();
