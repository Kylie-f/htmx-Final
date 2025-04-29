const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    } else {
        return getAccessToken(oAuth2Client); 
    }
}

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('\n👉 Authorize this app by visiting this URL:\n' + authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question('\nEnter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return reject('Error retrieving access token: ' + err);
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('\n✅ Token saved to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    });
}

async function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    return res.data.items;
}

module.exports = { authorize, listEvents };
