



// 添加容器检测逻辑
const chatbotContainer = document.getElementById('chatbot-container');
const containerExists = !!chatbotContainer;

const cozeWebSDK = new CozeWebSDK.WebChatClient({
    config: {
      type: 'bot',
      bot_id: '7572818026794336290',
      isIframe: false,
    },
    auth: {
      type: 'token',
      token: 'pat_MnXe0eOPBRiud2HbAFOaK13DGlQw98IPoq4VEgNwOqoYzuK2LTmTbYrgDXHrpWVF',
      onRefreshToken: async () => 'token' 
    },
    userInfo: {
      id: 'user',
      url: 'images/logo/favicon.svg',
      nickname: 'User',
    },
    conversations: { isShow: true },
    ui: {
      base: {
        icon: 'images/logo/favicon.svg',
        layout: 'pc',
        lang: 'zh-CN',
        zIndex: containerExists ? 10 : 1000,
        backgroundColor: 'rgba(0, 100, 100, 0.8)',
        
      },
      header: { isShow: true, isNeedClose: !containerExists }, // 根据容器存在性动态设置
      asstBtn: { isNeed: !containerExists }, // 根据容器存在性动态设置
      footer: {
        isShow: true,
        expressionText: '内容均由 AI 生成，仅供参考',
      },
      conversations: { isNeed: true },
      chatBot: {
        title: 'AI医疗助手',
        uploadable: true,
        isNeedAudio: true,
        isNeedFunctionCallMessage: true,
        isNeedAddNewConversation: true,
        isNeedQuote: true,
        width: 800,
        feedback: { isNeedFeedback: true },
        autoOpen: true,
        el: chatbotContainer // 使用检测到的容器元素
      }
    }
  });
