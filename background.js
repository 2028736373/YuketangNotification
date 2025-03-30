console.log('Background service worker loaded');

const triggeredObjects = new Set();
const SCKEY = ''; // 在此处填写你的Server酱SCKEY

// 消息监听器（适配 Manifest V3 异步规范）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  // 使用 Promise 处理异步操作
  const handleMessage = async () => {
    if (message.type === 'triggerReminder' && !triggeredObjects.has(message.id)) {
      triggeredObjects.add(message.id);
      await sendServerChanNotification(message.content);
      return { status: 'success' };
    }
    return { status: 'ignored' };
  };

  // 保持长连接等待异步操作完成
  handleMessage().then(sendResponse);
  return true; // 必须返回 true 以保持异步通道
});

// 发送 Server 酱通知
async function sendServerChanNotification(content) {
  const apiUrl = `https://sctapi.ftqq.com/${SCKEY}.send`;
  const payload = {
    title: '雨课堂新题目提醒',
    desp: `检测到新的课堂题目：\n\n${content}`
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Server酱通知发送结果：', result);
    if (result.code !== 200) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('发送通知失败：', error);
    throw error; // 向上抛出错误以便调用方处理
  }
}