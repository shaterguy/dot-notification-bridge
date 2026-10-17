공개용 템플릿 안내: 아래 작업명은 예시이며 실제 설치본과 구분합니다. 채널 ID 치환과 독립 검증 전 실행하지 않습니다.

# 기존 알림업로드에 연결

기존 ‘알림업로드’의 5개 액션은 그대로 두고 두 액션만 추가합니다.

1. 맨 앞에 Task → Perform Task를 추가합니다.
   Name: dot 사용자 알림 신호 v0.1.0-dev5
   Priority: %priority+1
   Parameter 1: retry
   Continue Task After Error: 켬
   Stop: 끔
2. 맨 마지막 ‘%NotifyUploaded=%upload_version’ 뒤에 같은 Perform Task를 추가합니다. Parameter 1만 enqueue로 바꿉니다. 나머지 설정은 같습니다.

최종 순서는 retry → Stop(NotifyChanged 미설정) → Stop(NotifyChanged=NotifyUploaded) → upload_version=NotifyChanged → GD Upload → NotifyUploaded=upload_version → enqueue입니다.
GD Upload의 Continue Task After Error는 끈 상태를 유지합니다. 업로드가 실패하면 끝의 enqueue로 진행하지 않아야 합니다. 앞의 retry가 전송하는 것은 이전에 성공한 업로드의 미전송 신호일 수 있습니다.
20분 시간 프로필은 수정하지 않습니다. 기존 Webhook용 dev4 작업을 새로 연결하거나 기존 설정 파일을 다시 입력하지 않습니다. Tasker에서 이 작업의 Collision Handling은 동일 작업의 중첩 실행을 피하도록 현재 설정을 확인해야 하며, 자동화 수신 측에서도 batch 중복을 처리합니다.

신호 실패는 성공한 업로드 파일을 다시 올리지 않고 pending만 보존합니다. 이후 기존 업로드 작업이 실행될 때 앞의 retry가 재시도합니다. timeout 뒤 서버가 이미 수락한 경우 중복 신호가 생길 수 있습니다. 수신자는 이를 동일 batch로 억제하며 exactly-once를 보장하지 않습니다.
