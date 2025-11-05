const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// 테스트용 함수
exports.helloWorld = onRequest(async (req, res) => {
  console.log('=== helloWorld 호출됨 ===');
  res.status(200).send("안녕하세요! Firebase Functions가 작동합니다! 🎉");
});

// 카카오톡 견적 문의 전송 함수
exports.sendInquiry = onRequest(async (req, res) => {
  console.log('=== sendInquiry 호출됨 ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS 요청 처리');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    console.log('POST가 아닌 요청:', req.method);
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { products, customerInfo } = req.body;
    
    console.log('받은 데이터:', { products, customerInfo });
    
    if (!products || !customerInfo) {
      console.log('필수 정보 누락');
      res.status(400).json({ 
        success: false, 
        message: '필수 정보가 누락되었습니다.' 
      });
      return;
    }
    
    let message = `━━━━━━━━━━━━━━━\n`;
    message += `📋 찜 목록 견적 문의\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;
    message += `👤 고객 정보\n`;
    message += `   이름: ${customerInfo.name}\n`;
    message += `   연락처: ${customerInfo.phone}\n\n`;
    message += `📦 요청 제품 (총 ${products.length}개)\n\n`;
    
    products.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   📦 제품코드: ${item.code}\n`;
      message += `   📁 카테고리: ${item.mainCategory} / ${item.category}\n`;
      message += `   🔢 수량: ${item.quantity || 1}개\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━\n`;
    message += `⏰ 문의시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`;
    message += `🌐 하예성합판 웹사이트\n`;

    const webhookUrl = 'https://hook.eu2.make.com/eyrrfxye7li0rlbrissk9p051hhllgql';
    
    console.log('Webhook 전송 시작...');
    
    const axiosResponse = await axios.post(webhookUrl, {
      type: 'wishlist_inquiry',
      timestamp: new Date().toISOString(),
      customer: customerInfo,
      products: products,
      totalCount: products.length,
      message: message
    }, {
      timeout: 10000
    });

    console.log('Webhook 응답:', axiosResponse.status);

    res.status(200).json({ 
      success: true, 
      message: '문의가 성공적으로 전송되었습니다.' 
    });

  } catch (error) {
    console.error('=== 오류 발생 ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: '전송 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});