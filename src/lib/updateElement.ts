import { addEvent, eventInstance, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { PropsType } from "./types.js";

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
    } else if (attr === "style" && typeof value === "object") {
      Object.assign(target.style, value);
    } else {
      target.setAttribute(attr, value);
    }
  }

  // 삭제할 props 처리
  for (const attr of propsToRemove) {
    if (attr.startsWith("on")) {
      removeEvent(target, attr.slice(2).toLowerCase() as keyof HTMLElementEventMap, oldProps[attr] as EventListener);
    } else {
      target.removeAttribute(attr);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {}
