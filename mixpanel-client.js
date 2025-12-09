const Mixpanel = require('mixpanel');

// Initialize Mixpanel with your project token
const mixpanel = Mixpanel.init('f75ba30b6a506e568567f4d22713e91c', {verbose:true, debug:true, host: 'api-eu.mixpanel.com'});

module.exports = mixpanel;
