import { EventEmitter } from "events";

class EventBus extends EventEmitter {}

const eventBus = new EventBus();
eventBus.setMaxListeners(50); // Prevent memory leak warnings

export default eventBus;