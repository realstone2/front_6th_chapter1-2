import { addEvent, eventInstance, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { NormalizeVNodeType, PropsType, VNodeType } from "./types.js";

function compareProps(newProps: PropsType, oldProps: PropsType) {
  const propsToAdd: PropsType = {};
  const propsToRemove: string[] = [];

  // 추가하거나 변경된 props 찾기
  for (const [key, value] of Object.entries(newProps)) {
    if (oldProps[key] !== value) {
      propsToAdd[key] = value;
    }
  }

  // 삭제할 props 찾기
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      propsToRemove.push(key);
    }
  }

  return { propsToAdd, propsToRemove };
}

function updateAttributes(target: HTMLElement, originNewProps: PropsType, originOldProps: PropsType) {
  const newProps = { ...originNewProps };
  const oldProps = { ...originOldProps };
  console.log("🚀 ~ updateAttributes ~ newProps:", newProps);

  console.log("🚀 ~ updateAttributes ~ oldProps:", oldProps);
  const { propsToAdd, propsToRemove } = compareProps(newProps, oldProps);

  // 추가/변경된 Props를 반영
  for (const [attr, value] of Object.entries(propsToAdd)) {
    if (attr.startsWith("on") && typeof value === "function") {
      // 기존 이벤트가 있다면 제거
      if (oldProps[attr]) {
        removeEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, oldProps[attr] as EventListener);
      }
      // 새 이벤트 추가
      addEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, value as EventListener);
      continue;
    }

    if (attr === "className") {
      target.setAttribute("class", value);
      continue;
    }
    if (attr === "style" && typeof value === "object") {
      Object.assign(target.style, value);
      continue;
    }

    // disabled, selected, readOnly 등 다른 boolean 속성들
    if (attr === "disabled" || attr === "selected" || attr === "readOnly" || attr === "checked") {
      console.log("🐶 jindol log ", "???", attr);
      target[attr] = value;
      if (value) {
        target.setAttribute(attr.toLowerCase(), "");
      } else {
        target.removeAttribute(attr.toLowerCase());
      }
      continue;
    }

    if (typeof value === "boolean") {
      target[attr] = value;
      continue;
    }

    target.setAttribute(attr, value);
  }

  // 삭제할 props 처리
  for (const attr of propsToRemove) {
    if (attr.startsWith("on")) {
      removeEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, oldProps[attr] as EventListener);
      continue;
    }
    if (attr === "className") {
      target.removeAttribute("class");
      continue;
    }

    target.removeAttribute(attr);
  }
}

export function updateElement(
  parentElement: Element,
  newNode: NormalizeVNodeType,
  oldNode: NormalizeVNodeType,
  index = 0,
) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }
  // 3. 텍스트 노드 업데이트
  if (typeof newNode === "string" || typeof oldNode === "string") {
    if (newNode != oldNode) {
      parentElement.replaceChild(document.createTextNode(newNode.toString()), parentElement.childNodes[index]);
    }
    return;
  }
  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  // - 속성 업데이트
  const element = parentElement.childNodes[index] as HTMLElement;
  updateAttributes(element, newNode.props || {}, oldNode.props || {});
  // - 자식 노드 재귀적 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(element, newChildren[i], oldChildren[i], i);
  }
}
