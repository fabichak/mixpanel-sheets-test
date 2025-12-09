const mixpanel = require('./mixpanel-client');

// Example 1: Track a simple event with callback
console.log('Sending test event...');
mixpanel.track('text_event', {
  distinct_id: 'test_123',
  property1: 'value1',
  property2: 'value2'
}, function(err) {
  if (err) {
    console.error('Error sending event:', err);
  } else {
    console.log('✅ Test event sent successfully!');
  }

  // Example 2: Set user profile (optional but recommended)
  console.log('Setting user profile...');
  mixpanel.people.set('user_123', {
    $name: 'Test User',
    $email: 'test@example.com',
    plan: 'premium'
  }, function(err) {
    if (err) {
      console.error('Error setting user profile:', err);
    } else {
      console.log('✅ User profile set successfully!');
    }

    // Keep process alive long enough for HTTP requests to complete
    console.log('Waiting for requests to complete...');
    setTimeout(function() {
      console.log('✅ All operations completed!');
      process.exit(0);
    }, 2000);
  });
});
