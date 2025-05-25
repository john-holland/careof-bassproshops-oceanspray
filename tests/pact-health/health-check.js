const axios = require('axios');

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'http://pact-broker:9292';

async function checkPactBrokerHealth() {
  try {
    const response = await axios.get(`${PACT_BROKER_URL}/diagnostic/status/heartbeat`);
    if (response.status === 200) {
      console.log('Pact Broker is healthy');
      process.exit(0);
    } else {
      console.error('Pact Broker health check failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking Pact Broker health:', error.message);
    process.exit(1);
  }
}

checkPactBrokerHealth(); 