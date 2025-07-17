import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";
import { VNodeType } from "./types";

export function renderElement(vNode: VNodeType, container: HTMLElement) {
  // vNode를 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // createElement로 노드 생성
  const element = createElement(normalizedVNode);

  // 기존 컨테이너 비우고 새 노드 삽입
  container.innerHTML = "";
  container.appendChild(element);

  // 이벤트 위임 등록
  setupEventListeners(container);
}
