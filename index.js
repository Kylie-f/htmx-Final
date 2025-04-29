const express = require('express');
const cors = require('cors');
const { authorize, listEvents } = require('./google');
const { saveEvent } = require('./firebase'); // Firebase save
const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve frontend files

// Get events from Google Calendar
app.get('/api/events', async (req, res) => {
  try {
    const auth = await authorize();
    const events = await listEvents(auth);

    const eventSummaries = events.map(event => ({
      summary: event.summary,
      start: event.start.dateTime || event.start.date
    }));

    res.json(eventSummaries);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send('Failed to fetch events');
  }
});

// Save new event to Firebase
app.post('/api/addevent', async (req, res) => {
  try {
    const { title, start } = req.body;
    await saveEvent({ title, start });
    res.status(200).send('Event saved to Firebase');
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).send('Failed to save event');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
