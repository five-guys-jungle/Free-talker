# Free_talker_test

현재까지 작성한 코드와 제가 코드 실행하는 방법 정리하여 올립니다.

## Express 서버하고 react 코드 연결하기
1. client 디렉토리 안에서 코드 수정 발생
2. client 경로에서 'npm run build' 실행
    ~~~ 
    cd client/         // client 디렉토리로 이동
    npm run build      // client 디렉토리안에 build 디렉토리가 생기고 정적파일들 생성
    ~~~ 
3. 서버측 코드에서 위에서 생긴 build 디렉토리를 정적파일 디렉토리로 설정
    ~~~ typescript
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build')));
    ~~~
4. 유저의 모든 요청에 대해서 index.html을 serve 하도록 설정(option)
    ~~~ typescript
    // Put all requests route index.html
    app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
    ~~~
    만약 각각의 다른 요청에 대해서 다른 정적파일을 서빙 하고 싶다면 코드 수정 필요
    예를 들어 'http://localhost:5000/'에 접속했을때만 index.html을 serve 하고 싶다면 '*' -> '/' 로 변경. 
5. server 디렉토리 경로로 이동 or 새로운 터미널을 open 해서 server 디렉토리 안으로 이동
    ~~~
    cd server/         // server 디렉토리로 이동
    ~~~
6. 서버 실행
    ~~~
    npm start
    ~~~
    - 기존의 js로 작성된 서버 실행 하던것처럼 'node server.js' 로 실행해도 상관은 없는것 같습니다만 그려려면 typescript로 작성된 서버측 코드를 javascript로 변환(컴파일)하고 실행해야되는것으로 알고 있습니다.
    그래서 ts-node 라는 패키지를 설치하고 package.json 파일에 다음과 같이 추가 하면 'npm start' 명령어로 서버측 typescript 코드를 바로 실행 할 수 있습니다.
    ~~~ json
    "scripts": {
        "start": "ts-node server.ts",
    },
    ~~~
