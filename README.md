# Free talker : 메타버스 기반 영어 회화 학습 플랫폼 

현재 server URL 주소와 DB를 다루는 코드가 로컬에서 개발할때와 배포버전에서 달라서 로컬 <-> 서버 왔다갔다 할때 마다 수작업으로 코드 수정해줘야하는 문제를 해결하기 위해서 환경변수를 수정하고 명령어를 분리

CLIENT side
```
npm run build // 기존 react 프로젝트 빌드 명령어
npm run build-dev // 로컬 환경에서 빌드 할떄
npm run build // 배포 서버에서 빌드 할떄
```

SERVER side
아래와 같이 명령어를 수정
```
npm start // 기존 서버 실행
npm run start-dev // 로컬 환경에서 개발할때
npm run start // 배포 버전 서버 실행 할떄
```