// utils/AppSigner.js
const crypto = require('crypto');

class AppSigner {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  sign(request) {
    const method = request.method.toUpperCase();
    const uri = request.uri;
    const headers = request.headers;
    const params = request.params;
    const timestamp = request.timestamp;

    const canonicalQueryString = this.buildCanonicalQueryString(params);
    const canonicalHeaders = this.buildCanonicalHeaders(headers);
    const canonicalRequest = `${method}\n${uri}\n${canonicalQueryString}\n${canonicalHeaders}`;
    
    const signingKey = this.calculateSigningKey(this.secretKey, timestamp);
    const signature = this.calculateSignature(signingKey, canonicalRequest);

    const authorization = `bce-auth-v1/${this.apiKey}/${timestamp}/1800/host/${signature}`;
    
    return {
      headers: {
        'Authorization': authorization,
        'x-bce-request-id': this.generateRequestId(),
        'x-bce-date': timestamp,
      }
    };
  }

  buildCanonicalQueryString(params) {
    // 实现根据 params 构建规范化的查询字符串逻辑
    // 返回形如 key1=value1&key2=value2 的字符串
    // 可以使用类似 querystring.stringify 方法（具体方法根据所用的框架/库而定）
  }

  buildCanonicalHeaders(headers) {
    // 实现根据 headers 构建规范化的头部字符串逻辑
    // 返回形如 key1:value1\nkey2:value2\n 的字符串
    // 可以使用 Object.entries(headers) 等方法
  }

  calculateSigningKey(secretKey, timestamp) {
    // 实现计算签名密钥逻辑
    // 返回签名密钥
  }

  calculateSignature(signingKey, canonicalRequest) {
    // 实现计算签名逻辑
    // 返回签名
  }

  generateRequestId() {
    // 实现生成请求 ID 逻辑
    // 返回请求 ID
  }
}

module.exports = AppSigner;
