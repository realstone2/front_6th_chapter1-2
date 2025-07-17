import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import { VNodeType } from "./types";

// 이전 VNode를 저장할 맵 (컨테이너별)
const containerVNodeMap = new WeakMap<HTMLElement, VNodeType>();

export function renderElement(vNode: VNodeType, container: HTMLElement) {
  // vNode를 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전에 렌더링한 VNode가 있는지 확인
  const prevVNode = containerVNodeMap.get(container);

  if (!prevVNode) {
    // 최초 렌더링
    const element = createElement(normalizedVNode);
    container.innerHTML = "";
    container.appendChild(element);
  } else {
    // 리렌더링
    updateElement(container, normalizedVNode, prevVNode, 0);
  }

  // 현재 VNode 저장
  containerVNodeMap.set(container, normalizedVNode);

  // 이벤트 위임 등록
  setupEventListeners(container);
}
