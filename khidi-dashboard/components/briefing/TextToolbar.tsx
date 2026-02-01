'use client';

import { useState, useEffect, useCallback } from 'react';

const highlightColors = [
  { color: '#fef08a', name: '노랑' },
  { color: '#bbf7d0', name: '초록' },
  { color: '#bfdbfe', name: '파랑' },
  { color: '#fbcfe8', name: '분홍' },
  { color: '#fed7aa', name: '주황' },
];

export default function TextToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);

  const showToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setCurrentSelection(selection);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 45 + window.scrollY,
      });
      setIsVisible(true);
    }
  }, []);

  const hideToolbar = useCallback((e: MouseEvent) => {
    const toolbar = document.getElementById('text-toolbar');
    const target = e.target as HTMLElement;
    if (toolbar && !toolbar.contains(target) &&
        target.tagName !== 'MARK' && target.tagName !== 'STRONG' && target.tagName !== 'EM') {
      setIsVisible(false);
    }
  }, []);

  const handleFormattedClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK' || target.tagName === 'STRONG' || target.tagName === 'EM') {
      e.stopPropagation();
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        setCurrentSelection(selection);
        const rect = target.getBoundingClientRect();
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 45 + window.scrollY,
        });
        setIsVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    const contentAreas = document.querySelectorAll('.content-area');
    contentAreas.forEach(area => {
      area.addEventListener('mouseup', showToolbar as EventListener);
      area.addEventListener('click', handleFormattedClick as EventListener);
    });

    document.addEventListener('mousedown', hideToolbar);

    return () => {
      contentAreas.forEach(area => {
        area.removeEventListener('mouseup', showToolbar as EventListener);
        area.removeEventListener('click', handleFormattedClick as EventListener);
      });
      document.removeEventListener('mousedown', hideToolbar);
    };
  }, [showToolbar, hideToolbar, handleFormattedClick]);

  const applyHighlight = (color: string) => {
    if (!currentSelection || currentSelection.toString().trim().length === 0) return;

    const range = currentSelection.getRangeAt(0);

    // 단일 텍스트 노드 내에서만 하이라이트 적용
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    // 같은 텍스트 노드 내에서만 하이라이트 허용
    if (startContainer !== endContainer || startContainer.nodeType !== Node.TEXT_NODE) {
      alert('한 문장 내에서만 하이라이트할 수 있습니다.');
      setIsVisible(false);
      window.getSelection()?.removeAllRanges();
      return;
    }

    const wrapper = document.createElement('mark');
    wrapper.style.backgroundColor = color;
    wrapper.style.padding = '0 2px';
    wrapper.style.borderRadius = '2px';

    try {
      range.surroundContents(wrapper);
    } catch {
      // 실패 시 조용히 무시
      console.warn('하이라이트 적용 실패');
    }

    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const findParentTag = (el: Element | null, tag: string): Element | null => {
    while (el && !el.classList?.contains('content-area')) {
      if (el.tagName === tag) return el;
      el = el.parentElement;
    }
    return null;
  };

  const applyFormat = (type: 'bold' | 'italic' | 'remove') => {
    if (!currentSelection || currentSelection.toString().trim().length === 0) return;

    const range = currentSelection.getRangeAt(0);

    let node: Node | Element | null = range.commonAncestorContainer;
    if (node.nodeType === 3) node = (node as Node).parentElement;

    const tagMap: Record<string, string> = { bold: 'STRONG', italic: 'EM' };
    const targetTag = tagMap[type];

    if (type === 'bold' || type === 'italic') {
      const existingTag = findParentTag(node as Element, targetTag);

      if (existingTag) {
        // 서식 제거 (토글)
        const parent = existingTag.parentNode;
        if (parent) {
          while (existingTag.firstChild) {
            parent.insertBefore(existingTag.firstChild, existingTag);
          }
          parent.removeChild(existingTag);
        }
      } else {
        // 단일 텍스트 노드 내에서만 서식 적용
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        if (startContainer !== endContainer || startContainer.nodeType !== Node.TEXT_NODE) {
          alert('한 문장 내에서만 서식을 적용할 수 있습니다.');
          setIsVisible(false);
          window.getSelection()?.removeAllRanges();
          return;
        }

        // 서식 적용
        const wrapper = document.createElement(targetTag === 'STRONG' ? 'strong' : 'em');
        try {
          range.surroundContents(wrapper);
        } catch {
          console.warn('서식 적용 실패');
        }
      }
    } else if (type === 'remove') {
      // 모든 서식 제거
      const tagsToRemove = ['MARK', 'STRONG', 'EM'];
      for (const tag of tagsToRemove) {
        const found = findParentTag(node as Element, tag);
        if (found) {
          const parent = found.parentNode;
          if (parent) {
            while (found.firstChild) {
              parent.insertBefore(found.firstChild, found);
            }
            parent.removeChild(found);
          }
        }
      }
    }

    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  if (!isVisible) return null;

  return (
    <div
      id="text-toolbar"
      className="fixed bg-gray-900 text-white rounded-lg shadow-xl px-1 py-1 flex items-center gap-1 z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
    >
      {highlightColors.map(({ color, name }) => (
        <button
          key={color}
          onClick={() => applyHighlight(color)}
          className="w-6 h-6 rounded hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          title={name}
        />
      ))}
      <div className="w-px h-5 bg-gray-600 mx-1" />
      <button
        onClick={() => applyFormat('bold')}
        className="px-2 py-1 hover:bg-gray-700 rounded text-sm font-bold"
        title="굵게"
      >
        B
      </button>
      <button
        onClick={() => applyFormat('italic')}
        className="px-2 py-1 hover:bg-gray-700 rounded text-sm italic"
        title="기울임"
      >
        I
      </button>
      <div className="w-px h-5 bg-gray-600 mx-1" />
      <button
        onClick={() => applyFormat('remove')}
        className="px-2 py-1 hover:bg-gray-700 rounded text-xs text-gray-400"
        title="서식 제거"
      >
        ✕
      </button>
    </div>
  );
}
