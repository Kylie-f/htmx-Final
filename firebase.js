const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fnof-1-default-rtdb.firebaseio.com/' // ⚡ Adjust to your database URL!
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
