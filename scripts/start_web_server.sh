#!/bin/bash

# 웹 기반 관제 시스템 시작 스크립트

echo "🌐 웹 기반 로봇 관제 시스템을 시작합니다..."

# ROS 2 환경 설정
source /opt/ros/humble/setup.bash

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WEB_DIR="$PROJECT_DIR/src/web"

echo "📁 프로젝트 디렉토리: $PROJECT_DIR"
echo "🌐 웹 디렉토리: $WEB_DIR"

# 포트 설정
WEB_PORT=8080
ROSBRIDGE_PORT=9090

# 이미 실행 중인 서버 확인
if lsof -Pi :$WEB_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  포트 $WEB_PORT가 이미 사용 중입니다."
    read -p "기존 서버를 종료하고 계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "python3.*http.server.*$WEB_PORT" || true
        sleep 2
    else
        echo "❌ 시작을 취소합니다."
        exit 1
    fi
fi

# ROSBridge 서버 시작 확인
if ! lsof -Pi :$ROSBRIDGE_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "🔗 ROSBridge 서버를 시작합니다..."
    ros2 launch rosbridge_server rosbridge_websocket_launch.xml &
    ROSBRIDGE_PID=$!
    echo "ROSBridge PID: $ROSBRIDGE_PID"
    sleep 3
else
    echo "✅ ROSBridge 서버가 이미 실행 중입니다."
fi

# tf2_web_republisher 시작
echo "🔄 TF2 Web Republisher를 시작합니다..."
ros2 run tf2_web_republisher tf2_web_republisher &
TF_REPUBLISHER_PID=$!
echo "TF2 Web Republisher PID: $TF_REPUBLISHER_PID"

# 웹 서버 시작
echo "🌐 웹 서버를 시작합니다 (포트: $WEB_PORT)..."
cd "$WEB_DIR"
python3 -m http.server $WEB_PORT &
WEB_SERVER_PID=$!
echo "웹 서버 PID: $WEB_SERVER_PID"

# 잠시 대기
sleep 2

# 브라우저에서 열기
if command -v open >/dev/null 2>&1; then
    # macOS
    open "http://localhost:$WEB_PORT"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "http://localhost:$WEB_PORT"
else
    echo "수동으로 브라우저를 열어 http://localhost:$WEB_PORT 에 접속하세요."
fi

echo ""
echo "🎉 웹 기반 관제 시스템이 시작되었습니다!"
echo "🌐 웹 인터페이스: http://localhost:$WEB_PORT"
echo "🔗 ROSBridge: ws://localhost:$ROSBRIDGE_PORT"
echo ""
echo "시스템을 종료하려면 Ctrl+C를 누르세요."

# PID 파일 생성
echo $WEB_SERVER_PID > /tmp/robot_control_web.pid
echo $TF_REPUBLISHER_PID >> /tmp/robot_control_web.pid
if [ ! -z "$ROSBRIDGE_PID" ]; then
    echo $ROSBRIDGE_PID >> /tmp/robot_control_web.pid
fi

# 종료 시그널 핸들러
cleanup() {
    echo ""
    echo "🛑 시스템을 종료합니다..."
    kill $WEB_SERVER_PID 2>/dev/null || true
    kill $TF_REPUBLISHER_PID 2>/dev/null || true
    if [ ! -z "$ROSBRIDGE_PID" ]; then
        kill $ROSBRIDGE_PID 2>/dev/null || true
    fi
    rm -f /tmp/robot_control_web.pid
    echo "✅ 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 포어그라운드에서 대기
wait