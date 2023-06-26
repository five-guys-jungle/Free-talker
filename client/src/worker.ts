// self는 웹 워커 내부에서 접근 가능한 전역 객체입니다.
// 이 객체는 메시지 수신 및 발신에 사용됩니다.

self.addEventListener('message', function (e) {
    // e.data는 메시지 내용입니다.
    const interval = e.data; // 메인 스크립트에서 받은 메시지 (즉, ping 주기)

    // 일정 주기로 'ping' 메시지를 메인 스크립트에 보냅니다.
    setInterval(() => {
        self.postMessage('ping');
    }, interval);
}, false);

export {}