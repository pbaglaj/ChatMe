class NotificationService {
  constructor(sseClientsMap) {
    this.clients = sseClientsMap;
  }

  send = (userId, message) => {
    const client = this.clients.get(userId);
    if (client) {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  }
}

module.exports = NotificationService;