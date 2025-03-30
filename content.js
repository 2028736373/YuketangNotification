// content.js
const processedElements = new Set();

function findMatchingElements() {
  const items = document.querySelectorAll('.timeline__item.J_slide, .timeline__item.J_slide.active');
  const matchingElements = [];

  items.forEach(item => {
    if (item.textContent.includes('正在放映')) {
      const problemElements = item.querySelectorAll('.timeline__ppt.problem');
      problemElements.forEach(element => {
        matchingElements.push({
          element,
          content: element.textContent.trim().substring(0, 200) // 截取前200个字符
        });
      });
    }
  });

  return matchingElements;
}

function checkAndSendMessage() {
  const matchingElements = findMatchingElements();
  matchingElements.forEach(({ element, content }) => {
    if (!processedElements.has(element)) {
      chrome.runtime.sendMessage({ 
        type: 'triggerReminder',
        id: element.id || Date.now().toString(),
        content: content
      });
      processedElements.add(element);
    }
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        checkAndSendMessage();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// 主入口
(function main() {
  checkAndSendMessage();
  setupMutationObserver();
})();