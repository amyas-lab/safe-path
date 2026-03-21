const axios = require('axios');
const { spawn } = require('child_process');

async function testTrackAsia() {
    console.log('\n[1] --- Testing TrackAsia Routing API ---');
    const url = 'https://maps.track-asia.com/route/v1/moto/106.694945,10.769034;106.702758,10.772596?geometries=geojson&overview=full&key=40d56414265e44f1d9b1774073117a870e';
    try {
        const { data } = await axios.get(url);
        console.log('✅ TrackAsia Response SUCCESS!');
        console.log(`   Distance: ${data.routes[0].distance} meters`);
        console.log(`   Duration: ${data.routes[0].duration} seconds`);
        console.log(`   Number of Coordinates in Path: ${data.routes[0].geometry.coordinates.length}`);
    } catch (e) {
        console.error('❌ TrackAsia Error:', e.response?.data || e.message);
    }
}

async function testFirebaseTwilio() {
    console.log('\n[2] --- Testing Firebase Backend + Twilio SMS Endpoint ---');
    try {
        const { data } = await axios.post('http://localhost:5001/solo-guardian/us-central1/sendEmergencyAlert', {
            location: { latitude: 10.769, longitude: 106.695 },
            contactPhone: '+84987654321',
            userName: 'Mai Anh'
        });
        console.log('✅ Firebase/Twilio Response SUCCESS:', data);
    } catch (e) {
        console.error('❌ Firebase/Twilio Expected Error (since Twilio SID is fake placeholder):');
        console.error('   ', e.response?.data?.error || e.message);
    }
}

async function run() {
    console.log('Starting Local Firebase Mock Server on Port 5001...');
    const server = spawn('node', ['server.js']);
    
    // Wait for server to bind port
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testTrackAsia();
    await testFirebaseTwilio();

    console.log('\nTests completed. Closing server...');
    server.kill();
    process.exit(0);
}

run();
