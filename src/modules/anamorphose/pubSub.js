export default class PubSub {
  constructor() {
    if (PubSub.instance) {
      return PubSub.instance;
    }
    PubSub.instance = this;
    this.handlers = [];
  }

  subscribe(event, handler, context) {
    if (typeof context === 'undefined') {
      context = handler;
    }
    let push = true;
    this.handlers.forEach(topic => {
      if (topic.event === event) {
        push = false;
      }
    });
    if (push === true) {
      this.handlers.push({
        event: event,
        handler: handler.bind(context)
      });
    }
  }

  publish(event, args) {
    let callback = true;
    this.handlers.forEach(topic => {
      if (topic.event === event) {
        callback = topic.handler(args);
      }
    });
    return callback;
  }

  remove(event) {
    let numRemove = -1;
    this.handlers.forEach((topic, i) => {
      if (topic.event === event) {
        numRemove = i;
      }
    });
    if (numRemove > -1) {
      this.handlers.splice(numRemove, 1);
    }
  }
}
