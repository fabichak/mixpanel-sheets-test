const mixpanel = require('./mixpanel-client');
const fs = require('fs');
const path = require('path');

// Read the buy event data
const buyEventPath = path.join(__dirname, 'json', 'buy-event.txt');
const buyEventData = JSON.parse(fs.readFileSync(buyEventPath, 'utf8'));

// Extract relevant data
const playerId = buyEventData.playerId;
const playerCurrency = buyEventData.playerState.playerCurrency;

// Track a Purchase event
mixpanel.track('Purchase', {
  distinct_id: playerId,
  user_id: playerId,
  transaction_id: `${buyEventData.runSeed}_${buyEventData.timestamp}`,
  revenue: playerCurrency,
  currency: 'GOLD',
  floor_index: buyEventData.currentFloorIndex,
  shop_rerolls: buyEventData.shopState.rerolls
}, function(err) {
  if (err) {
    console.error('❌ Error sending Purchase event:', err);
  } else {
    console.log('✅ Purchase event sent to Mixpanel for player:', playerId);
  }
});
