const admin = require('firebase-admin');

// Use env variable on Render; fallback to local file during development
const serviceAccount = process.env.FIREBASE_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
  : require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fnof-1-default-rtdb.firebaseio.com/',
});

const db = admin.database();

function saveEvent(event) {
  const ref = db.ref('events');
  const newEventRef = ref.push();
  return newEventRef.set(event);
}

function getEvents() {
  const ref = db.ref('events');
  return ref.once('value').then(snapshot => snapshot.val());
}

module.exports = { saveEvent, getEvents };
