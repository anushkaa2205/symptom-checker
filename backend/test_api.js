const history = [
  { sender: 'user', text: 'i am having stomach ache and was feeling lke i might vomit' },
  { sender: 'bot', text: 'I am sorry to hear that. How long have you been feeling this way?' }
];
const data = JSON.stringify({ message: 'since yesterday', history });

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: data
}).then(res => res.json().then(j => ({status: res.status, body: j})))
  .then(console.log)
  .catch(console.error);
