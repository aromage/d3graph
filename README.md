# watcher


### prettier 적용
VSCode > Preference (cmd+,) 들어가서 'Default Formatter'를 검색
`null` -> `esbenp.prettier-vscode` 로 변경

설정 (Preference)에 들어가서 'editor format on save'를 검색, 체크박스에 체크 해준다.



### 수동 배포
scp -P 30000 -r dist/ root@211.253.8.155:/root/