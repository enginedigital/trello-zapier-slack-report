/**
 * Trello daily reporting bot
 *
 * inputData - the data coming into the Zap
 *  inputData.channel - name of the slack channel to post to
 *  inputData.username - name of the bot
 *  inputData.date - the current day of the week
 *  inputData.boardId - id of the Trello board to post to
 *  inputData.key - Trello api key
 *  inputData.token - Trello api token
 *  inputData.watchList - Trello list to report on (single value OR comma-separated)
 *  inputData.slackUrl - The webhook URL for Slack
 */

const fields = ['channel', 'username', 'date', 'boardId', 'key', 'token', 'watchList', 'slackUrl'];
for (const field of fields) {
  if ((inputData[field] || '').length < 1) {
    throw new Error(`The input data requires that the "${field}" field is filled in.`);
  }
}

const payload = {
  channel: inputData.channel,
  username: inputData.username,
  pretext: `It's ${inputData.date}! This is what's going on right now`,
  text: inputData.text,
  icon_emoji: ':robot_face:',
  color: 'good',
  fields: []
};

const boardId = inputData.boardId;
const key = inputData.key;
const token = inputData.token;
const watchList = inputData.watchList.split(',');

// make top level await work outside of Zapier
return (async () => {
  const res = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?cards=open&card_fields=name,dateLastActivity&filter=open&fields=name&key=${key}&token=${token}`);
  const results = await res.json();

  // flatten out the cards
  const cards = results.filter((obj) => watchList.indexOf(obj.id) !== -1)
    .reduce((results, { name, cards }) => {
      results[name] = cards;
      return results;
    }, {});

  // build slack attachments
  const cardFields = Object.entries(cards)
    .map(([name, cards]) => {
      return {
        title: name,
        value: cards.length < 1 ? '- _No tasks in the list..._': cards.map(({ name }) => `- ${name}`).join(`\n`),
        short: false
      };
    });

  payload.fields = cardFields;

  // there was nothing in progress
  if (payload.fields.length < 1) {
    payload.fields = [{
      title: 'Nothing in progress...',
      short: false
    }];

    payload.color = 'warning';
  }

  const slack = await fetch(inputData.slackUrl, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return payload;
})();
