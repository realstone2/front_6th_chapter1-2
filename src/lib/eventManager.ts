import { HtmlElementType } from "./types";

// element별로 이벤트 핸들러를 관리하는 WeakMap
const createEventInstance = () => {
  const handlerMap = new Map<HTMLElement, Map<string, EventListener>>();

  function removeEvent(element: HTMLElement, eventType: string, handler: EventListener) {
    const eventMap = handlerMap.get(element);
    if (eventMap) {
      eventMap.delete(eventType);
      if (eventMap.size === 0) {
        handlerMap.delete(element);
      }
    }
  }

  function addEvent<T extends keyof HTMLElementEventMap>(element: HTMLElement, eventType: T, handler: EventListener) {
    // 기존에 등록된 핸들러가 있으면 제거
    const eventMap = handlerMap.get(element) || new Map<string, EventListener>();

    eventMap.set(eventType, handler);
    handlerMap.set(element, eventMap);
  }

  function setupEventListeners(root: HTMLElement) {
    // handlerMap에 등록된 모든 이벤트 타입을 수집
    const eventTypes = new Set<string>();
    for (const eventMap of handlerMap.values()) {
      for (const type of eventMap.keys()) {
        eventTypes.add(type);
      }
    }

    // 각 이벤트 타입마다 위임 방식으로 리스너 등록
    eventTypes.forEach((type) => {
      root.addEventListener(type, (event) => {
        console.log("🚀 ~ root.addEventListener ~ type:", type);

        let target = event.target as HTMLElement | null;
        while (target && target !== root) {
          const eventMap = handlerMap.get(target);
          if (eventMap && eventMap.has(type)) {
            const handler = eventMap.get(type);
            if (handler) handler.call(target, event);
            break;
          }
          target = target.parentElement;
        }
      });
    });
  }

  return {
    removeEvent,
    addEvent,
    setupEventListeners,
  };
};
export const eventInstance = createEventInstance();

export const { addEvent, removeEvent, setupEventListeners } = eventInstance;
